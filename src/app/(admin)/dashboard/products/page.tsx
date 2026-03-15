"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Manage your store inventory and product details.</p>
        </div>
        <Link 
          href="/dashboard/products/new"
          className="bg-primary text-primary-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase font-body flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-body"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Product</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Price</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Stock</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm font-body">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm font-body text-muted-foreground">No products found.</td></tr>
              ) : (
                filteredProducts.map((p: any) => (
                  <tr key={p._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 relative bg-secondary">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium font-body">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{p.subcategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-body capitalize">{p.category}</td>
                    <td className="p-4 text-sm font-body">${p.price}</td>
                    <td className="p-4 text-sm font-body">
                      {p.stock > 10 ? (
                        <span className="text-green-600">{p.stock} in stock</span>
                      ) : (
                        <span className="text-orange-600">{p.stock} low stock</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/product/${p._id}`} target="_blank" className="p-2 hover:bg-secondary transition-colors" title="View in Store">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <Link href={`/dashboard/products/edit/${p._id}`} className="p-2 hover:bg-secondary transition-colors" title="Edit">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this product?")) {
                              deleteMutation.mutate(p._id);
                            }
                          }}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
