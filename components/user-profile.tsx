"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, X, Star, Package } from "lucide-react";
import { useRouter } from "next/navigation";

type MeDTO = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type MyItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;           // service แคสต์เป็น number แล้ว
  status: number;          // 1=Available, 2=Reserved ...
  seller_name: string | null;
  detail: string | null;
  category: { id: string | null; name: string | null; detail: string | null };
};


function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

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

  // สิ่งที่หน้าโชว์
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "-",                 // ยังไม่ได้มีใน schema → placeholder
    joinDate: "-",              // แปลงจาก createdAt
    totalTrades: 0,             // ยังไม่มีใน schema → placeholder
    successRate: 100,           // placeholder
    rating: 5.0,                // placeholder
    balance: "0R$",             // placeholder
    image: "" as string | null, // สำหรับ Avatar
  });

  // ฟอร์มแก้ไข
  const [editData, setEditData] = useState(userData);

  // โหลดข้อมูลผู้ใช้จาก /api/auth/user/me
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // ตรวจสถานะ admin mock เหมือนเดิม (ถ้าคุณไม่ใช้จริง ลบทิ้งได้)
        const adminStatus = localStorage.getItem("isAdmin");
        if (adminStatus === "true") {
          if (!alive) return;
          setIsAdmin(true);
          const admin = {
            name: "Admin",
            email: "admin@gmail.com",
            phone: "+1 (555) ADMIN",
            totalTrades: 0,
            successRate: 100,
            rating: 5.0,
            balance: "∞R$",
            joinDate: "-",
            image: null as string | null,
          };
          setUserData((prev) => ({ ...prev, ...admin }));
          setEditData((prev) => ({ ...prev, ...admin }));
          return;
        }

        // 1) หยิบ token ถ้ามี
        const token = localStorage.getItem("token") || "";

        // 2) ยิง /api/auth/user/me
        //    - ถ้ามี token จะส่ง Authorization header
        //    - ถ้าไม่มี token จะลองด้วย cookie session (credentials: "include")
        const res = await fetch("/api/auth/user/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : {};

        if (!res.ok || !json?.success) {
          throw new Error(json?.error || `Load profile failed (${res.status})`);
        }

        const me: MeDTO = json.data;
        if (!alive) return;

        const mapped = {
          name: me.name || "",
          email: me.email || "",
          phone: "-", // ไม่มีใน schema
          joinDate: fmtDate(me.createdAt),
          totalTrades: 0,
          successRate: 100,
          rating: 5.0,
          balance: "0R$",
          image: me.image ?? null,
        };

        setUserData(mapped);
        setEditData(mapped);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Load profile failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

const handleSave = async () => {
  if (isAdmin) return;

  setSaving(true);
  setErr(null);

  try {
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/auth/user/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editData.name,
        email: editData.email,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json?.success) throw new Error(json?.error || "Update failed");

    // อัปเดตหน้าตามค่าที่เพิ่งแก้
    setUserData((p) => ({ ...p, name: editData.name, email: editData.email }));
    setIsEditing(false);
    // ถ้าอยากดึงข้อมูลใหม่จากเซิร์ฟเวอร์ด้วยก็เพิ่ม:
    // router.refresh(); // (App Router)
    // หรือ window.location.reload();
  } catch (e: any) {
    setErr(e?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};

useEffect(() => {
  let alive = true;
  (async () => {
    try {
      setItemsLoading(true);
      setItemsErr(null);
      const token = localStorage.getItem("token") || "";
      const r = await fetch("/api/v1/home/my-items?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        cache: "no-store",
      });
      const txt = await r.text();
      const j = txt ? JSON.parse(txt) : {};
      if (!r.ok || !j?.success) throw new Error(j?.error || `Load my items failed (${r.status})`);
      if (!alive) return;
      setMyItems(Array.isArray(j.data) ? j.data : []);
    } catch (e:any) {
      if (alive) setItemsErr(e?.message || "Load my items failed");
    } finally {
      if (alive) setItemsLoading(false);
    }
  })();
  return () => { alive = false; };
}, []);


  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleAddRobux = () => {
    router.push("/add-money");
  };

  const recentItems = [
    { id: 1, name: "Dragon Fruit", price: "500R$", status: "sold", date: "2 days ago" },
    { id: 2, name: "Shadow Sword", price: "750R$", status: "listed", date: "1 week ago" },
    { id: 3, name: "Golden Box", price: "1200R$", status: "sold", date: "2 weeks ago" },
  ];

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
                <Badge
                  className={
                    isAdmin ? "bg-red-500/20 text-red-400 mb-2" : "bg-primary/20 text-primary mb-2"
                  }
                >
                  {isAdmin ? "System Administrator" : "Verified Trader"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-card-foreground">{userData.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({isAdmin ? "Admin" : `${userData.totalTrades} trades`})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Joined: {userData.joinDate}
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
                          setEditData((prev) => ({ ...prev, name: e.target.value }))
                        }
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
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
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
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="text-muted-foreground">{userData.email || "-"}</p>
                    )}
                  </div>

                  {/* <div className="space-y-2">
                    <Label className="text-card-foreground font-medium">Phone</Label>
                    {isEditing && !isAdmin ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="text-muted-foreground">{userData.phone}</p>
                    )}
                  </div> */}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{userData.balance}</p>
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
                  <div key={it.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-card-foreground">Current Balance</span>
                      <span className="text-2xl font-bold text-accent">{userData.balance}</span>
                    </div>
                    <Button
                      onClick={handleAddRobux}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Add Robux
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Account Actions</h3>
                <div className="space-y-2">
                  {/* {!isAdmin && (
                    // <Button
                    //   variant="outline"
                    //   className="w-full justify-start border-border text-card-foreground bg-transparent"
                    // >
                    //   Change Password
                    // </Button>
                  )} */}
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
