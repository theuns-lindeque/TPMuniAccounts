'use server'

import { db } from '@/db'
import { invoices, recoveries } from '@/db/schema'
import { LlamaParse } from 'llama-parse'
import { parse } from 'csv-parse/sync'
import { inngest } from '@/inngest/client'
import { getMe } from './users'

interface CSVRecord {
  Tenant?: string
  name?: string
  Amount?: string
  total?: string
  Basic?: string
  Usage?: string
  Demand?: string
  kVa?: string
  Solar?: string
  SolarProduced?: string
}

export async function ingestAction(formData: FormData) {
  const user = await getMe();
  console.log('Ingest Action - Full User Object:', JSON.stringify(user, null, 2));
  
  if (!user) {
    console.log('Ingest Action - No user found in session');
    return { success: false, error: 'Unauthorized: No active session found.' }
  }

  if (!['admin', 'editor'].includes(user.role)) {
    console.log('Ingest Action - Insufficient Permissions. User Role:', user.role);
    return { success: false, error: `Unauthorized: You do not have permission to ingest data. Your role is ${user.role || 'none'}.` }
  }

  const files = formData.getAll('files') as File[]
  const buildingId = formData.get('buildingId') as string
  const documentType = (formData.get('documentType') as string) || 'bill'
  const apiKey = process.env.LLAMA_CLOUD_API_KEY

  if (!apiKey) {
    return { success: false, error: 'LLAMA_CLOUD_API_KEY is missing in .env' }
  }

  try {
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Upload to GCS
      const { Storage } = await import('@google-cloud/storage')
      const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      })
      const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || '')
      const gcsFilePath = `${buildingId}/${file.name}`
      const gcsFile = bucket.file(gcsFilePath)
      await gcsFile.save(buffer, {
        metadata: { contentType: file.type },
      })
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsFilePath}`

      if (file.name.endsWith('.pdf')) {
        if (documentType === 'recovery') {
          // Handle PDF Recovery Report
          await db.insert(recoveries).values({
            buildingId: buildingId,
            tenantName: 'Bulk PDF Recovery', // Placeholder
            amountBilled: '0', 
            period: new Date().toISOString().split('T')[0],
            pdfUrl: publicUrl,
          })
        } else {
          // Process Municipal Bill with LlamaParse
          const parser = new LlamaParse({ 
            apiKey,
          })
          
          const result = await parser.parseFile(file)
          console.log('Ingest Action - LlamaParse result:', JSON.stringify(result, null, 2));
          // Placeholder for real AI extraction
          await db.insert(invoices).values({
            utilityAccountId: buildingId,
            billingPeriod: new Date().toISOString().split('T')[0],
            amount: '0', 
            basicCharge: '0',
            usageCharge: '0',
            demandCharge: '0',
            usage: '0',
            pdfUrl: publicUrl,
          })
          console.log('Ingest Action - Invoice record inserted for PDF.');
        }

      } else if (file.name.endsWith('.csv')) {
        console.log('Ingest Action - Handling CSV file.');
        // Process Tenant Recoveries with csv-parse
        const content = buffer.toString()
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
        }) as CSVRecord[]

        for (const record of records) {
          await db.insert(recoveries).values({
            buildingId: buildingId,
            tenantName: record.Tenant || record.name || 'Unknown',
            amountBilled: record.Amount || record.total || '0',
            basicCharge: record.Basic || '0',
            usageCharge: record.Usage || '0',
            demandCharge: record.Demand || record.kVa || '0',
            solarProduced: record.Solar || record.SolarProduced || '0',
            period: new Date().toISOString().split('T')[0],
            pdfUrl: null, // No PDF for CSV entries
          })
        }
      }
    }

    if (files.length > 0 && buildingId) {
      await inngest.send({
        name: 'app/data.ingested',
        data: {
          buildingId,
          period: new Date().toISOString().split('T')[0],
        },
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Ingestion error:', error)
    return { success: false, error: error.message }
  }
}
