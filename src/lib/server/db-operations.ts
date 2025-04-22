// Import the 'server-only' package to ensure this file is only used on the server
import 'server-only';

import { storage } from '../../../server/storage';
import {
  User,
  Vendor,
  Bid,
  BidItem,
  VendorInvitation,
  VendorSubmission,
} from "@/types";

// Initialize with a sample bid for development purposes
let hasSampleData = false;

export async function initSampleData() {
  if (hasSampleData) return;
  
  try {
    // Sample buyer user
    const buyerUser = await storage.createUser({
      name: "Demo Buyer",
      email: "buyer@example.com",
      password: "password",
      role: "buyer",
      companyName: "Acme Corp",
    });
    
    // Sample vendor user
    await storage.createUser({
      name: "Demo Vendor",
      email: "vendor@example.com",
      password: "password",
      role: "vendor",
      companyName: "Supplier Inc",
    });
    
    // Sample vendors
    const vendor1 = await storage.createVendor({
      buyerId: buyerUser.id,
      companyName: "Supplier Inc",
      email: "contact@supplier.com",
      contactName: "John Smith",
      phone: "123-456-7890",
      tier: "tier1",
      location: "Domestic",
      materialClasses: ["Raw Materials", "Components"]
    });
    
    const vendor2 = await storage.createVendor({
      buyerId: buyerUser.id,
      companyName: "Global Parts Co",
      email: "info@globalparts.com",
      contactName: "Jane Doe",
      phone: "123-555-1234",
      tier: "tier2",
      location: "International",
      materialClasses: ["Components", "Electronics"]
    });
    
    await storage.createVendor({
      buyerId: buyerUser.id,
      companyName: "Local Packaging",
      email: "sales@localpkg.com",
      contactName: "Sam Johnson",
      phone: "123-555-6789",
      tier: "tier3",
      location: "Domestic",
      materialClasses: ["Packaging"]
    });
    
    // Sample bid
    const newBid = await storage.createBid(
      {
        buyerId: buyerUser.id,
        title: "Q1 Raw Materials Procurement",
        description: "Procurement for Q1 2023 raw materials inventory",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        bidId: 0, // This will be set by the createBid function
        tier: "all",
        materialClass: "raw",
        location: "all",
        minBidAmount: 1000,
      },
      [
        {
          bidId: 0, // This will be set by the createBid function
          materialCode: "RM-001",
          description: "Aluminum Sheet 2mm",
          quantity: 100,
          uom: "kg",
          packaging: "Bulk",
          remarks: "Must be ISO certified",
        },
        {
          bidId: 0, // This will be set by the createBid function
          materialCode: "RM-002",
          description: "Steel Rod 10mm",
          quantity: 200,
          uom: "pcs",
          packaging: "Bundle",
          remarks: "",
        }
      ],
      [
        {
          bidId: 0, // This will be set by the createBid function
          vendorId: vendor1.id,
          hasResponded: false,
        },
        {
          bidId: 0, // This will be set by the createBid function
          vendorId: vendor2.id,
          hasResponded: false,
        }
      ]
    );
    
    hasSampleData = true;
  } catch (error) {
    console.error("Failed to initialize sample data:", error);
  }
}

// Vendor functions
export async function getVendors(): Promise<Vendor[]> {
  // For now, assume we're using the first buyer account
  const user = await storage.getUserByUsername("buyer@example.com");
  if (!user) return [];
  
  const vendors = await storage.getVendors(user.id);
  
  // Convert to the expected format
  return vendors.map(v => ({
    id: v.id.toString(),
    buyerId: v.buyerId.toString(),
    companyName: v.companyName,
    email: v.email,
    contactName: v.contactName || undefined,
    phone: v.phone || undefined,
    tier: v.tier,
    location: v.location || undefined,
    materialClasses: v.materialClasses ? v.materialClasses.map(mc => ({
      id: mc.id.toString(),
      vendorId: mc.vendorId.toString(),
      materialClass: mc.materialClass
    })) : [],
  }));
}

