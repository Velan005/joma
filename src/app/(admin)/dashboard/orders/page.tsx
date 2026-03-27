"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, ChevronDown, ChevronUp, Package, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS = ["pending", "processing", "printing_started", "shipped", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  processing: "text-blue-600 bg-blue-50 border-blue-200",
  printing_started: "text-orange-600 bg-orange-50 border-orange-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};
const PAYMENT_COLORS: Record<string, string> = {
  paid: "text-green-600 bg-green-50 border-green-200",
  unpaid: "text-red-500 bg-red-50 border-red-200",
  refunded: "text-amber-500 bg-amber-50 border-amber-200",
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    staleTime: 30_000,       // consider fresh for 30s after fetch
    refetchInterval: 60_000, // auto-refresh every 60s so new payments appear without manual reload
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ id: orderId, data: { status } });
  };

  // Filter orders
  // Helper to get customer name (supports old + new schema)
  const getCustomerName = (o: any) => o.customer?.name || [o.shippingAddress?.firstName, o.shippingAddress?.lastName].filter(Boolean).join(" ") || "";
  const getCustomerPhone = (o: any) => o.customer?.phone || "";
  const getCustomerEmail = (o: any) => o.customer?.email || o.shippingAddress?.email || "";
  const getOrderProducts = (o: any) => o.products?.length ? o.products : o.items || [];

  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch =
      searchTerm === "" ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(o).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerPhone(o).includes(searchTerm) ||
      getCustomerEmail(o).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Manage all store orders and update their fulfillment status.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-background border border-border flex items-center gap-3 px-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or order ID..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-body py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background border border-border px-4 py-3 text-xs tracking-[0.1em] uppercase font-body focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-background border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground w-8"></th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Order ID</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Customer</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Items</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Total</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Payment</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Date</th>
                <th className="p-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm font-body">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm font-body text-muted-foreground">
                    <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => {
                  const isExpanded = expandedOrder === order._id;
                  return (
                    <tr key={order._id} className="border-b border-border group">
                      {/* Row */}
                      <td className="p-4">
                        <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)} className="p-1 hover:bg-secondary transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4 text-xs font-body font-medium">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium font-body">{getCustomerName(order) || "—"}</p>
                        <p className="text-[10px] text-muted-foreground font-body">{getCustomerPhone(order)}</p>
                      </td>
                      <td className="p-4 text-xs font-body text-muted-foreground">
                        {getOrderProducts(order).length} item{getOrderProducts(order).length !== 1 ? "s" : ""}
                      </td>
                      <td className="p-4 text-sm font-body font-medium">₹{order.totalAmount}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border ${PAYMENT_COLORS[order.paymentStatus] || ""}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updateOrderMutation.isPending}
                          className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border shadow-sm outline-none transition-colors ${STATUS_COLORS[order.status] || ""}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-xs font-body">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setModalOrder(order)}
                          className="p-1.5 hover:bg-secondary transition-colors border border-border"
                          title="View full details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded Order Details */}
        {expandedOrder && (() => {
          const order = orders.find((o: any) => o._id === expandedOrder);
          if (!order) return null;
          return (
            <div className="border-t border-border bg-secondary/10 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer */}
                <div className="space-y-2">
                  <h3 className="text-xs tracking-[0.1em] uppercase font-body font-medium text-muted-foreground">Customer</h3>
                  <p className="text-sm font-body font-medium">{getCustomerName(order) || "—"}</p>
                  <p className="text-xs font-body text-muted-foreground">{getCustomerEmail(order) || "—"}</p>
                  <p className="text-xs font-body text-muted-foreground">{getCustomerPhone(order) || "—"}</p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <h3 className="text-xs tracking-[0.1em] uppercase font-body font-medium text-muted-foreground">Delivery Address</h3>
                  <p className="text-sm font-body">
                    {order.customer?.address?.street || order.shippingAddress?.address || "—"}
                  </p>
                  <p className="text-xs font-body text-muted-foreground">
                    {order.customer?.address
                      ? [order.customer.address.city, order.customer.address.state, order.customer.address.pincode].filter(Boolean).join(", ")
                      : [order.shippingAddress?.city, order.shippingAddress?.country, order.shippingAddress?.zip].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>

                {/* Payment */}
                <div className="space-y-2">
                  <h3 className="text-xs tracking-[0.1em] uppercase font-body font-medium text-muted-foreground">Payment</h3>
                  <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                    Online Payment
                  </p>
                  <p className="text-sm font-body font-medium">₹{order.totalAmount}</p>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => updateOrderMutation.mutate({ id: order._id, data: { paymentStatus: e.target.value } })}
                    disabled={updateOrderMutation.isPending}
                    className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border outline-none transition-colors ${PAYMENT_COLORS[order.paymentStatus] || ""}`}
                  >
                    {["unpaid", "paid", "refunded"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {order.paymentId ? (
                    <>
                      <p className="text-xs font-body text-muted-foreground">Payment ID: {order.paymentId}</p>
                      {order.orderId && <p className="text-xs font-body text-muted-foreground">Razorpay Order: {order.orderId}</p>}
                    </>
                  ) : (
                    <p className="text-xs font-body text-muted-foreground">Payment pending</p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3">
                <h3 className="text-xs tracking-[0.1em] uppercase font-body font-medium text-muted-foreground">Products Ordered</h3>
                <div className="bg-background border border-border divide-y divide-border">
                  {getOrderProducts(order).map((item: any, i: number) => (
                    <div key={i} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-body font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-body">
                          {item.size} · {item.color} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-body font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Summary */}
      {!isLoading && (
        <p className="text-xs font-body text-muted-foreground text-right">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!modalOrder} onOpenChange={(open) => { if (!open) setModalOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {modalOrder && (() => {
            const o = modalOrder;
            const products = getOrderProducts(o);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Order #{o._id.slice(-8).toUpperCase()}
                  </DialogTitle>
                  <p className="text-xs font-body text-muted-foreground">
                    Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                  {/* Customer */}
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Customer</h3>
                    <p className="text-sm font-body font-medium">{getCustomerName(o) || "—"}</p>
                    <p className="text-xs font-body text-muted-foreground">{getCustomerEmail(o) || "—"}</p>
                    <p className="text-xs font-body text-muted-foreground">{getCustomerPhone(o) || "—"}</p>
                  </div>

                  {/* Shipping */}
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Delivery Address</h3>
                    <p className="text-sm font-body">{o.customer?.address?.street || o.shippingAddress?.address || "—"}</p>
                    <p className="text-xs font-body text-muted-foreground">
                      {o.customer?.address
                        ? [o.customer.address.city, o.customer.address.state, o.customer.address.pincode].filter(Boolean).join(", ")
                        : [o.shippingAddress?.city, o.shippingAddress?.country, o.shippingAddress?.zip].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>

                  {/* Payment */}
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Payment</h3>
                    <p className="text-sm font-body font-medium">₹{o.totalAmount}</p>
                    <span className={`inline-block text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-0.5 border ${PAYMENT_COLORS[o.paymentStatus] || ""}`}>
                      {o.paymentStatus}
                    </span>
                    <span className={`inline-block ml-2 text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-0.5 border ${STATUS_COLORS[o.status] || ""}`}>
                      {o.status}
                    </span>
                    {o.paymentId && <p className="text-[10px] font-body text-muted-foreground break-all">ID: {o.paymentId}</p>}
                  </div>
                </div>

                {/* Products */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-body font-medium text-muted-foreground">Items</h3>
                  <div className="border border-border divide-y divide-border">
                    {products.map((item: any, i: number) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-body font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body">
                            {[item.size, item.color].filter(Boolean).join(" · ")} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-body font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status update at bottom */}
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body text-muted-foreground">Status:</span>
                    <select
                      value={o.status}
                      onChange={(e) => {
                        handleStatusChange(o._id, e.target.value);
                        setModalOrder({ ...o, status: e.target.value });
                      }}
                      disabled={updateOrderMutation.isPending}
                      className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border outline-none ${STATUS_COLORS[o.status] || ""}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body text-muted-foreground">Payment:</span>
                    <select
                      value={o.paymentStatus}
                      onChange={(e) => {
                        updateOrderMutation.mutate({ id: o._id, data: { paymentStatus: e.target.value } });
                        setModalOrder({ ...o, paymentStatus: e.target.value });
                      }}
                      disabled={updateOrderMutation.isPending}
                      className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 border outline-none ${PAYMENT_COLORS[o.paymentStatus] || ""}`}
                    >
                      {["unpaid", "paid", "refunded"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
