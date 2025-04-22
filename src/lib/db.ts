import { v4 as uuidv4 } from "uuid";
import {
  User,
  Vendor,
  Bid,
  BidItem,
  VendorInvitation,
  VendorSubmission,
} from "@/types";

// In-memory database for our MVP as a fallback
interface Database {
  users: User[];
  vendors: Vendor[];
  bids: Bid[];
}

// Initialize database with some sample data
export const db: Database = {
  users: [
    {
      id: "u1",
      name: "Demo Buyer",
      email: "buyer@example.com",
      password: "password",
      role: "buyer",
      companyName: "Acme Corp",
      createdAt: new Date("2023-01-01"),
    },
    {
      id: "u2",
      name: "Demo Vendor",
      email: "vendor@example.com",
      password: "password",
      role: "vendor",
      companyName: "Supplier Inc",
      createdAt: new Date("2023-01-02"),
    },
  ],
  vendors: [
    {
      id: "v1",
      buyerId: "u1",
      companyName: "Supplier Inc",
      email: "contact@supplier.com",
      contactName: "John Smith",
      phone: "123-456-7890",
      tier: "tier1",
      location: "Domestic",
      materialClasses: [
        { id: "mc1", vendorId: "v1", materialClass: "Raw Materials" },
        { id: "mc2", vendorId: "v1", materialClass: "Components" }
      ],
    },
    {
      id: "v2",
      buyerId: "u1",
      companyName: "Global Parts Co",
      email: "info@globalparts.com",
      contactName: "Jane Doe",
      phone: "123-555-1234",
      tier: "tier2",
      location: "International",
      materialClasses: [
        { id: "mc3", vendorId: "v2", materialClass: "Components" },
        { id: "mc4", vendorId: "v2", materialClass: "Electronics" }
      ],
    },
    {
      id: "v3",
      buyerId: "u1",
      companyName: "Local Packaging",
      email: "sales@localpkg.com",
      contactName: "Sam Johnson",
      phone: "123-555-6789",
      tier: "tier3",
      location: "Domestic",
      materialClasses: [
        { id: "mc5", vendorId: "v3", materialClass: "Packaging" },
      ],
    },
  ],
  bids: [],
};

// Create a sample bid for testing
const sampleBid: Bid = {
  id: "b1",
  buyerId: "u1",
  title: "Q1 Raw Materials Procurement",
  description: "Procurement for Q1 2023 raw materials inventory",
  createdAt: new Date("2023-01-10"),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  requirements: {
    tier: "all",
    materialClass: "raw",
    location: "all",
    minBidAmount: 1000,
  },
  items: [
    {
      id: "i1",
      materialCode: "RM-001",
      description: "Aluminum Sheet 2mm",
      quantity: 100,
      uom: "kg",
      packaging: "Bulk",
      remarks: "Must be ISO certified",
    },
    {
      id: "i2",
      materialCode: "RM-002",
      description: "Steel Rod 10mm",
      quantity: 200,
      uom: "pcs",
      packaging: "Bundle",
      remarks: "",
    },
  ],
  invitedVendors: [
    {
      vendorId: "v1",
      email: "contact@supplier.com",
      companyName: "Supplier Inc",
      hasResponded: false,
    },
    {
      vendorId: "v2",
      email: "info@globalparts.com",
      companyName: "Global Parts Co",
      hasResponded: false,
    },
  ],
  buyer: {
    id: "u1",
    name: "Demo Buyer",
    email: "buyer@example.com",
    companyName: "Acme Corp",
  },
};

// Add the sample bid to the database
db.bids.push(sampleBid);

// Vendor functions
export async function getVendors(): Promise<Vendor[]> {
  return db.vendors;
}

export async function addVendor(vendorData: Omit<Vendor, "id" | "materialClasses"> & { materialClasses?: string[] }): Promise<Vendor> {
  // Extract material classes from vendorData if present
  const { materialClasses: materialClassNames, ...restVendorData } = vendorData;
  
  const newVendor: Vendor = {
    id: uuidv4(),
    ...restVendorData,
    materialClasses: []
  };
  
  // Add material classes if provided
  if (materialClassNames && materialClassNames.length > 0) {
    newVendor.materialClasses = materialClassNames.map(className => ({
      id: uuidv4(),
      vendorId: newVendor.id,
      materialClass: className
    }));
  }
  
  db.vendors.push(newVendor);
  return newVendor;
}

