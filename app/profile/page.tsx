"use client";

import { MarketplaceHeader } from "@/components/marketplace-header";
import { UserProfile } from "@/components/user-profile";
import { useEffect } from "react";
//import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useUserStore } from "@/stores/userStore";

export default function ProfilePage() {
  // useEffect(() => {
  //   console.log(useUserStore.getState());
  // }, [useUserStore]);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        {/* <BreadcrumbNav /> */}
        <UserProfile />
      </div>
    </div>
  );
}
