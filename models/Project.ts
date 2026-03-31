import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
    name: string;
    slug: string;
    description?: string;
    ownerEmail: string;
    isPublic: boolean;
    showInShowcase: boolean;
    emoji?: string;
    theme: {
        color: string;
        font: string;
    };
    sectionOrder?: string[]; // Array of section names in order
    createdAt: Date;
    updatedAt: Date;
}

// Default emojis for random selection
const DEFAULT_EMOJIS = ['📚', '📖', '📝', '✨', '🚀', '💡', '🎯', '⚡', '🔥', '💎', '🌟', '📋', '🗂️', '📁', '🎨', '🔧', '⚙️', '🏗️', '📊', '🧩'];

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String },
        ownerEmail: { type: String, required: true, index: true },
        isPublic: { type: Boolean, default: false },
        showInShowcase: { type: Boolean, default: true },
        emoji: { 
            type: String, 
            default: () => DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)]
        },
        theme: {
            color: { type: String, default: "#6366f1" },
            font: { type: String, default: "Inter" },
        },
        sectionOrder: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Prevent model overwrite error in Next.js hot reload
const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;