// Bid functions
export async function getBids(buyerId: string): Promise<Bid[]> {
  return db.bids.filter(bid => bid.buyerId === buyerId);
}

export async function getBidById(bidId: string): Promise<Bid | null> {
  const bid = db.bids.find(bid => bid.id === bidId);
  if (!bid) return null;
  
  // Attach buyer information
  const buyer = db.users.find(user => user.id === bid.buyerId);
  if (buyer) {
    const { password, ...buyerInfo } = buyer;
    bid.buyer = buyerInfo;
  }
  
  return bid;
}

export async function getBidByIdForVendor(bidId: string, vendorId: string): Promise<Bid | null> {
  const bid = db.bids.find(bid => bid.id === bidId);
  if (!bid) return null;
  
  // Check if vendor is invited
  const isInvited = bid.invitedVendors.some(v => v.vendorId === vendorId);
  if (!isInvited) return null;
  
  // Attach buyer information
  const buyer = db.users.find(user => user.id === bid.buyerId);
  if (buyer) {
    const { password, ...buyerInfo } = buyer;
    bid.buyer = buyerInfo;
  }
  
  return bid;
}

export async function createBid(bidData: {
  buyerId: string;
  title: string;
  description: string;
  dueDate: Date;
  requirements: {
    tier: string;
    materialClass: string;
    location: string;
    minBidAmount: number;
  };
  items: BidItem[];
  invitedVendors: VendorInvitation[];
}): Promise<Bid> {
  const buyer = db.users.find(user => user.id === bidData.buyerId);
  if (!buyer) {
    throw new Error("Buyer not found");
  }
  
  const newBid: Bid = {
    id: uuidv4(),
    ...bidData,
    createdAt: new Date(),
    buyer: {
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      companyName: buyer.companyName,
    },
  };
  
  db.bids.push(newBid);
  return newBid;
}

export async function updateBid(bidId: string, bidData: Partial<Bid>): Promise<Bid> {
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  db.bids[bidIndex] = {
    ...db.bids[bidIndex],
    ...bidData,
  };
  
  return db.bids[bidIndex];
}

export async function deleteBid(bidId: string): Promise<void> {
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  db.bids.splice(bidIndex, 1);
}

export async function extendBidDueDate(bidId: string, newDueDate: Date): Promise<Bid> {
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  db.bids[bidIndex].dueDate = newDueDate;
  
  return db.bids[bidIndex];
}

export async function addVendorsToBid(bidId: string, vendors: VendorInvitation[]): Promise<Bid> {
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  // Add only vendors that don't already exist in the bid
  const existingVendorIds = new Set(db.bids[bidIndex].invitedVendors.map(v => v.vendorId));
  const newVendors = vendors.filter(v => !existingVendorIds.has(v.vendorId));
  
  db.bids[bidIndex].invitedVendors = [
    ...db.bids[bidIndex].invitedVendors,
    ...newVendors,
  ];
  
  return db.bids[bidIndex];
}

export async function submitVendorResponse(
  bidId: string,
  vendorId: string,
  submission: VendorSubmission
): Promise<Bid> {
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  // Find the vendor in the bid
  const vendorIndex = db.bids[bidIndex].invitedVendors.findIndex(v => v.vendorId === vendorId);
  if (vendorIndex === -1) {
    throw new Error("Vendor not invited to this bid");
  }
  
  // Update vendor's response status
  db.bids[bidIndex].invitedVendors[vendorIndex].hasResponded = true;
  db.bids[bidIndex].invitedVendors[vendorIndex].respondedAt = new Date();
  db.bids[bidIndex].invitedVendors[vendorIndex].response = submission;
  
  return db.bids[bidIndex];
}

export async function sendReminders(bidId: string): Promise<void> {
  // In a real application, this would send actual reminders
  // For the MVP, we'll just mark that reminders were sent
  const bidIndex = db.bids.findIndex(bid => bid.id === bidId);
  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }
  
  db.bids[bidIndex].lastReminderSent = new Date();
}
