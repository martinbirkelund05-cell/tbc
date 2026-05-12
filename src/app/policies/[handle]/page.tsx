import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  redirect(`/en/policies/${handle}`);
}
