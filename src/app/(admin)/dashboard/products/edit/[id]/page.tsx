"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import ColorVariantManager, { ColorVariant } from "@/components/admin/ColorVariantManager";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isUploading, setIsUploading] = useState(false);
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "women",
    subcategory: "",
    image: "",
    stock: "0",
    isNew: false,
    sizes: [] as string[],
  });

  // Fetch existing product
  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price || ""),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        category: product.category || "women",
        subcategory: product.subcategory || "",
        image: product.image || "",
        stock: String(product.stock ?? 0),
        isNew: product.isNew || false,
        sizes: product.sizes || [],
      });
      // Load existing variants, or build from legacy colors[]
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map((v: any, i: number) => ({
          color: v.color || "",
          colorHex: v.colorHex || "#000000",
          images: v.images || [],
          backImage: v.backImage || "",
          isDefault: v.isDefault ?? (i === 0),
        })));
      } else if (product.colors && product.colors.length > 0) {
        setVariants(product.colors.map((c: string, i: number) => ({
          color: c,
          colorHex: "#000000",
          images: [],
          isDefault: i === 0,
        })));
      }
    }
  }, [product]);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) { toast.error("Please upload an image"); return; }
    if (formData.sizes.length === 0) { toast.error("Please select at least one size"); return; }
    // Only enforce variant images when the product already uses the new variants format.
    // Legacy products loaded from colors[] have images:[] and would otherwise block all saves.
    const invalidVariant =
      product?.variants?.length > 0
        ? variants.find((v) => v.images.length === 0)
        : null;
    if (invalidVariant) {
      toast.error(`Please add at least one front image for "${invalidVariant.color || "unnamed"}" color`);
      return;
    }
    updateMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      stock: parseInt(formData.stock),
      variants: variants.map(({ color, colorHex, images, backImage, isDefault }) => ({
        color, colorHex, images, backImage: backImage || "", isDefault: !!isDefault,
      })),
      colors: variants.map((v) => v.color).filter(Boolean),
    });
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm font-body text-muted-foreground mt-2">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center space-y-4">
        <p className="text-sm font-body text-muted-foreground">Product not found.</p>
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-background border border-border p-8">
        <h1 className="font-display text-3xl mb-8">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Product Name</label>
              <input required type="text" className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Subcategory</label>
              <input placeholder="e.g. Dresses, Outerwear" type="text" className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Description</label>
            <textarea required rows={4} className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Price (₹)</label>
              <input required type="number" step="0.01" min="1" className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Original Price</label>
              <input type="number" step="0.01" placeholder="Optional" className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Category</label>
              <select className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Stock</label>
              <input required type="number" className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`w-12 h-10 text-xs font-body border transition-colors ${formData.sizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground/40"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Variants */}
          <ColorVariantManager variants={variants} onChange={setVariants} />

          {/* Image */}
          <div className="space-y-4">
            <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">Product Image</label>
            {formData.image ? (
              <div className="relative w-40 h-52 group">
                <Image src={formData.image} alt="Preview" fill className="object-cover border border-border" />
                <button type="button" onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-2 right-2 p-1 bg-background/80 hover:bg-background text-destructive rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-border p-6 sm:p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={uploadImage} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm font-body text-muted-foreground">Uploading to Cloudinary...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-body text-muted-foreground underline">Click to upload product photo</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button disabled={updateMutation.isPending || isUploading} type="submit"
            className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {updateMutation.isPending ? "Saving Changes..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
