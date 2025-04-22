"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-6 pt-6 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
} 