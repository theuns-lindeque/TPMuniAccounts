import { db } from './src/db/index';
import { invoices, recoveries } from './src/db/schema';
import fs from 'fs';
import path from 'path';

// Manual env loading for tsx
const envPath = '/Users/theunslindeque/Downloads/Cursor Folder/TPMuniAccounts/.env';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
      process.env[match[1]] = value;
    }
  });
}

async function verifyUploadPaths() {
  try {
    console.log('--- Verifying Upload Paths ---');
    if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI not found');
    
    const buildingId = `verify-${Date.now()}`;
    
    console.log('Testing Invoice (Bill) Insertion...');
    await db.insert(invoices).values({
      utilityAccountId: buildingId,
      billingPeriod: new Date().toISOString().split('T')[0],
      amount: '123.45',
      pdfUrl: 'https://storage.googleapis.com/test-bucket/bill.pdf'
    });
    console.log('Invoice insertion successful.');
    
    console.log('Testing Recovery Insertion (with PDF)...');
    await db.insert(recoveries).values({
      buildingId: buildingId,
      tenantName: 'Verification Tenant',
      amountBilled: '67.89',
      period: new Date().toISOString().split('T')[0],
      pdfUrl: 'https://storage.googleapis.com/test-bucket/recovery.pdf'
    });
    console.log('Recovery (PDF) insertion successful.');
    
    console.log('Testing Recovery Insertion (CSV style - no PDF)...');
    await db.insert(recoveries).values({
      buildingId: buildingId,
      tenantName: 'CSV Tenant',
      amountBilled: '10.00',
      period: new Date().toISOString().split('T')[0],
      pdfUrl: null
    });
    console.log('Recovery (CSV) insertion successful.');

    console.log('--- ALL VERIFICATIONS PASSED ---');
    process.exit(0);
  } catch (error: any) {
    console.error('Verification Failed:', error.message);
    process.exit(1);
  }
}

verifyUploadPaths();
