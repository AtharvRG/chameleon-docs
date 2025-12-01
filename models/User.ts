import mongoose, { Schema, Document, Model } from "mongoose";

// Simplification preference types
export type SimplificationLevel = "technical" | "standard" | "simplified" | "beginner" | "noob";

export interface ISimplificationPreferences {
    // Background Questions
    techBackground: "none" | "beginner" | "intermediate" | "advanced" | "expert";
    primaryRole: string;
    learningStyle: "visual" | "detailed" | "examples" | "concise";
    experienceWithDocs: "never" | "rarely" | "sometimes" | "often" | "daily";
    preferredExplanationDepth: "high-level" | "moderate" | "detailed";
    
    // Default level for reimagination
    defaultSimplificationLevel: SimplificationLevel;
    
    // Onboarding completion flag
    hasCompletedOnboarding: boolean;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    createdAt: Date;
    simplificationPreferences: ISimplificationPreferences;
}

const SimplificationPreferencesSchema = new Schema<ISimplificationPreferences>(
    {
        techBackground: { 
            type: String, 
            enum: ["none", "beginner", "intermediate", "advanced", "expert"],
            default: "beginner"
        },
        primaryRole: { type: String, default: "" },
        learningStyle: { 
            type: String, 
            enum: ["visual", "detailed", "examples", "concise"],
            default: "detailed"
        },
        experienceWithDocs: { 
            type: String, 
            enum: ["never", "rarely", "sometimes", "often", "daily"],
            default: "sometimes"
        },
        preferredExplanationDepth: { 
            type: String, 
            enum: ["high-level", "moderate", "detailed"],
            default: "moderate"
        },
        defaultSimplificationLevel: { 
            type: String, 
            enum: ["technical", "standard", "simplified", "beginner", "noob"],
            default: "standard"
        },
        hasCompletedOnboarding: { type: Boolean, default: false },
    },
    { _id: false }
);

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        image: { type: String },
        simplificationPreferences: { 
            type: SimplificationPreferencesSchema, 
            default: () => ({
                techBackground: "beginner",
                primaryRole: "",
                learningStyle: "detailed",
                experienceWithDocs: "sometimes",
                preferredExplanationDepth: "moderate",
                defaultSimplificationLevel: "standard",
                hasCompletedOnboarding: false,
            })
        },
    },
    { timestamps: true }
);

// Prevent model overwrite error in Next.js hot reload
let User: Model<IUser>;
try {
    User = mongoose.model<IUser>("User");
} catch {
    User = mongoose.model<IUser>("User", UserSchema);
}

export default User;