import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import CategoryContent from "@/components/CategoryContent";

export const revalidate = 3600;

const banners: Record<string, { image: string; title: string; subtitle: string }> = {
  women: { image: "https://images.unsplash.com/photo-1483985988355-66d7445e233b?q=80&w=2070&auto=format&fit=crop", title: "Women", subtitle: "Effortless elegance for every occasion" },
  men: { image: "https://images.unsplash.com/photo-1488161628813-244aa2f87735?q=80&w=1967&auto=format&fit=crop", title: "Men", subtitle: "Modern essentials, refined style" },
  kids: { image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=2070&auto=format&fit=crop", title: "Kids", subtitle: "Comfortable style for little ones" },
};

export async function generateStaticParams() {
  return [
    { category: "women" },
    { category: "men" },
    { category: "kids" },
  ];
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const banner = banners[params.category];
  if (!banner) return { title: "Category Not Found" };
  return {
    title: `${banner.title}'s Fashion`,
    description: `${banner.subtitle}. Shop ${banner.title.toLowerCase()}'s clothing at Joma.`,
    openGraph: {
      title: `${banner.title}'s Fashion`,
      description: banner.subtitle,
      images: [{ url: banner.image }],
    },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const banner = banners[params.category];
  if (!banner) notFound();

  await connectToDatabase();
  const products = await Product.find({ category: params.category }).lean();
  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="flex flex-col w-full">
      {/* Hero banner — server-rendered */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image src={banner.image} alt={banner.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-2">{banner.title}</h1>
            <p className="text-white/80 font-body text-xs md:text-sm tracking-[0.2em] uppercase">{banner.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Interactive product grid — client component */}
      <CategoryContent products={serializedProducts} />
    </div>
  );
}
