import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// FIX: Added 'handlers' to the export list
export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
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