export async function addVendor(vendorData: Omit<Vendor, "id"> & { materialClasses?: string[] }): Promise<Vendor> {
  // Extract material classes from vendorData if present
  const { materialClasses: materialClassesData, ...restVendorData } = vendorData;
  
  const newVendor = await storage.createVendor({
    buyerId: parseInt(restVendorData.buyerId),
    companyName: restVendorData.companyName,
    email: restVendorData.email,
    contactName: restVendorData.contactName,
    phone: restVendorData.phone,
    tier: restVendorData.tier,
    location: restVendorData.location,
    materialClasses: materialClassesData || [],
  });
  
  return {
    id: newVendor.id.toString(),
    buyerId: newVendor.buyerId.toString(),
    companyName: newVendor.companyName,
    email: newVendor.email,
    contactName: newVendor.contactName || undefined,
    phone: newVendor.phone || undefined,
    tier: newVendor.tier,
    location: newVendor.location || undefined,
    materialClasses: newVendor.materialClasses ? newVendor.materialClasses.map(mc => ({
      id: mc.id.toString(),
      vendorId: mc.vendorId.toString(),
      materialClass: mc.materialClass
    })) : [],
  };
}

// Bid functions
export async function getBids(buyerId: string): Promise<Bid[]> {
  const bids = await storage.getBids(parseInt(buyerId));
  
  // Convert to the expected format
  return bids.map(b => ({
    id: b.id.toString(),
    buyerId: b.buyerId.toString(),
    title: b.title,
    description: b.description || "",
    createdAt: b.createdAt,
    dueDate: b.dueDate,
    lastReminderSent: b.lastReminderSent || undefined,
    // Note: Requirements, items, and invitedVendors will need to be fetched separately
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  }));
}

export async function getBidById(bidId: string): Promise<Bid | null> {
  const bid = await storage.getBidById(parseInt(bidId));
  if (!bid) return null;
  
  // Convert to the expected format
  return {
    id: bid.id.toString(),
    buyerId: bid.buyerId.toString(),
    title: bid.title,
    description: bid.description || "",
    createdAt: bid.createdAt,
    dueDate: bid.dueDate,
    lastReminderSent: bid.lastReminderSent || undefined,
    // Note: Requirements, items, and invitedVendors will need to be fetched separately
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  };
}

export async function getBidByIdForVendor(bidId: string, vendorId: string): Promise<Bid | null> {
  const bid = await storage.getBidByIdForVendor(parseInt(bidId), parseInt(vendorId));
  if (!bid) return null;
  
  // Convert to the expected format
  return {
    id: bid.id.toString(),
    buyerId: bid.buyerId.toString(),
    title: bid.title,
    description: bid.description || "",
    createdAt: bid.createdAt,
    dueDate: bid.dueDate,
    lastReminderSent: bid.lastReminderSent || undefined,
    // Note: Requirements, items, and invitedVendors will need to be fetched separately
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  };
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
  const newBid = await storage.createBid(
    {
      buyerId: parseInt(bidData.buyerId),
      title: bidData.title,
      description: bidData.description,
      dueDate: bidData.dueDate,
    },
    {
      bidId: 0, // This will be set by the createBid function
      tier: bidData.requirements.tier,
      materialClass: bidData.requirements.materialClass,
      location: bidData.requirements.location,
      minBidAmount: bidData.requirements.minBidAmount,
    },
    bidData.items.map(item => ({
      bidId: 0, // This will be set by the createBid function
      materialCode: item.materialCode,
      description: item.description,
      quantity: item.quantity,
      uom: item.uom,
      packaging: item.packaging,
      remarks: item.remarks,
    })),
    bidData.invitedVendors.map(vendor => ({
      bidId: 0, // This will be set by the createBid function
      vendorId: parseInt(vendor.vendorId),
      hasResponded: false,
    }))
  );
  
  // Return a simplified response
  return {
    id: newBid.id.toString(),
    buyerId: newBid.buyerId.toString(),
    title: newBid.title,
    description: newBid.description || "",
    createdAt: newBid.createdAt,
    dueDate: newBid.dueDate,
    requirements: bidData.requirements,
    items: bidData.items,
    invitedVendors: bidData.invitedVendors,
  };
}

