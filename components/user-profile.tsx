"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, X, Star, Package } from "lucide-react";
import { api } from "@/app/services/api";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";

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

  const isReady = useAuthStore((s) => s.isReady);

  // bootstrap ตอนเข้าเพจ
  useEffect(() => {
    if (!isReady) return;
    bootstrap();
  }, [isReady]);

  // โหลด items (เฉพาะ user ปกติ)
  useEffect(() => {
    if (isAdmin || !isReady) return;
    const ctrl = new AbortController();
    fetchMyItems(ctrl.signal);
    return () => ctrl.abort();
  }, [isAdmin, isReady]);

  // local UI: edit
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });

  // sync form เมื่อ me มา
  useEffect(() => {
    if (me) setEditData({ name: me.name || "", email: me.email || "" });
  }, [me]);

  const handleSave = useCallback(async () => {
    if (isAdmin) return;
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {pageLoading ? (
            <div className="text-muted-foreground">Loading profile…</div>
          ) : meError ? (
            <div className="text-red-500">Error: {meError}</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar + Badge */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={me?.image || "/roblox-avatar.png"} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                    {(me?.name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-xs text-muted-foreground mt-1">
                  Joined: {isAdmin ? "-" : joinDate}
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
                        disabled={isAdmin}
                      />
                    ) : (
                      me?.name || "-"
                    )}
                  </h1>
                  <div className="flex gap-2">
                    {!isAdmin &&
                      (isEditing ? (
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
                      ))}
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
                    <Label className="text-card-foreground font-medium">
                      Email
                    </Label>
                    {isEditing && !isAdmin ? (
                      <Input
                        value={editData.email}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, email: e.target.value }))
                        }
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {me?.email || "-"}
                      </p>
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
                  {/* เติมสถิติจริงเมื่อแบ็กเอนด์พร้อม */}
                </div>

                {!isAdmin && walletError && (
                  <div className="text-xs text-red-500">
                    Wallet: {walletError}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: My Items */}
      {!isAdmin && (
        <Tabs defaultValue="items" className="space-y-6">
          {/* <TabsList className="grid w-full grid-cols-2 bg-card">
            <TabsTrigger
              value="items"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              My Items
            </TabsTrigger> */}
          {/* <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Settings
            </TabsTrigger> */}
          {/* </TabsList> */}

          <TabsContent value="items">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                  My Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myItemsLoading && (
                  <div className="text-muted-foreground">Loading…</div>
                )}
                {myItemsError && (
                  <div className="text-red-500">Error: {myItemsError}</div>
                )}
                {!myItemsLoading && !myItemsError && myItems.length === 0 && (
                  <div className="text-muted-foreground">No items.</div>
                )}

                {myItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="font-medium text-card-foreground">
                          {it.name}
                        </h3>
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
      )}
    </div>
  );
}
