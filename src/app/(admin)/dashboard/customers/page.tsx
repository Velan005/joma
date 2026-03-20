"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });

  const filteredCustomers = customers.filter((user: any) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Customers</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">View and manage registered users.</p>
      </div>

      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Email..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-body"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">User ID</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Email</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm font-body">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                 <tr><td colSpan={5} className="p-8 text-center text-sm font-body text-destructive">Error loading customers. Please ensure you have admin rights.</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm font-body text-muted-foreground">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((user: any) => (
                  <tr key={user._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4 text-xs font-body text-muted-foreground">#{user._id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm font-body font-medium">{user.name}</td>
                    <td className="p-4 text-xs font-body text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border shadow-sm ${
                        user.role === 'admin' ? 'text-primary border-primary/20 bg-primary/10' : 'text-muted-foreground border-border bg-secondary'
                      }`}>
                         {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-body">{new Date(user.createdAt).toLocaleDateString()}</td>
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
