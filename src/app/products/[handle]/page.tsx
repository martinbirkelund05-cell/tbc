import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  redirect(`/en/products/${handle}`);
}
