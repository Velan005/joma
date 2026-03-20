import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import ProductDetailContent from "@/components/ProductDetailContent";

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
