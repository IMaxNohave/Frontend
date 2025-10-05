"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, X, Star, Package } from "lucide-react";
import { api } from "@/app/service/api";

// ===== Types =====
export type MeDTO = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string; // ISO
};

export type MyItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  status: number; // 1=Available, 2=Reserved ...
  seller_name: string | null;
  detail: string | null;
  category: { id: string | null; name: string | null; detail: string | null };
};

type WalletDTO = {
  balance: string;   // decimal as string
  held: string;      // decimal as string
  available: string; // decimal as string (balance - held)
  updatedAt?: string;
};

// ===== Utils =====
function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso ?? "-";
  }
}

function fmtR(amount?: string | number) {
  if (amount === undefined || amount === null) return "0 R$";
  // handle "∞"
  if (typeof amount === "string" && amount.includes("∞")) return "∞R$";
  const n = Number(amount);
  if (!isFinite(n)) return "∞R$";
  return `${n.toLocaleString()} R$`;
}

// ===== Tiny services (DRY) =====
const userApi = {
  async me() {
    const r = await api.get<{ success: boolean; data: MeDTO }>("/auth/user/me");
    return r.data.data;
  },
  async update(payload: { name: string; email: string }) {
    const r = await api.patch<{ success: boolean; data: MeDTO }>("/auth/user/update", payload);
    return r.data.data;
  },
  async myItems() {
    const r = await api.get<{ success: boolean; data: MyItem[] }>("/v1/home/my-items", {
      params: { limit: 50 },
    });
    return Array.isArray(r.data.data) ? r.data.data : [];
  },
};

const walletApi = {
  async get() {
    const r = await api.get<{ success: boolean; data: WalletDTO }>("/auth/user/wallet");
    return r.data.data;
  },
};

// ===== View model =====
type ViewUser = {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTrades: number;
  successRate: number;
  rating: number;
  image: string | null;
};

