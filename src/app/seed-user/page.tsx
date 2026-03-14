import { getPayload } from 'payload';
import config from '@/payload.config';

export default async function SeedUserPage() {
  let status = 'Initializing...';
  let details = '';

  try {
    const payload = await getPayload({ config });
    
    const email = 'tlindeque@trueprop.co.za';
    const name = 'Theuns Lindeque';
    const password = 'TemporaryPassword123!';

    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existing.docs.length > 0) {
      status = 'User already exists.';
    } else {
      await payload.create({
        collection: 'users',
        data: {
          email,
          name,
          password,
        },
      });
      status = 'Admin user created successfully.';
      details = `Email: ${email} | Password: ${password}`;
    }
  } catch (error: any) {
    status = 'Seeding failed.';
    details = error.message;
    console.error(error);
  }

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-mono">
      <div className="p-8 border border-white/20 rounded-lg bg-white/5 backdrop-blur-md shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 tracking-tighter">System Provisioning</h1>
        <div className="space-y-4">
          <div className="p-3 bg-white/10 rounded border border-white/10">
            <span className="text-slate-400 text-sm block mb-1">Status</span>
            <p className="font-semibold text-emerald-400">{status}</p>
          </div>
          {details && (
            <div className="p-3 bg-white/10 rounded border border-white/10">
              <span className="text-slate-400 text-sm block mb-1">Details</span>
              <p className="text-sm break-all">{details}</p>
            </div>
          )}
          <p className="text-xs text-slate-500 pt-4">
            * This page should be deleted after use.
          </p>
        </div>
      </div>
    </div>
  );
}