export async function updateBid(bidId: string, bidData: Partial<Bid>): Promise<Bid> {
  const updatedBid = await storage.updateBid(parseInt(bidId), {
    title: bidData.title,
    description: bidData.description,
    dueDate: bidData.dueDate,
    lastReminderSent: bidData.lastReminderSent,
  });
  
  // Return a simplified response
  return {
    id: updatedBid.id.toString(),
    buyerId: updatedBid.buyerId.toString(),
    title: updatedBid.title,
    description: updatedBid.description || "",
    createdAt: updatedBid.createdAt,
    dueDate: updatedBid.dueDate,
    lastReminderSent: updatedBid.lastReminderSent || undefined,
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  };
}

export async function deleteBid(bidId: string): Promise<void> {
  await storage.deleteBid(parseInt(bidId));
}

export async function extendBidDueDate(bidId: string, newDueDate: Date): Promise<Bid> {
  const updatedBid = await storage.extendBidDueDate(parseInt(bidId), newDueDate);
  
  // Return a simplified response
  return {
    id: updatedBid.id.toString(),
    buyerId: updatedBid.buyerId.toString(),
    title: updatedBid.title,
    description: updatedBid.description || "",
    createdAt: updatedBid.createdAt,
    dueDate: updatedBid.dueDate,
    lastReminderSent: updatedBid.lastReminderSent || undefined,
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  };
}

export async function addVendorsToBid(bidId: string, vendors: VendorInvitation[]): Promise<Bid> {
  await storage.addVendorsToBid(
    parseInt(bidId),
    vendors.map(vendor => ({
      bidId: parseInt(bidId),
      vendorId: parseInt(vendor.vendorId),
      hasResponded: false,
    }))
  );
  
  // Get the updated bid
  const updatedBid = await storage.getBidById(parseInt(bidId));
  if (!updatedBid) {
    throw new Error("Bid not found");
  }
  
  // Return a simplified response
  return {
    id: updatedBid.id.toString(),
    buyerId: updatedBid.buyerId.toString(),
    title: updatedBid.title,
    description: updatedBid.description || "",
    createdAt: updatedBid.createdAt,
    dueDate: updatedBid.dueDate,
    lastReminderSent: updatedBid.lastReminderSent || undefined,
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: vendors,
  };
}

export async function submitVendorResponse(
  bidId: string,
  vendorId: string,
  submission: VendorSubmission
): Promise<Bid> {
  await storage.submitVendorResponse(
    parseInt(bidId),
    parseInt(vendorId),
    {
      bidId: parseInt(bidId),
      vendorId: parseInt(vendorId),
      incoterm: submission.headerResponse?.incoterm,
      paymentTerms: submission.headerResponse?.paymentTerms,
      additionalNotes: submission.headerResponse?.additionalNotes,
    },
    submission.items.map(item => ({
      itemId: parseInt(item.itemId),
      submissionId: 0, // This will be set by the submitVendorResponse function
      price: item.price,
      leadTime: item.leadTime,
      incoterm: item.incoterm,
      paymentTerms: item.paymentTerms,
    }))
  );
  
  // Get the updated bid
  const updatedBid = await storage.getBidById(parseInt(bidId));
  if (!updatedBid) {
    throw new Error("Bid not found");
  }
  
  // Return a simplified response
  return {
    id: updatedBid.id.toString(),
    buyerId: updatedBid.buyerId.toString(),
    title: updatedBid.title,
    description: updatedBid.description || "",
    createdAt: updatedBid.createdAt,
    dueDate: updatedBid.dueDate,
    lastReminderSent: updatedBid.lastReminderSent || undefined,
    requirements: { tier: "", materialClass: "", location: "", minBidAmount: 0 },
    items: [],
    invitedVendors: [],
  };
}

export async function sendReminders(bidId: string): Promise<void> {
  await storage.sendReminders(parseInt(bidId));
}