"use client";

import { VendorRegistrationForm } from "@/components/vendor/vendor-registration-form";

export default function VendorRegistrationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Vendor Registration</h1>
        <VendorRegistrationForm />
      </div>
    </div>
  );
} 