'use server'

import { db } from '@/db'
import { feedbackLoop } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function saveFeedbackAction(formData: FormData) {
  const analysisReportId = formData.get('analysisReportId') as string
  const fieldCorrected = formData.get('fieldCorrected') as string
  const oldValue = formData.get('oldValue') as string
  const newValue = formData.get('newValue') as string
  const userNotes = formData.get('userNotes') as string

  if (!analysisReportId || !fieldCorrected) {
    return { success: false, error: 'Missing required fields' }
  }

  try {
    await db.insert(feedbackLoop).values({
      analysisReportId,
      fieldCorrected,
      oldValue,
      newValue,
      userNotes,
      aiLearned: false,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Feedback error:', error)
    return { success: false, error: error.message }
  }
}
