import { notFound } from "next/navigation";
import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import ProductDetailContent from "@/components/ProductDetailContent";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  await connectToDatabase();
  const product = await Product.findById(params.id).lean() as any;
  if (!product) return { title: "Product Not Found | Joma" };
  return {
    title: `${product.name} | Joma`,
    description: product.description?.slice(0, 160) || `Shop ${product.name} at Joma.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.image ? [{ url: product.image }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  await connectToDatabase();

  const product = await Product.findById(params.id).lean();

  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id }
  })
  .limit(4)
  .lean();

  // Serialize MongoDB objects
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailContent 
      product={serializedProduct} 
      relatedProducts={serializedRelated} 
    />
  );
}
