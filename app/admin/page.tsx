"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Package,
  DollarSign,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useDebounce } from "use-debounce";

interface Order {
  id: string
  itemName: string
  price: string
  buyer: string
  seller: string
  status: "pending" | "confirmed" | "completed" | "disputed" | "cancelled" | string
  createdAt: Date
  description: string
}

function decodeJwt<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [guardDone, setGuardDone] = useState(false);
  const router = useRouter()

  // Guard Effect (เหมือนเดิม)
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const initToken = useAuthStore.getState().initToken;
      await initToken?.();
      let token = useAuthStore.getState().token || null;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      if (!token) {
        router.replace("/");
        return;
      }
      type Payload = { user_type?: number; exp?: number };
      const payload = decodeJwt<Payload>(token);
      if (!payload || (payload.exp && Date.now() / 1000 >= payload.exp)) {
        router.replace("/");
        return;
      }
      const isAdminFromJwt = Number(payload.user_type) === 2;
      if (!isAdminFromJwt) {
        router.replace("/marketplace");
        return;
      }
      setGuardDone(true);
      try {
        const res = await fetch("/api/v1/auth/user/me", { // แก้ path ให้ตรง
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (res.ok) {
          const json = await res.json();
          const me = json?.data;
          if (me) {
            useUserStore.getState().setFromMe(me);
            const isAdminFromDb = Number(me.user_type) === 2;
            if (!isAdminFromDb) router.replace("/marketplace");
          }
        }
      } catch {}
    })();
    return () => ctrl.abort();
  }, [router]);


  const fetchOrders = useCallback(async () => {
    if (!guardDone) return;
    setIsLoading(true);

    const currentToken = useAuthStore.getState().token;
    if (!currentToken) {
      setIsLoading(false);
      router.replace("/");
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append("q", debouncedSearchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    params.append("limit", "50");

    try {
      const res = await fetch(`/api/v1/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.replace("/");
        throw new Error(`Failed to fetch orders: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.success) {
        const formattedOrders = json.data.orders.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
        }));
        setOrders(formattedOrders);
        setTotalOrders(json.data.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [guardDone, debouncedSearchTerm, statusFilter, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  if (!guardDone) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Checking permission…</span>
      </div>
    );
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
      case "escrow_held":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "confirmed":
      case "ready_to_trade":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "disputed":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "cancelled":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
      case "escrow_held":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "ready_to_trade":
        return <Package className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const calculateStats = (status: string | string[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return orders.filter(o => statuses.includes(o.status)).length;
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor all trading activities and manage orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg"><Clock className="h-5 w-5 text-yellow-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{calculateStats(['pending', 'escrow_held'])}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Package className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{calculateStats(['confirmed', 'ready_to_trade'])}</p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{calculateStats('completed')}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{calculateStats('disputed')}</p>
                  <p className="text-sm text-muted-foreground">Disputed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg"><DollarSign className="h-5 w-5 text-accent" /></div>
                <div>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Order ID, item, buyer, or seller..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-input border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="escrow_held">Pending</SelectItem>
                    <SelectItem value="ready_to_trade">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>All Orders ({totalOrders})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2">Loading Orders...</span>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <h3 className="font-semibold text-card-foreground">{order.id}</h3>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* --- MODIFIED --- เพิ่ม onClick event ที่นี่ */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-border hover:bg-accent bg-transparent"
                            onClick={() => router.push(`/order/${order.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </Button>
                          {order.status === "disputed" && (
                            <Button size="sm" className="bg-accent hover:bg-accent/90">
                              <MessageSquare className="h-4 w-4 mr-2" /> Manage Dispute
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Item</p>
                          <p className="font-medium text-card-foreground">{order.itemName}</p>
                          <p className="text-sm text-accent">{order.price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Parties</p>
                          <p className="text-sm text-card-foreground">
                            <span className="text-blue-500">Buyer:</span> {order.buyer}
                          </p>
                          <p className="text-sm text-card-foreground">
                            <span className="text-green-500">Seller:</span> {order.seller}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="text-sm text-card-foreground">{order.createdAt.toLocaleDateString()}</p>
                          <p className="text-sm text-card-foreground">{order.createdAt.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm text-card-foreground">{order.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}