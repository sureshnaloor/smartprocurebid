"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard");
        } else {
          // No session found, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your request...</h1>
        <p className="text-gray-600">Please wait while we verify your email.</p>
      </div>
    </div>
  );
} 