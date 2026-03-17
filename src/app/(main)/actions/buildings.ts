'use server'

import { db } from '@/db'
import { buildings } from '@/db/schema'
import { getMe } from './users'
import { revalidatePath } from 'next/cache'

export async function createBuildingAction(data: {
  name: string
  address?: string
  municipalValue?: string
  region: 'Gauteng' | 'Eastern Cape' | 'Western Cape' | 'Students'
}) {
  const user = await getMe()
  if (!user || !['admin', 'editor'].includes(user.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await db.insert(buildings).values({
      name: data.name,
      address: data.address,
      municipalValue: data.municipalValue,
      region: data.region,
    })
    revalidatePath('/properties')
    return { success: true }
  } catch (error: any) {
    console.error('Create building error:', error)
    return { success: false, error: error.message }
  }
}
