import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "missing_name" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "missing_message" }, { status: 400 });
    }

    const phoneLine = phone?.trim() ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : "";

    await resend.emails.send({
      from: "THEBRANDCRATE <no-reply@thebrandcrate.com>",
      to: "thebrandcrate@gmail.com",
      replyTo: email,
      subject: `New contact message from ${name.trim()}`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3D4A2D;line-height:1.7;">
          <h2 style="margin-bottom:16px;">New message — TheBrandCrate</h2>
          <p><strong>Name:</strong> ${name.trim()}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phoneLine}
          <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;" />
          <p style="white-space:pre-wrap;">${message.trim()}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
