"use server";
import { cookies, headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { revalidatePath } from "next/cache";

export async function getMe() {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  return user;
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
