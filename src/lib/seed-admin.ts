import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function seedAdmin() {
  const payload = await getPayload({ config: configPromise })

  const userEmail = 'tlindeque@trueprop.co.za'
  const userPassword = 'L1nd3qu3!@#'

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: userEmail,
      },
    },
  })

  if (existingUsers.docs.length === 0) {
    console.log('Seeding admin user...')
    await payload.create({
      collection: 'users',
      data: {
        email: userEmail,
        password: userPassword,
      },
    })
    console.log('Admin user seeded successfully.')
    return { success: true, message: 'Admin user seeded successfully.' }
  } else {
    console.log('Admin user already exists.')
    return { success: true, message: 'Admin user already exists.' }
  }
}
