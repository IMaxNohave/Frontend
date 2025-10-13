// user-profile.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Save,
  X,
  Star,
  Package,
  Shield,
  LayoutDashboard,
  BarChart3,
  Wrench,
  Users,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";

// ——— UI helpers ———
function StatCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <Card className={`bg-card border-border hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-muted/60">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-card-foreground leading-none">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserProfile() {
  const router = useRouter();

  // ดึง state/Actions จาก store
  const {
    isAdmin,
    me,
    meLoading,
    meError,
    wallet,
    walletLoading,
    walletError,
    myItems,
    myItemsLoading,
    myItemsError,
    bootstrap,
    fetchMyItems,
    updateMe,
  } = useUserStore();

  const isReady = useAuthStore((s: any) => s.isReady);

  // bootstrap ตอนเข้าเพจ
  useEffect(() => {
    if (!isReady) return;
    bootstrap();
  }, [isReady, bootstrap]);

  // โหลด items (เฉพาะ user ปกติ)
  useEffect(() => {
    if (isAdmin || !isReady) return;
    const ctrl = new AbortController();
    fetchMyItems(ctrl.signal);
    return () => ctrl.abort();
  }, [isAdmin, isReady, fetchMyItems]);

  // local UI: edit
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });

  // sync form เมื่อ me มา
  useEffect(() => {
    if (me) setEditData({ name: me.name || "", email: me.email || "" });
  }, [me]);

  const handleSave = useCallback(async () => {
    if (isAdmin) return; // แอดมินไม่แก้ที่นี่
    try {
      setSaving(true);
      await updateMe({ name: editData.name, email: editData.email });
      setIsEditing(false);
    } catch (e: any) {
      alert(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }, [isAdmin, editData, updateMe]);

  // utils แสดงผล
  const joinDate = useMemo(() => {
    if (!me?.createdAt) return "-";
    try {
      return new Date(me.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return me.createdAt;
    }
  }, [me?.createdAt]);

  const fmtR = (v?: string | number) => {
    if (v === undefined || v === null) return "0 R$";
    if (typeof v === "string" && v.includes("∞")) return "∞R$";
    const n = Number(v);
    if (!isFinite(n)) return "∞R$";
    return `${n.toLocaleString()} R$`;
  };

  // Loading รวม ๆ
  const pageLoading = meLoading || walletLoading;

  // ————————————————————————————————————————————————————————————
  // ADMIN VIEW: สวยขึ้น + มี Hero + Quick Actions + Stats
  // ————————————————————————————————————————————————————————————
  if (!pageLoading && isAdmin) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_30%)]" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-accent/40">
                <AvatarImage src={me?.image || "/roblox-avatar.png"} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  {(me?.name || "AD").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">
                    {me?.name || "Admin"}
                  </h1>
                  <Badge className="bg-red-500/90 text-white uppercase tracking-wide">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {me?.email || "-"}
                </p>
              </div>
            </div>

            <div className="md:ml-auto flex flex-wrap gap-2">
              <Button
                onClick={() => router.push("/admin")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Open Admin Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-border"
                onClick={() => router.push("/marketplace")}
              >
                Go to Marketplace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="bg-card border-border hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push("/admin")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">Overview</p>
                <p className="text-xs text-muted-foreground">
                  Orders, disputes, revenue
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push("/admin?tab=orders")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15">
                <Package className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">Manage Orders</p>
                <p className="text-xs text-muted-foreground">Approve / resolve</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push("/admin?tab=users")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/15">
                <Users className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">Users</p>
                <p className="text-xs text-muted-foreground">Accounts & roles</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push("/admin?tab=settings")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15">
                <Wrench className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">Settings</p>
                <p className="text-xs text-muted-foreground">Platform configs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ADMIN STATS (mock จาก wallet/me; ต่อจริงกับ /v1/admin/stats ก็ได้) */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="h-5 w-5 text-blue-500" />}
            label="Active Orders"
            value={"—"}
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-emerald-500" />}
            label="Total Users"
            value={"—"}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5 text-violet-500" />}
            label="Disputes Open"
            value={"—"}
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-amber-500" />}
            label="Revenue (R$)"
            value={fmtR(wallet?.available)} // โชว์เป็นตัวอย่าง
          />
        </div> */}

        {/* PROFILE CARD (อ่านอย่างเดียวสำหรับ Admin) */}
        {/* <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={me?.image || "/roblox-avatar.png"} />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {(me?.name || "AD").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {me?.name || "-"}
                  </h2>
                  <Badge variant="secondary" className="bg-red-500/15 text-red-600">
                    Admin role
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{me?.email || "-"}</p>
              </div>
              <Button
                size="sm"
                onClick={() => router.push("/admin")}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div> 
    );
  }

  // ————————————————————————————————————————————————————————————
  // USER VIEW (ปรับเล็ก ๆ ให้เนี้ยบขึ้น)
  // ————————————————————————————————————————————————————————————
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {pageLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading profile…
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar + badge */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4 ring-2 ring-accent/30">
                  <AvatarImage src={me?.image || "/roblox-avatar.png"} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                    {(me?.name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-xs text-muted-foreground mt-1">
                  Joined: {joinDate}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-card-foreground">
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      me?.name || "-"
                    )}
                  </h1>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditData({
                              name: me?.name || "",
                              email: me?.email || "",
                            });
                          }}
                          className="border-border text-card-foreground bg-transparent"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground font-medium">Email</Label>
                    {isEditing ? (
                      <Input
                        value={editData.email}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, email: e.target.value }))
                        }
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="text-muted-foreground">{me?.email || "-"}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {fmtR(wallet?.available)}
                    </p>
                    <p className="text-sm text-muted-foreground">Balance</p>
                  </div>
                </div>

                {walletError && (
                  <div className="text-xs text-red-500">Wallet: {walletError}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: My Items */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsContent value="items">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                My Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myItemsLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              )}
              {myItemsError && myItemsError !== "canceled" && (
                <div className="text-red-500">Error: {myItemsError}</div>
              )}
              {!myItemsLoading && !myItemsError && myItems.length === 0 && (
                <div className="text-muted-foreground">No items.</div>
              )}

              {myItems.map((it: any) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
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
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
