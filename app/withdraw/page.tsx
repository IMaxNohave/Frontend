"use client";

import { useState, useEffect } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { WithdrawAdmin } from "@/components/withdraw-admin";
import { WithdrawUser } from "@/components/withdraw-user";
import { useAuthStore } from "@/stores/authStore";

export default function WithdrawPage() {
  const token = useAuthStore((s) => s.token);
  const [userType, setUserType] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        // เรียก API เพื่อเช็ค user type จาก token
        const response = await fetch("/api/auth/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // สมมติว่า Backend ส่ง user_type กลับมา
          setUserType(data.data?.user_type || 1);
        }
      } catch (error) {
        console.error("Failed to check user role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  // Check if user is admin (user_type = 2)
  const isAdmin = userType === 2;

  // Show admin view if user is admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <main className="container mx-auto px-4 py-8">
          <WithdrawAdmin />
        </main>
      </div>
    );
  }

  // User view
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <WithdrawUser />
        </div>
      </main>
    </div>
  );
}
