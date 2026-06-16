import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail, getEmailSubject } from "@/emails/WelcomeEmail";
import * as React from "react";

const KLAVIYO_REV = "2024-02-15";

async function klaviyo<T>(path: string, options: RequestInit = {}): Promise<{ status: number; data: T }> {
  const res = await fetch(`https://a.klaviyo.com/api${path}`, {
    ...options,
    headers: {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY!}`,
      "Content-Type": "application/json",
      revision: KLAVIYO_REV,
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data: data as T };
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;
  try {
    const { email, locale } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // Step 1 — Subscribe profile + add to list in one call
    const { status: subStatus, data: subData } = await klaviyo<{
      errors?: { detail?: string; meta?: { duplicate_profile_id?: string } }[];
    }>("/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [{
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } },
                  },
                },
              }],
            },
          },
          relationships: KLAVIYO_LIST_ID
            ? { list: { data: { type: "list", id: KLAVIYO_LIST_ID } } }
            : undefined,
        },
      }),
    });

    console.log("Klaviyo subscribe status:", subStatus, JSON.stringify(subData));

    // 409 = already subscribed
    if (subStatus === 409) {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }

    if (subStatus !== 202 && subStatus !== 200) {
      console.error("Klaviyo subscribe error:", subData);
      // Don't block — still return success code to user
    }

    // Step 3 — Expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const expiryTime = expiresAt.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Step 4 — Send email (non-blocking on failure)
    try {
      const emailLocale = ["en", "de", "fr", "da", "nl"].includes(locale) ? locale : "en";
      const html = await render(
        React.createElement(WelcomeEmail, { code: "WELCOME10", expiryTime, locale: emailLocale })
      );
      const emailResult = await resend.emails.send({
        from: "THEBRANDCRATE <no-reply@thebrandcrate.com>",
        to: email,
        subject: getEmailSubject(emailLocale),
        html,
      });
      console.log("Resend result:", JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Email failure does not block showing the code
    }

    return NextResponse.json({ code: "WELCOME10", expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
