"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Save, X, Star, Package } from "lucide-react"

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "ProTrader123",
    email: "protrader@example.com",
    phone: "+1 (555) 123-4567",
    joinDate: "January 2024",
    totalTrades: 47,
    successRate: 98.5,
    rating: 4.9,
    balance: "2,450R$",
  })

  const [editData, setEditData] = useState(userData)

  const handleSave = () => {
    setUserData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const recentItems = [
    { id: 1, name: "Dragon Fruit", price: "500R$", status: "sold", date: "2 days ago" },
    { id: 2, name: "Shadow Sword", price: "750R$", status: "listed", date: "1 week ago" },
    { id: 3, name: "Golden Box", price: "1200R$", status: "sold", date: "2 weeks ago" },
  ]

  const achievements = [
    { name: "First Sale", description: "Complete your first trade", earned: true },
    { name: "Top Trader", description: "Complete 50 successful trades", earned: false },
    { name: "Trusted Seller", description: "Maintain 95%+ rating", earned: true },
    { name: "Big Spender", description: "Spend over 10,000R$", earned: false },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="/roblox-avatar.png" />
                <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                  {userData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className="bg-primary/20 text-primary mb-2">Verified Trader</Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-card-foreground">{userData.rating}</span>
                <span className="text-sm text-muted-foreground">({userData.totalTrades} trades)</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-card-foreground">
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  ) : (
                    userData.name
                  )}
                </h1>
                <div className="flex gap-2">
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
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Email</Label>
                  {isEditing ? (
                    <Input
                      value={editData.email}
                      onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground">{userData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground">{userData.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{userData.balance}</p>
                  <p className="text-sm text-muted-foreground">Balance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-card-foreground">{userData.totalTrades}</p>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{userData.successRate}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card">
          <TabsTrigger
            value="items"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            My Items
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{item.price}</p>
                    <Badge
                      variant={item.status === "sold" ? "default" : "secondary"}
                      className={
                        item.status === "sold" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <Star className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      achievement.earned ? "bg-accent/10 border-accent" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${achievement.earned ? "text-accent" : "text-muted-foreground"}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Robux Points</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-card-foreground">Current Balance</span>
                    <span className="text-2xl font-bold text-accent">{userData.balance}</span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Add Robux</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Account Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-card-foreground bg-transparent"
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-card-foreground bg-transparent"
                  >
                    Privacy Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-card-foreground bg-transparent"
                  >
                    Notification Preferences
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
