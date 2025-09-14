"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { CreditCard, Wallet, DollarSign, Shield, Zap } from "lucide-react"

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, fee: "2.9%" },
  { id: "paypal", name: "PayPal", icon: Wallet, fee: "3.4%" },
  { id: "crypto", name: "Cryptocurrency", icon: DollarSign, fee: "1.5%" },
]

const quickAmounts = [
  { robux: 400, usd: 4.99 },
  { robux: 800, usd: 9.99 },
  { robux: 1700, usd: 19.99 },
  { robux: 4500, usd: 49.99 },
  { robux: 10000, usd: 99.99 },
]

export default function AddMoneyPage() {
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null)

  const handleQuickAmountSelect = (amount: { robux: number; usd: number }) => {
    setSelectedQuickAmount(amount.robux)
    setCustomAmount(amount.usd.toString())
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

        <div className="max-w-4xl mx-auto mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add Money to Your Account</h1>
            <p className="text-muted-foreground">Purchase Robux to buy items on Ro Trade</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Purchase Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Quick Purchase
                </CardTitle>
                <CardDescription>Choose from popular Robux packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount.robux}
                    variant={selectedQuickAmount === amount.robux ? "default" : "outline"}
                    className="w-full justify-between h-auto p-4"
                    onClick={() => handleQuickAmountSelect(amount)}
                  >
                    <div className="text-left">
                      <div className="font-bold text-accent">{amount.robux.toLocaleString()} R$</div>
                      <div className="text-sm text-muted-foreground">Robux</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${amount.usd}</div>
                      <div className="text-sm text-muted-foreground">USD</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Custom Amount & Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter custom amount or use quick options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Custom Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedQuickAmount(null)
                    }}
                    min="1"
                    step="0.01"
                  />
                  {customAmount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ {Math.floor(Number.parseFloat(customAmount) * 80)} R$ (80 R$ per $1)
                    </p>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <Button
                        key={method.id}
                        variant={selectedMethod === method.id ? "default" : "outline"}
                        className="w-full justify-between h-auto p-4"
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" />
                          <span>{method.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{method.fee} fee</span>
                      </Button>
                    )
                  })}
                </div>

                {/* Security Notice */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Secure Payment</p>
                      <p className="text-muted-foreground">
                        Your payment information is encrypted and secure. We never store your payment details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3"
                  disabled={!customAmount || Number.parseFloat(customAmount) < 1}
                >
                  Purchase {customAmount && `$${customAmount} → ${Math.floor(Number.parseFloat(customAmount) * 80)} R$`}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History Preview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent Robux purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2024-01-15", amount: "$9.99", robux: "800 R$", status: "Completed" },
                  { date: "2024-01-10", amount: "$19.99", robux: "1,700 R$", status: "Completed" },
                  { date: "2024-01-05", amount: "$4.99", robux: "400 R$", status: "Completed" },
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{transaction.robux}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{transaction.amount}</p>
                      <p className="text-sm text-green-500">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
