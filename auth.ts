import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// FIX: Added 'handlers' to the export list
export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            // Handle OAuth sign-ins - create or update user in DB
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    await connectToDB();
                    const existingUser = await User.findOne({ email: user.email });
                    
                    if (!existingUser) {
                        // Create new user for OAuth
                        await User.create({
                            name: user.name || "User",
                            email: user.email,
                            image: user.image,
                            // No password for OAuth users
                        } as any);
                    } else if (user.image && !existingUser.image) {
                        // Update image if the user exists but doesn't have one
                        existingUser.image = user.image;
                        await existingUser.save();
                    }
                } catch (error) {
                    console.error("Error in OAuth signIn callback:", error);
                    return false;
                }
            }
            return true;
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        Credentials({
            async authorize(credentials) {
                if (credentials?.email && credentials?.password) {
                    await connectToDB();
                    const user = await User.findOne({ email: credentials.email });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (passwordsMatch) {
                        return { id: user._id.toString(), name: user.name, email: user.email };
                    }
                }
                return null;
            },
        }),
    ],
});