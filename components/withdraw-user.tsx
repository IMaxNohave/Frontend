"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

type WithdrawRequestStatus = {
  id: string;
  amount: string;
  status: string;
  accountInfo: {
    bank: string;
    accountNo: string;
    accountHolder: string;
  };
  failureReason?: string | null;
  processedBy?: string | null;
  processedByName?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function WithdrawUser() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const fetchWallet = useUserStore((s) => s.fetchWallet);
  
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState("");
  
  // Status dialog states
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [myRequests, setMyRequests] = useState<WithdrawRequestStatus[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const fetchMyRequests = async () => {
    try {
      setLoadingStatus(true);
      const response = await fetch("/api/v1/withdraw/my-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMyRequests(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch requests:", e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleWithdraw = async () => {
    // Validation
    if (!amount || !bank || !accountNo || !accountHolder) {
      setResultType("error");
      setResultMessage("Please fill in all fields");
      setShowResultDialog(true);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setResultType("error");
      setResultMessage("Please enter a valid amount");
      setShowResultDialog(true);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/v1/withdraw/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNum,
          bank,
          accountNo,
          accountHolder,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit withdraw request");
      }

      // Success
      setResultType("success");
      setResultMessage(`Withdraw request for $${amountNum.toFixed(2)} has been submitted successfully! Please wait for admin approval.`);
      setShowResultDialog(true);
      
      // Clear form
      setAmount("");
      setBank("");
      setAccountNo("");
      setAccountHolder("");

      // Refetch wallet to update balance in navigation
      fetchWallet();
    } catch (e: any) {
      setResultType("error");
      setResultMessage(e?.message || "Failed to submit withdraw request");
      setShowResultDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount("");
    setBank("");
    setAccountNo("");
    setAccountHolder("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Withdraw $ Here
        </h1>
        <p className="text-muted-foreground">
          Withdraw your balance to your bank account
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowDownToLine className="h-5 w-5" />
              <span className="text-sm">Enter your withdrawal details</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowStatusDialog(true);
                fetchMyRequests();
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              View Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-card-foreground font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Bank Input */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-card-foreground font-medium">
              Bank
            </Label>
            <Input
              id="bank"
              type="text"
              placeholder="Enter bank name"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Account No Input */}
          <div className="space-y-2">
            <Label htmlFor="accountNo" className="text-card-foreground font-medium">
              Account No.
            </Label>
            <Input
              id="accountNo"
              type="text"
              placeholder="Enter account number"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Account Holder Input */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder" className="text-card-foreground font-medium">
              Account Holder
            </Label>
            <Input
              id="accountHolder"
              type="text"
              placeholder="Enter account holder name"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultType === "success" ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span>Request Submitted</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span>Request Failed</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {resultMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Withdraw Requests</DialogTitle>
            <DialogDescription>
              View the status of your withdrawal requests
            </DialogDescription>
          </DialogHeader>
          
          {loadingStatus ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowDownToLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No withdraw requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          ${parseFloat(req.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Requested: {new Date(req.createdAt).toLocaleString()}
                        </div>
                        {req.processedAt && (
                          <div className="text-sm text-muted-foreground">
                            Processed: {new Date(req.processedAt).toLocaleString()}
                          </div>
                        )}
                        {req.processedByName && (
                          <div className="text-sm text-muted-foreground">
                            Processed by: <span className="font-medium">{req.processedByName}</span>
                          </div>
                        )}
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="ml-2 font-medium">{req.accountInfo.bank}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Account No:</span>
                        <span className="ml-2 font-medium">{req.accountInfo.accountNo}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Account Holder:</span>
                        <span className="ml-2 font-medium">{req.accountInfo.accountHolder}</span>
                      </div>
                      {req.failureReason && req.status === "REJECTED" && (
                        <div className="col-span-2 pt-2 border-t border-border">
                          <span className="text-muted-foreground">Rejection Reason:</span>
                          <p className="ml-2 text-red-600 dark:text-red-400">{req.failureReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
