import { notFound } from "next/navigation";
import { getShopPolicies } from "@/lib/queries";

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const policies = await getShopPolicies().catch(() => null);

  if (!policies) notFound();

  const all = [
    policies.privacyPolicy,
    policies.termsOfService,
    policies.refundPolicy,
    policies.shippingPolicy,
  ].filter(Boolean);

  const policy = all.find((p) => p!.handle === handle);
  if (!policy) notFound();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--brand)" }}
      >
        {policy.title}
      </h1>
      <div
        className="prose text-sm leading-relaxed"
        style={{ color: "var(--text)" }}
        dangerouslySetInnerHTML={{ __html: policy.body }}
      />
    </div>
  );
}
