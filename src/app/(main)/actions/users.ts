"use server";
import { cookies, headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { revalidatePath } from "next/cache";

export async function getMe() {
  try {
    const payload = await getPayload({ config: configPromise });
    const reqHeaders = await headers();
    const { user } = await payload.auth({ headers: reqHeaders });
    
    console.log('getMe - User Object Found:', !!user);
    const host = reqHeaders.get('host');
    
    if (!process.env.PAYLOAD_SECRET) {
      console.error('getMe - CRITICAL: PAYLOAD_SECRET is missing!');
    }

    if (user) {
      console.log(`getMe - Identified User: ${user.email}, Role: ${user.role}, Host: ${host}`);
    } else {
      const cookieHeader = reqHeaders.get('cookie') || '';
      console.log(`getMe - Authentication Failed. Host: ${host}`);
      console.log(`getMe - Raw Cookie Names: ${cookieHeader.split(';').map(c => c.split('=')[0].trim()).join(', ')}`);
      
      if (cookieHeader.includes('payload-token')) {
        const tokenMatch = cookieHeader.match(/payload-token=([^;]+)/);
        if (tokenMatch) {
          console.log(`getMe - Found payload-token (length: ${tokenMatch[1].length}). Segment: ${tokenMatch[1].substring(0, 15)}...`);
        }
      }
    }
    
    return user;
  } catch (error) {
    console.error('getMe - Error:', error);
    return null;
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("payload-token");
  return { success: true };
}

async function ensureAdmin() {
  const user = await getMe();
  if (user?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }
}

export async function getUsers() {
  const payload = await getPayload({ config: configPromise });
  const users = await payload.find({
    collection: "users",
    limit: 100,
    sort: "-createdAt",
  });
  return users.docs;
}

export async function createUser(data: { email: string; name: string; password?: string, role?: string }) {
  try {
    await ensureAdmin();
    const payload = await getPayload({ config: configPromise });
    const user = await payload.create({
      collection: "users",
      data: {
        email: data.email,
        name: data.name,
        password: data.password || "TempPass123!", // Default password if not provided
        role: (data.role as any) || "contributor",
      },
    });
    revalidatePath("/users");
    return { success: true, user };
  } catch (error: any) {
    console.error("Create User Error:", error);
    return { success: false, error: error.message || "Failed to create user." };
  }
}

export async function updateUser(id: string, data: { email?: string; name?: string; password?: string, role?: string }) {
  try {
    await ensureAdmin();
    const payload = await getPayload({ config: configPromise });
    const user = await payload.update({
      collection: "users",
      id,
      data,
    });
    revalidatePath("/users");
    return { success: true, user };
  } catch (error: any) {
    console.error("Update User Error:", error);
    return { success: false, error: error.message || "Failed to update user." };
  }
}

export async function deleteUser(id: string) {
  try {
    await ensureAdmin();
    const payload = await getPayload({ config: configPromise });
    await payload.delete({
      collection: "users",
      id,
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return { success: false, error: error.message || "Failed to delete user." };
  }
}
