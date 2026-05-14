import { notFound } from "next/navigation";
import { getCollection } from "@/lib/queries";
import { getCountryCode } from "@/lib/country";
import { CollectionGrid } from "@/components/CollectionGrid";
import { TrackCollection } from "@/components/TrackCollection";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const data = await getCollection(handle, 1).catch(() => null);
  if (!data) return {};
  return { title: `${data.title} | TheBrandCrate` };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const country = await getCountryCode();
  const data = await getCollection(handle, 12, undefined, country).catch(() => null);
  if (!data || data.products.length === 0) notFound();

  async function loadMore(cursor: string) {
    "use server";
    const result = await getCollection(handle, 12, cursor, country);
    return { products: result.products, pageInfo: result.pageInfo };
  }

  return (
    <div>
      <TrackCollection collectionTitle={data.title} products={data.products} />
      <h1
        className="text-[13px] font-bold mt-6 mb-4"
        style={{
          color: "var(--brand)",
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {data.title}
      </h1>

      <CollectionGrid
        initialProducts={data.products}
        initialCursor={data.pageInfo.endCursor}
        initialHasNext={data.pageInfo.hasNextPage}
        loadMore={loadMore}
      />
    </div>
  );
}
