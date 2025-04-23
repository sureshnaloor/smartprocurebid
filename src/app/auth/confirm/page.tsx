"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const email = searchParams.get("email");

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!email) {
        setError("No email provided");
        setLoading(false);
        return;
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user?.email === email && user?.email_confirmed_at) {
          setMessage("Email confirmed successfully! You can now log in.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setMessage("Please check your email for the confirmation link.");
        }
      } catch (error) {
        setError("Failed to verify email confirmation status.");
      } finally {
        setLoading(false);
      }
    };

    checkEmailConfirmation();
  }, [email, router]);

  const handleResendConfirmation = async () => {
    if (!email) return;
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      setMessage("Confirmation email has been resent. Please check your inbox.");
    } catch (error) {
      setError("Failed to resend confirmation email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Confirmation
          </CardTitle>
          <CardDescription className="text-center">
            {loading ? "Checking confirmation status..." : "Email confirmation status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && !message?.includes("successfully") && (
            <Button
              onClick={handleResendConfirmation}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend Confirmation Email"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 