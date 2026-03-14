import fs from 'fs';
import { getPayload } from 'payload';
import config from './payload.config';

// 1. Load ENVs FIRST
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

async function seed() {
  console.log('Starting Payload user seeding...');
  try {
    const payload = await getPayload({ config });
    
    const email = 'tlindeque@trueprop.co.za';
    const name = 'Theuns Lindeque';
    const password = 'TemporaryPassword123!';

    console.log(`Checking if user ${email} exists...`);
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existing.docs.length > 0) {
      console.log('User already exists.');
    } else {
      console.log('Creating initial admin user...');
      await payload.create({
        collection: 'users',
        data: {
          email,
          name,
          password,
        },
      });
      console.log('Admin user created successfully.');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Please change this password after logging in.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
