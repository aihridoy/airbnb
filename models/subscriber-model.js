import mongoose, { Schema } from "mongoose";

const subscriberSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const Subscriber =
    mongoose.models.subscribers ?? mongoose.model("subscribers", subscriberSchema);
