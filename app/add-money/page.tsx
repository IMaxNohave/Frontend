"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MarketplaceHeader } from "@/components/marketplace-header";
import {
  Upload,
  QrCode,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUploadSlip } from "@/hooks/useUploadSlip";
import { useUserStore } from "@/stores/userStore";

export default function AddMoneyPage() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const fetchWallet = useUserStore((s) => s.fetchWallet);

  const {
    uploadAndVerify,
    state,
    error,
    message,
    isUploading,
    isVerifying,
    isDone,
  } = useUploadSlip();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceipt(file);
      setVerificationStatus("idle");
    }
  };

  const handleSubmit = async () => {
    if (!receipt) return; // ✅ ไม่ต้องมี amount แล้ว

    try {
      const result = await uploadAndVerify(receipt); // ✅ ส่งเฉพาะไฟล์สลิป

      if (result.success) {
        setVerificationStatus("success");
        fetchWallet(); // รีเฟรชยอดเงิน
        alert(`✅ ${result.message}`);
      } else {
        setVerificationStatus("error");
        alert(`⚠️ ${result.message}`);
      }
    } catch (e) {
      setVerificationStatus("error");
      alert(`❌ ${(e as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Add Money
            </h1>
            <p className="text-muted-foreground">
              Upload your transfer receipt to verify
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-6 w-6 text-accent" />
                Scan QR Code to Transfer
              </CardTitle>
              <CardDescription>
                Scan with your banking app, then upload the receipt
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-border">
                  <img
                    src="https://pub-b154f3e2da92433ca95a88bda2406f50.r2.dev/553663340_1615982986029271_1819258205979535341_n.jpg"
                    alt="QR Code for payment"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* Upload receipt */}
              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-base font-medium">
                  Upload Receipt Proof
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {receipt ? receipt.name : "Click to upload your receipt"}
                    </p>
                    <Button
                      variant="outline"
                      type="button"
                      className="pointer-events-none bg-transparent"
                    >
                      {receipt ? "Change File" : "Add File"}
                    </Button>
                  </label>
                </div>

                {receipt && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Receipt selected
                  </div>
                )}
              </div>

              {/* Verification result */}
              {verificationStatus !== "idle" && (
                <div className="p-4 rounded-lg border">
                  {verificationStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Receipt verified! We’ll add the credit to your account.
                      </span>
                    </div>
                  )}
                  {verificationStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>
                        Receipt verification failed. Please try another image.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setReceipt(null);
                    setVerificationStatus("idle");
                  }}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>

                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSubmit}
                  disabled={!receipt || isVerifying} // ✅ เหลือเงื่อนไขนี้พอ
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Slip"
                  )}
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Instructions:
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Scan the QR code with your banking app</li>
                  <li>Complete the transfer</li>
                  <li>Upload the transfer receipt image</li>
                  <li>Press “Verify Slip”</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
