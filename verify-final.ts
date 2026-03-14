import fs from 'fs';

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

// 2. NOW import the DB
async function run() {
  const { db } = await import('./src/db/index');
  const { invoices, recoveries } = await import('./src/db/schema');
  
  try {
    console.log('--- Verifying Upload Paths ---');
    const buildingId = `verify-${Date.now()}`;
    
    await db.insert(invoices).values({
      utilityAccountId: buildingId,
      billingPeriod: new Date().toISOString().split('T')[0],
      amount: '100.00',
      pdfUrl: 'http://test.com/bill.pdf'
    });
    console.log('Invoice OK');

    await db.insert(recoveries).values({
      buildingId: buildingId,
      tenantName: 'Test',
      amountBilled: '50.00',
      period: new Date().toISOString().split('T')[0],
      pdfUrl: 'http://test.com/rec.pdf'
    });
    console.log('Recovery OK');

    console.log('--- SUCCESS ---');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
