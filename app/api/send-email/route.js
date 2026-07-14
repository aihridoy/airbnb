import { Resend } from "resend";
import { auth } from "@/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req) => {
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await req.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return new Response(
                JSON.stringify({ success: false, error: "to, subject and html are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const emailResponse = await resend.emails.send({
            from: "AirBnB <noreply@aihridoy.com>",
            to,
            subject,
            html,
        });

        return new Response(
            JSON.stringify({ success: true, emailResponse }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
