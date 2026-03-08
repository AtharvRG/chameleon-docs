"use server";

import { signOut, auth, signIn } from "@/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "viewer",
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account." };
  }
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  await connectToDB();

  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Name is required" };
  }

  await connectToDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  user.name = name.trim();
  await user.save();

  revalidatePath("/dashboard/settings");

  return { success: true };
}

export async function updateUserPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  await connectToDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user || !user.password) {
    return { success: false, error: "User not found" };
  }

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    return { success: false, error: "Current password is incorrect" };
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { success: true };
}

export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  await connectToDB();

  await User.deleteOne({ email: session.user.email });

  await signOut({ redirectTo: "/" });

  return { success: true };
}