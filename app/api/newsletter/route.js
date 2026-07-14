import { NextResponse } from "next/server";
import { Resend } from "resend";
import { dbConnect } from "@/service/mongo";
import { Subscriber } from "@/models/subscriber-model";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { message: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        await dbConnect();

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await Subscriber.findOne({ email: normalizedEmail });
        if (existing) {
            return NextResponse.json(
                { message: "You're already subscribed" },
                { status: 200 }
            );
        }

        await Subscriber.create({ email: normalizedEmail });

        try {
            await resend.emails.send({
                from: "AirBnB <noreply@ashrafulislam.im>",
                to: normalizedEmail,
                subject: "Welcome to the AirBnB newsletter",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #009688;">You're in!</h1>
                        <p>Thanks for subscribing. You'll now get exclusive deals, travel tips and flash sale alerts straight to your inbox.</p>
                    </div>
                `,
            });
        } catch (emailError) {
            // Subscriber is saved either way; email delivery is best-effort.
            console.error("Failed to send newsletter welcome email:", emailError);
        }

        return NextResponse.json(
            { message: "Subscribed successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return NextResponse.json(
            { message: "Failed to subscribe" },
            { status: 500 }
        );
    }
}
