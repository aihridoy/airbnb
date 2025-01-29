import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { to, subject, html } = body;

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
