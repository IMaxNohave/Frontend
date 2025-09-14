"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, Send, Download, Eye } from "lucide-react"

export default function DisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const disputeId = params.id as string
  const [adminResponse, setAdminResponse] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [resolution, setResolution] = useState("")

  // Mock dispute data
  const dispute = {
    id: disputeId,
    itemName: "Dragon Fruit",
    itemImage: "/placeholder-se2ao.png",
    price: "500$",
    buyer: "Customer123",
    seller: "ProTrader123",
    status: "investigating",
    priority: "high",
    createdAt: new Date(Date.now() - 3600000),
    description: "Seller didn't deliver item after payment. I paid 500$ but never received the Dragon Fruit in game.",
    timeline: [
      { action: "Dispute created", time: new Date(Date.now() - 3600000), user: "Customer123" },
      { action: "Admin assigned", time: new Date(Date.now() - 3000000), user: "Admin" },
      { action: "Status changed to investigating", time: new Date(Date.now() - 2400000), user: "Admin" },
    ],
    evidence: [
      { id: "1", name: "payment_proof.png", type: "image", uploadedBy: "Customer123", url: "/placeholder.svg" },
      { id: "2", name: "chat_log.png", type: "image", uploadedBy: "Customer123", url: "/placeholder.svg" },
      { id: "3", name: "game_screenshot.png", type: "image", uploadedBy: "ProTrader123", url: "/placeholder.svg" },
    ],
    messages: [
      {
        id: "1",
        sender: "Customer123",
        content: "I paid but didn't receive the item",
        time: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        sender: "ProTrader123",
        content: "I was waiting in game but buyer never showed up",
        time: new Date(Date.now() - 3300000),
      },
      {
        id: "3",
        sender: "Admin",
        content: "I'm reviewing the evidence provided by both parties",
        time: new Date(Date.now() - 2400000),
      },
    ],
  }

  const handleStatusChange = () => {
    if (newStatus) {
      // TODO: Update dispute status
      console.log("Status changed to:", newStatus)
    }
  }

  const handleSendResponse = () => {
    if (adminResponse.trim()) {
      // TODO: Send admin response
      console.log("Admin response:", adminResponse)
      setAdminResponse("")
    }
  }

  const handleResolveDispute = () => {
    if (resolution) {
      // TODO: Resolve dispute with resolution
      console.log("Dispute resolved:", resolution)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Dispute Case: {disputeId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">INVESTIGATING</Badge>
              <Badge className="bg-red-500/20 text-red-500">HIGH PRIORITY</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Overview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Dispute Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={dispute.itemImage || "/placeholder.svg"}
                      alt={dispute.itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground">{dispute.itemName}</h3>
                    <p className="text-2xl font-bold text-accent">{dispute.price}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                    <p className="font-medium text-blue-500">{dispute.buyer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seller</p>
                    <p className="font-medium text-green-500">{dispute.seller}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-card-foreground">{dispute.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Evidence and Messages */}
            <Tabs defaultValue="evidence" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="evidence">Evidence ({dispute.evidence.length})</TabsTrigger>
                <TabsTrigger value="messages">Messages ({dispute.messages.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="evidence">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Evidence Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dispute.evidence.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                            <img
                              src={file.url || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-card-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded by{" "}
                              <span className={file.uploadedBy === dispute.buyer ? "text-blue-500" : "text-green-500"}>
                                {file.uploadedBy}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Dispute Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {dispute.messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`font-medium ${
                                  message.sender === "Admin"
                                    ? "text-purple-500"
                                    : message.sender === dispute.buyer
                                      ? "text-blue-500"
                                      : "text-green-500"
                                }`}
                              >
                                {message.sender}
                              </span>
                              <span className="text-xs text-muted-foreground">{message.time.toLocaleString()}</span>
                            </div>
                            <p className="text-card-foreground bg-muted/30 p-3 rounded-lg">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dispute.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          by {event.user} • {event.time.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Change Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusChange} className="w-full mt-2" disabled={!newStatus}>
                    Update Status
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Admin Response</label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Type your response to both parties..."
                    className="bg-input border-border"
                    rows={4}
                  />
                  <Button onClick={handleSendResponse} className="w-full mt-2" disabled={!adminResponse.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Resolution</label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund_buyer">Refund to Buyer</SelectItem>
                      <SelectItem value="release_seller">Release Payment to Seller</SelectItem>
                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                      <SelectItem value="no_action">No Action Required</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleResolveDispute}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                    disabled={!resolution}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Dispute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
