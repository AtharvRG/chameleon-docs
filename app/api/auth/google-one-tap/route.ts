import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

/**
 * API route to verify Google ID tokens from Google Identity Services
 * and create/update users in MongoDB for NextAuth session management.
 */
export async function POST(req: Request) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json(
                { success: false, error: "No credential provided" },
                { status: 400 }
            );
        }

        // Verify the Google ID token
        // Decode the JWT payload (the token is already signed by Google)
        const payload = JSON.parse(
            Buffer.from(credential.split(".")[1], "base64").toString("utf-8")
        );

        // Verify the token is from our app
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (payload.aud !== clientId) {
            return NextResponse.json(
                { success: false, error: "Invalid token audience" },
                { status: 401 }
            );
        }

        // Check token expiration
        if (payload.exp * 1000 < Date.now()) {
            return NextResponse.json(
                { success: false, error: "Token expired" },
                { status: 401 }
            );
        }

        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return NextResponse.json(
                { success: false, error: "No email in token" },
                { status: 400 }
            );
        }

        // Connect to database and create/update user
        await connectToDB();

        let user = await User.findOne({ email });

        // Generate a deterministic OAuth token for this Google user
        // This allows NextAuth credentials provider to authenticate them
        const oauthToken = await bcrypt.hash(`google-oauth-${googleId}-${email}`, 10);

        if (!user) {
            // Create new user
            user = await (User.create({
                name: name || "User",
                email,
                image: picture,
                password: oauthToken,
            }) as any);
        } else {
            // Update existing user's OAuth token and image
            user.password = oauthToken;
            if (picture && !user.image) {
                user.image = picture;
            }
            await user.save();
        }

        return NextResponse.json({
            success: true,
            email,
            oauthToken,
        });
    } catch (error) {
        console.error("Google One Tap verification error:", error);
        return NextResponse.json(
            { success: false, error: "Verification failed" },
            { status: 500 }
        );
    }
}
