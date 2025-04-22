import { db } from './db';
import { 
  users, type User, type InsertUser,
  vendors, type Vendor, type InsertVendor,
  bids, type Bid, type InsertBid,
  bidRequirements, type BidRequirement, type InsertBidRequirement,
  bidItems, type BidItem, type InsertBidItem,
  vendorInvitations, type VendorInvitation, type InsertVendorInvitation,
  vendorSubmissions, type VendorSubmission, type InsertVendorSubmission,
  vendorItemResponses, type VendorItemResponse, type InsertVendorItemResponse,
  vendorMaterialClasses, type VendorMaterialClass, type InsertVendorMaterialClass
} from '@/shared/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vendor operations
  getVendors(buyerId: number): Promise<Vendor[]>;
  getVendorById(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Bid operations
  getBids(buyerId: number): Promise<Bid[]>;
  getBidById(id: number): Promise<Bid | undefined>;
  getBidByIdForVendor(bidId: number, vendorId: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid, requirements: InsertBidRequirement, items: InsertBidItem[], invitedVendors: InsertVendorInvitation[]): Promise<Bid>;
  updateBid(id: number, bid: Partial<Bid>): Promise<Bid>;
  deleteBid(id: number): Promise<void>;
  extendBidDueDate(id: number, newDueDate: Date): Promise<Bid>;
  
  // Invitation operations
  addVendorsToBid(bidId: number, vendors: InsertVendorInvitation[]): Promise<void>;
  
  // Submission operations
  submitVendorResponse(bidId: number, vendorId: number, submission: InsertVendorSubmission, itemResponses: InsertVendorItemResponse[]): Promise<void>;
  
  // Reminder operations
  sendReminders(bidId: number): Promise<void>;
}

