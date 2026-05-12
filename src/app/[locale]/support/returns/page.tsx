import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const SHOPIFY_LOGIN_URL = "https://pcqthb-30.myshopify.com/account/login";

const STEPS = [
  { step: "1", text: "Log in to your account using the button below." },
  { step: "2", text: 'Find the order you want to return under "Orders".' },
  { step: "3", text: 'Click "Return items" and follow the instructions.' },
  { step: "4", text: "Ship the item back to the provided return address on the packing slip. Your request does not have to be approved first. Do not return items without requesting a return first." },
];

export default async function ReturnsPage() {
  const t = await getTranslations('support.returns');

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <p
        className="text-[11px] tracking-[0.2em] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {t('subtitle')}
      </p>
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: "var(--brand)" }}
      >
        {t('title')}
      </h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
        We accept returns and exchanges within{" "}
        <strong style={{ color: "var(--brand)" }}>14 days</strong> of delivery.
        Items must be unworn, unwashed, and in original condition with tags attached.
      </p>

      {/* Steps */}
      <div className="mb-10 flex flex-col gap-5">
        {STEPS.map(({ step, text }) => (
          <div key={step} className="flex items-start gap-4">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ backgroundColor: "var(--brand)", color: "#fff" }}
            >
              {step}
            </span>
            <p className="text-[14px] pt-0.5" style={{ color: "var(--text)", lineHeight: 1.6 }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href={SHOPIFY_LOGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full py-3.5 text-[12px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--brand)",
          color: "#fff",
          borderRadius: "6px",
        }}
      >
        {t('startReturn')}
      </a>

      <p className="text-center text-[11px] mt-4" style={{ color: "var(--text-muted)" }}>
        You will be redirected to our secure account portal.
      </p>

      {/* Divider */}
      <div className="my-10" style={{ height: "1px", backgroundColor: "var(--border)" }} />

      {/* FAQ */}
      <h2 className="text-[13px] font-semibold tracking-wide mb-4" style={{ color: "var(--brand)" }}>
        COMMON QUESTIONS
      </h2>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--brand)" }}>
            Can I exchange for a different size?
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Yes. Select &ldquo;Exchange&rdquo; when starting your return and choose the new size. Please also send us an email to let us know which size you would like so we can reserve it for you.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--brand)" }}>
            How long does a refund take?
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Refunds are processed within 5–7 business days after we receive the return.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--brand)" }}>
            Do I need an account to return?
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Yes. Log in or create an account with the email used when placing your order.
          </p>
        </div>
      </div>
    </div>
  );
}
