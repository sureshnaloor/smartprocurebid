"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorRegistrationForm } from "@/components/vendor/vendor-registration-form";

interface VendorProfile {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  business_type: string;
  description: string;
  website: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
}

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Vendor Profile Found</h1>
          <p className="mb-6">You need to complete your vendor registration first.</p>
          <Button onClick={() => router.push("/vendor/register")}>
            Complete Registration
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Edit Vendor Profile</h1>
          <VendorRegistrationForm initialData={profile} onSuccess={() => setIsEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{profile.company_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Contact Information</h3>
                <p>Contact Name: {profile.contact_name}</p>
                <p>Email: {profile.email}</p>
                <p>Phone: {profile.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold">Business Information</h3>
                <p>Business Type: {profile.business_type}</p>
                <p>Tax ID: {profile.tax_id}</p>
                <p>Website: {profile.website}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold">Address</h3>
                <p>{profile.address}</p>
                <p>{profile.city}, {profile.state} {profile.zip_code}</p>
                <p>{profile.country}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold">Description</h3>
                <p>{profile.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 