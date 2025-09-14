"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: "buyer" | "seller" | "admin"
  timestamp: Date
  status: "sent" | "delivered" | "read"
  type: "message" | "system" | "action"
}

interface TradingChatProps {
  orderId: string
  currentUserId: string
  currentUserRole: "buyer" | "seller"
}

export function TradingChat({ orderId, currentUserId, currentUserRole }: TradingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello, Ready to trade?",
      senderId: "buyer123",
      senderName: "Customer123",
      senderRole: "buyer",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: "read",
      type: "message",
    },
    {
      id: "2",
      content: "Yes, join me @BallChon",
      senderId: "seller456",
      senderName: "BallChon",
      senderRole: "seller",
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      status: "read",
      type: "message",
    },
    {
      id: "3",
      content: "Order status updated: Seller is ready",
      senderId: "system",
      senderName: "System",
      senderRole: "admin",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      status: "delivered",
      type: "system",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUserId,
      senderName: currentUserRole === "buyer" ? "You" : "You",
      senderRole: currentUserRole,
      timestamp: new Date(),
      status: "sent",
      type: "message",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // TODO: Send to backend
    // await sendMessageToOrder(orderId, message)

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageStatusIcon = (status: ChatMessage["status"]) => {
    switch (status) {
      case "sent":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground">In-Order Chat</CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentUserRole === "buyer" ? "Buyer" : "Seller"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Container */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId
            const isSystemMessage = message.type === "system"

            if (isSystemMessage) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    {message.content}
                  </div>
                </div>
              )
            }

            return (
              <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[70%] space-y-1">
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          message.senderRole === "buyer"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {message.senderRole === "buyer" ? "Buyer" : "Seller"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{message.senderName}</span>
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isOwnMessage ? "bg-accent text-accent-foreground ml-auto" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                      {isOwnMessage && getMessageStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span>Other party is typing...</span>
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-input border-border"
            maxLength={500}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-accent hover:bg-accent/90 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Message Guidelines */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <p className="font-medium mb-1">Chat Guidelines:</p>
          <ul className="space-y-1">
            <li>• Be respectful and professional</li>
            <li>• Share game coordinates and meeting details</li>
            <li>• Report any issues to admin immediately</li>
            <li>• Do not share personal information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
