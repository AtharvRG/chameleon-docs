import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
    projectId: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    section?: string;
    isPublished: boolean;
    order: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
        content: { type: String, default: "" },
        section: { type: String, default: "" },
        isPublished: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound index to ensure slugs are unique PER project
PageSchema.index({ projectId: 1, slug: 1 }, { unique: true });

// Text index for searching
PageSchema.index({ title: "text", content: "text" });

const Page: Model<IPage> =
    mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;