import { getPayload } from 'payload';
import config from '@/payload.config';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API: Starting Payload user seeding...');
  try {
    const payload = await getPayload({ config });
    
    const email = 'tlindeque@trueprop.co.za';
    const name = 'Theuns Lindeque';
    const password = 'TemporaryPassword123!';

    console.log(`API: Checking if user ${email} exists...`);
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existing.docs.length > 0) {
      return NextResponse.json({ message: 'User already exists.' });
    } else {
      console.log('API: Creating initial admin user...');
      await payload.create({
        collection: 'users',
        data: {
          email,
          name,
          password,
        },
      });
      return NextResponse.json({ 
        message: 'Admin user created successfully.',
        email,
        password: 'TemporaryPassword123! (Please change this immediately)'
      });
    }
  } catch (error: any) {
    console.error('API: Seeding failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