// PostgreSQL storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Vendor operations
  async getVendors(buyerId: number): Promise<(Vendor & { materialClasses: VendorMaterialClass[] })[]> {
    const vendorsList = await db.select().from(vendors).where(eq(vendors.buyerId, buyerId));
    
    // Get all material classes for these vendors
    const result: (Vendor & { materialClasses: VendorMaterialClass[] })[] = [];
    
    for (const vendor of vendorsList) {
      const materialClasses = await db.select()
        .from(vendorMaterialClasses)
        .where(eq(vendorMaterialClasses.vendorId, vendor.id));
      
      result.push({
        ...vendor,
        materialClasses
      });
    }
    
    return result;
  }

  async getVendorById(id: number): Promise<(Vendor & { materialClasses: VendorMaterialClass[] }) | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    
    if (!vendor) return undefined;
    
    const materialClasses = await db.select()
      .from(vendorMaterialClasses)
      .where(eq(vendorMaterialClasses.vendorId, id));
    
    return {
      ...vendor,
      materialClasses
    };
  }

  async createVendor(vendor: InsertVendor & { materialClasses?: string[] }): Promise<Vendor & { materialClasses: VendorMaterialClass[] }> {
    // Extract material classes if present
    const { materialClasses: materialClassNames, ...vendorData } = vendor as any;
    
    // Create the vendor
    const [newVendor] = await db.insert(vendors).values(vendorData).returning();
    
    // Add material classes if provided
    const materialClasses: VendorMaterialClass[] = [];
    
    if (materialClassNames && materialClassNames.length > 0) {
      for (const className of materialClassNames) {
        const [materialClass] = await db.insert(vendorMaterialClasses)
          .values({
            vendorId: newVendor.id,
            materialClass: className
          })
          .returning();
        
        materialClasses.push(materialClass);
      }
    }
    
    return {
      ...newVendor,
      materialClasses
    };
  }

  // Bid operations
  async getBids(buyerId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.buyerId, buyerId));
  }

  async getBidById(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async getBidByIdForVendor(bidId: number, vendorId: number): Promise<Bid | undefined> {
    // Check if the vendor is invited to this bid
    const invitationExists = await db.select()
      .from(vendorInvitations)
      .where(and(
        eq(vendorInvitations.bidId, bidId),
        eq(vendorInvitations.vendorId, vendorId)
      ));

    if (invitationExists.length === 0) {
      return undefined;
    }

    const [bid] = await db.select().from(bids).where(eq(bids.id, bidId));
    return bid;
  }

  async createBid(
    bid: InsertBid,
    requirements: InsertBidRequirement,
    items: InsertBidItem[],
    invitedVendors: InsertVendorInvitation[]
  ): Promise<Bid> {
    // Create the bid
    const [newBid] = await db.insert(bids).values(bid).returning();
    
    // Add requirements
    await db.insert(bidRequirements).values({
      ...requirements,
      bidId: newBid.id,
    });
    
    // Add items
    for (const item of items) {
      await db.insert(bidItems).values({
        ...item,
        bidId: newBid.id,
      });
    }
    
    // Add invited vendors
    for (const vendor of invitedVendors) {
      await db.insert(vendorInvitations).values({
        ...vendor,
        bidId: newBid.id,
      });
    }
    
    return newBid;
  }

  async updateBid(id: number, bidData: Partial<Bid>): Promise<Bid> {
    const [updatedBid] = await db
      .update(bids)
      .set(bidData)
      .where(eq(bids.id, id))
      .returning();
    
    return updatedBid;
  }

  async deleteBid(id: number): Promise<void> {
    // Delete all related records first
    await db.delete(vendorItemResponses)
      .where(eq(vendorSubmissions.bidId, id));
    
    await db.delete(vendorSubmissions)
      .where(eq(vendorSubmissions.bidId, id));
    
    await db.delete(vendorInvitations)
      .where(eq(vendorInvitations.bidId, id));
    
    await db.delete(bidItems)
      .where(eq(bidItems.bidId, id));
    
    await db.delete(bidRequirements)
      .where(eq(bidRequirements.bidId, id));
    
    // Finally delete the bid
    await db.delete(bids).where(eq(bids.id, id));
  }

  async extendBidDueDate(id: number, newDueDate: Date): Promise<Bid> {
    const [updatedBid] = await db
      .update(bids)
      .set({ dueDate: newDueDate })
      .where(eq(bids.id, id))
      .returning();
    
    return updatedBid;
  }

  async addVendorsToBid(bidId: number, vendors: InsertVendorInvitation[]): Promise<void> {
    // Add only vendors that don't already exist in the bid
    for (const vendor of vendors) {
      const existing = await db.select()
        .from(vendorInvitations)
        .where(and(
          eq(vendorInvitations.bidId, bidId),
          eq(vendorInvitations.vendorId, vendor.vendorId)
        ));
      
      if (existing.length === 0) {
        await db.insert(vendorInvitations).values({
          ...vendor,
          bidId,
        });
      }
    }
  }

  async submitVendorResponse(
    bidId: number,
    vendorId: number,
    submission: InsertVendorSubmission,
    itemResponses: InsertVendorItemResponse[]
  ): Promise<void> {
    // Create the submission
    const [newSubmission] = await db.insert(vendorSubmissions)
      .values({
        ...submission,
        bidId,
        vendorId,
      })
      .returning();
    
    // Add item responses
    for (const response of itemResponses) {
      await db.insert(vendorItemResponses).values({
        ...response,
        submissionId: newSubmission.id,
      });
    }
    
    // Update the invitation status
    await db.update(vendorInvitations)
      .set({ 
        hasResponded: true,
        respondedAt: new Date(),
      })
      .where(and(
        eq(vendorInvitations.bidId, bidId),
        eq(vendorInvitations.vendorId, vendorId)
      ));
  }

  async sendReminders(bidId: number): Promise<void> {
    await db.update(bids)
      .set({ lastReminderSent: new Date() })
      .where(eq(bids.id, bidId));
  }
}

// Create and export a singleton instance
export const storage = new DatabaseStorage();