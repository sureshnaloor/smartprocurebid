"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const handleConfirmation = async () => {
    if (!token || !type || !user) return;

    try {
      if (type === "email") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Confirmation error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Confirm Your {type === "email" ? "Email" : "Action"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Please click the button below to confirm your {type === "email" ? "email address" : "action"}.
          </p>
          <Button
            onClick={handleConfirmation}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Confirm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
} 