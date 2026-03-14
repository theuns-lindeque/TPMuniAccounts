import fs from 'fs';
import { neon } from '@neondatabase/serverless';

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

const sql = neon(process.env.DATABASE_URI!);

async function checkUsers() {
  console.log('Checking for users in database...');
  try {
    const result = await sql`SELECT id, email, name FROM users`;
    console.log(`Found ${result.length} users:`);
    result.forEach(row => console.log(` - ${row.name} (${row.email})`));
    process.exit(0);
  } catch (error) {
    console.error('Failed to query users:', error);
    process.exit(1);
  }
}

checkUsers();
