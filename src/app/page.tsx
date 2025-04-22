import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ProcureBid</h1>
          <div className="space-x-4">
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Login
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "default" })}>
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-8 text-gray-900">
              Streamline Your Procurement Process
            </h2>
            <p className="text-xl mb-10 text-gray-600 max-w-3xl mx-auto">
              Manage vendor bids, automate comparison tables, and validate submissions 
              with AI-powered tools designed for procurement professionals.
            </p>
            <Link href="/register" className={buttonVariants({ variant: "default", size: "lg" })}>
              Get Started
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Vendor Management" 
                description="Easily manage vendors based on tier, material class, location, and bid amount criteria."
                icon="🏢"
              />
              <FeatureCard 
                title="Automated Comparisons" 
                description="Generate comparison tables automatically from vendor submissions until the bid due date."
                icon="📊"
              />
              <FeatureCard 
                title="AI Validation" 
                description="Utilize AI to identify errors or inconsistencies in bid submissions."
                icon="🤖"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto py-8 px-6">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} ProcureBid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
