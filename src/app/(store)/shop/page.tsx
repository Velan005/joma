import { Suspense } from "react";
import ShopContent from "@/components/ShopContent";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

// This is a Server Component
export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await connectToDatabase();

  const category = searchParams.category as string;
  const search = searchParams.search as string;
  const sizes = (searchParams.sizes as string)?.split(",");
  const colors = (searchParams.colors as string)?.split(",");
  const minPrice = searchParams.minPrice as string;
  const maxPrice = searchParams.maxPrice as string;
  const sortParam = searchParams.sort as string;

  const query: any = {};

  if (category && category !== "all") query.category = category;
  if (sizes?.length) query.sizes = { $in: sizes };
  if (colors?.length) {
    query.colors = { $in: colors };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const sortOrder = sortParam === "price-asc" ? { price: 1 } : 
                   sortParam === "price-desc" ? { price: -1 } : 
                   { createdAt: -1 };

  const products = await Product.find(query).sort(sortOrder as any).lean();

  // Convert MongoDB objects to plain JS objects for the client
  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent initialProducts={serializedProducts} />
    </Suspense>
  );
}

function ShopLoading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="h-10 w-1/3 bg-secondary mb-8 rounded" />
      <div className="flex gap-8">
        <div className="w-56 h-96 bg-secondary hidden lg:block rounded" />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