// ===== Main Component =====
export function UserProfile() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsErr, setItemsErr] = useState<string | null>(null);

  const [userData, setUserData] = useState<ViewUser>({
    name: "",
    email: "",
    phone: "-",
    joinDate: "-",
    totalTrades: 0,
    successRate: 100,
    rating: 5.0,
    image: null,
  });

  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletErr, setWalletErr] = useState<string | null>(null);

  const [editData, setEditData] = useState({ name: "", email: "" });

  // ===== Load profile + wallet (DRY พร้อมกัน) =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // admin mock
        const adminFlag = typeof window !== "undefined" ? localStorage.getItem("isAdmin") === "true" : false;
        if (adminFlag) {
          if (!alive) return;
          setIsAdmin(true);
          setUserData({
            name: "Admin",
            email: "admin@gmail.com",
            phone: "+1 (555) ADMIN",
            joinDate: "-",
            totalTrades: 0,
            successRate: 100,
            rating: 5.0,
            image: null,
          });
          setEditData({ name: "Admin", email: "admin@gmail.com" });
          // wallet ของ admin (mock)
          setWallet({ balance: "∞", held: "0", available: "∞" });
          return;
        }

        // โหลด profile + wallet ควบ
        const [me, w] = await Promise.all([userApi.me(), walletApi.get()]);
        if (!alive) return;

        const mapped: ViewUser = {
          name: me.name || "",
          email: me.email || "",
          phone: "-",
          joinDate: fmtDate(me.createdAt),
          totalTrades: 0,
          successRate: 100,
          rating: 5.0,
          image: me.image ?? null,
        };
        console.log(me.image);

        setIsAdmin(false);
        setUserData(mapped);
        setEditData({ name: mapped.name, email: mapped.email });
        setWallet(w);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Load profile/wallet failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== Load items =====
  useEffect(() => {
    if (isAdmin) return; // admin ไม่โหลด
    let alive = true;
    (async () => {
      try {
        setItemsLoading(true);
        setItemsErr(null);
        const items = await userApi.myItems();
        if (!alive) return;
        setMyItems(items);
      } catch (e: any) {
        if (alive) setItemsErr(e?.message || "Load my items failed");
      } finally {
        if (alive) setItemsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const handleSave = useCallback(async () => {
    if (isAdmin) return; // admin mock ไม่ให้แก้
    try {
      setSaving(true);
      setErr(null);
      const updated = await userApi.update({ name: editData.name, email: editData.email });
      setUserData((p) => ({
        ...p,
        name: updated.name,
        email: updated.email,
      }));
      setIsEditing(false);
      window.location.reload();
      
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }, [editData.name, editData.email, isAdmin]);

  const handleCancel = () => {
    setEditData({ name: userData.name, email: userData.email });
    setIsEditing(false);
  };

  const handleAddRobux = () => {
    router.push("/add-money");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {loading ? (
            <div className="text-muted-foreground">Loading profile…</div>
          ) : err ? (
            <div className="text-red-500">Error: {err}</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar + Badge */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={userData.image || "/roblox-avatar.png"} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                    {(userData.name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className={isAdmin ? "bg-red-500/20 text-red-400 mb-2" : "bg-primary/20 text-primary mb-2"}>
                  {isAdmin ? "System Administrator" : "Verified Trader"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-card-foreground">{userData.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({isAdmin ? "Admin" : `${userData.totalTrades} trades`})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Joined: {userData.joinDate}</div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-card-foreground">
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-input border-border text-foreground"
                        disabled={isAdmin}
                      />
                    ) : (
                      userData.name || "-"
                    )}
                  </h1>
                  <div className="flex gap-2">
                    {!isAdmin && (
                      <>
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              disabled={saving}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="border-border text-card-foreground bg-transparent"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/admin")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Admin Dashboard
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground font-medium">Email</Label>
                    {isEditing && !isAdmin ? (
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="text-muted-foreground">{userData.email || "-"}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {isAdmin ? "∞R$" : fmtR(wallet?.available)}
                    </p>
                    <p className="text-sm text-muted-foreground">Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      {isAdmin ? "∞" : userData.totalTrades}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{userData.successRate}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>

                {/* Wallet detail errors (optional) */}
                {!isAdmin && walletErr && (
                  <div className="text-xs text-red-500">Wallet: {walletErr}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={isAdmin ? "admin" : "items"} className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"} bg-card`}>
          {!isAdmin && (
            <TabsTrigger
              value="items"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              My Items
            </TabsTrigger>
          )}
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Settings
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="admin"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Admin Controls
            </TabsTrigger>
          )}
        </TabsList>

        {!isAdmin && (
          <TabsContent value="items">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  My Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemsLoading && <div className="text-muted-foreground">Loading…</div>}
                {itemsErr && <div className="text-red-500">Error: {itemsErr}</div>}
                {!itemsLoading && !itemsErr && myItems.length === 0 && (
                  <div className="text-muted-foreground">No items.</div>
                )}

                {myItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="font-medium text-card-foreground">{it.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          #{it.category?.name ?? "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">
                        {Number(it.price || 0).toLocaleString()} R$
                      </p>
                      <Badge
                        variant={it.status === 1 ? "secondary" : "default"}
                        className={
                          it.status === 1
                            ? "bg-blue-500/20 text-blue-400"
                            : it.status === 2
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-muted"
                        }
                      >
                        {it.status === 1 ? "Available" : it.status === 2 ? "Reserved" : "Unknown"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="settings">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-card-foreground">Robux Points</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    {walletLoading ? (
                      <div className="text-muted-foreground">Loading wallet…</div>
                    ) : walletErr ? (
                      <div className="text-red-500">Error: {walletErr}</div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-card-foreground">Current Balance</span>
                          <span className="text-2xl font-bold text-accent">
                            {fmtR(wallet?.available)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Balance (total): {fmtR(wallet?.balance)}</div>
                          <div>Held: {fmtR(wallet?.held)}</div>
                          <div className="text-xs">
                            Updated:{" "}
                            {wallet?.updatedAt
                              ? new Date(wallet.updatedAt).toLocaleString()
                              : "-"}
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push("/add-money")}
                          className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Add Robux
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Account Actions</h3>
                <div className="space-y-2">
                  {isAdmin ? (
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => {
                        localStorage.removeItem("isAdmin");
                        localStorage.removeItem("currentUser");
                        router.push("/");
                      }}
                    >
                      Logout Admin
                    </Button>
                  ) : (
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/admin")}
                    className="bg-red-500 hover:bg-red-600 text-white p-6 h-auto flex-col"
                  >
                    <Package className="h-8 w-8 mb-2" />
                    <span className="text-lg font-semibold">Manage Orders</span>
                    <span className="text-sm opacity-90">View and manage all user orders</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-card-foreground bg-transparent p-6 h-auto flex-col"
                    disabled
                  >
                    <Star className="h-8 w-8 mb-2" />
                    <span className="text-lg font-semibold">User Management</span>
                    <span className="text-sm opacity-60">Coming Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
