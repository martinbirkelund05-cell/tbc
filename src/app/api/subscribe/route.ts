import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail, getEmailSubject } from "@/emails/WelcomeEmail";
import * as React from "react";

const KLAVIYO_KEY = process.env.KLAVIYO_API_KEY!;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;
const KLAVIYO_REV = "2024-02-15";
const resend = new Resend(process.env.RESEND_API_KEY!);

async function klaviyo<T>(path: string, options: RequestInit = {}): Promise<{ status: number; data: T }> {
  const res = await fetch(`https://a.klaviyo.com/api${path}`, {
    ...options,
    headers: {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_KEY}`,
      "Content-Type": "application/json",
      revision: KLAVIYO_REV,
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data: data as T };
}

export async function POST(req: NextRequest) {
  try {
    const { email, locale } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // Step 1 — Create Klaviyo profile
    const { status: createStatus, data: createData } = await klaviyo<{
      data?: { id: string };
      errors?: { meta?: { duplicate_profile_id?: string } }[];
    }>("/profiles/", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email,
            subscriptions: {
              email: { marketing: { consent: "SUBSCRIBED" } },
            },
          },
        },
      }),
    });

    console.log("Klaviyo profile status:", createStatus, JSON.stringify(createData));

    let profileId: string | null = null;
    let alreadyExists = false;

    if (createStatus === 201) {
      profileId = createData?.data?.id ?? null;
    } else if (createStatus === 409) {
      alreadyExists = true;
      profileId = createData?.errors?.[0]?.meta?.duplicate_profile_id ?? null;
    } else {
      console.error("Klaviyo profile error:", createData);
      // Don't block — continue to send code anyway
    }

    // If truly already subscribed (409 and no profile ID to recover), stop here
    if (alreadyExists && !profileId) {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }

    // Step 2 — Add to list (fire-and-forget, never blocks success)
    if (KLAVIYO_LIST_ID && profileId) {
      klaviyo(`/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
        method: "POST",
        body: JSON.stringify({ data: [{ type: "profile", id: profileId }] }),
      }).catch((e) => console.error("List add error:", e));
    }

    // If profile already existed → already subscribed
    if (alreadyExists) {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
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
