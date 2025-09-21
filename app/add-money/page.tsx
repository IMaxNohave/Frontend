"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Upload, QrCode, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReceipt(file)
      setVerificationStatus("idle")
    }
  }

  const handleSubmit = async () => {
    if (!amount || !receipt) return

    setIsVerifying(true)

    try {
      const formData = new FormData()
      formData.append("receipt", receipt)
      formData.append("amount", amount)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate random success/failure for demo
      const isValid = Math.random() > 0.3

      if (isValid) {
        setVerificationStatus("success")
        // Add money to user account
        setTimeout(() => {
          alert(`Successfully added ${Math.floor(Number(amount) * 80)} R$ to your account!`)
          setAmount("")
          setReceipt(null)
          setVerificationStatus("idle")
        }, 2000)
      } else {
        setVerificationStatus("error")
      }
    } catch (error) {
      setVerificationStatus("error")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Add Money", href: "/add-money" },
          ]}
        />

        <div className="max-w-2xl mx-auto mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add Money</h1>
            <p className="text-muted-foreground">Transfer money via QR code and upload your receipt</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-6 w-6 text-accent" />
                Scan QR Code to Transfer
              </CardTitle>
              <CardDescription>Scan the QR code below with your banking app to transfer money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-border">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mEEsSWVW8RegSRIiy8sFzN0YvG1weu.png"
                    alt="QR Code for payment"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-medium">
                  Amount Transferred (USD)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter the amount you transferred..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="text-lg p-4 h-12"
                />
                {amount && (
                  <p className="text-sm text-muted-foreground">
                    You will receive:{" "}
                    <span className="font-bold text-accent">{Math.floor(Number(amount) * 80)} R$</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-base font-medium">
                  Upload Receipt Proof
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                  <input id="receipt" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <label htmlFor="receipt" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {receipt ? receipt.name : "Click to upload your receipt"}
                    </p>
                    <Button variant="outline" type="button" className="pointer-events-none bg-transparent">
                      {receipt ? "Change File" : "Add File"}
                    </Button>
                  </label>
                </div>
                {receipt && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Receipt uploaded successfully
                  </div>
                )}
              </div>

              {verificationStatus !== "idle" && (
                <div className="p-4 rounded-lg border">
                  {verificationStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Receipt verified! Money will be added to your account.</span>
                    </div>
                  )}
                  {verificationStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>Receipt verification failed. Please check your receipt and try again.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setAmount("")
                    setReceipt(null)
                    setVerificationStatus("idle")
                  }}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSubmit}
                  disabled={!amount || !receipt || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Check & Add Money"
                  )}
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Instructions:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Scan the QR code with your banking app</li>
                  <li>Transfer the desired amount</li>
                  <li>Take a screenshot of the successful transaction</li>
                  <li>Upload the receipt and enter the exact amount transferred</li>
                  <li>Wait for verification (usually takes 1-3 minutes)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
