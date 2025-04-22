import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, primaryKey, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Vendors table
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  tier: varchar('tier', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

// Vendor Material Classes table (many-to-many)
export const vendorMaterialClasses = pgTable('vendor_material_classes', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  materialClass: varchar('material_class', { length: 255 }).notNull(),
},
(table) => {
  return {
    uniqueConstraint: primaryKey(table.vendorId, table.materialClass),
  }
});

export type VendorMaterialClass = typeof vendorMaterialClasses.$inferSelect;
export type InsertVendorMaterialClass = typeof vendorMaterialClasses.$inferInsert;

// Bids table
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  dueDate: timestamp('due_date').notNull(),
  lastReminderSent: timestamp('last_reminder_sent'),
});

export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;

// Bid requirements table
export const bidRequirements = pgTable('bid_requirements', {
  id: serial('id').primaryKey(),
  bidId: integer('bid_id').references(() => bids.id).notNull(),
  tier: varchar('tier', { length: 50 }).notNull(),
  materialClass: varchar('material_class', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  minBidAmount: integer('min_bid_amount').notNull(),
});

export type BidRequirement = typeof bidRequirements.$inferSelect;
export type InsertBidRequirement = typeof bidRequirements.$inferInsert;

// Bid items table
export const bidItems = pgTable('bid_items', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  bidId: integer('bid_id').references(() => bids.id).notNull(),
  materialCode: varchar('material_code', { length: 100 }).notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  uom: varchar('uom', { length: 50 }).notNull(),
  packaging: varchar('packaging', { length: 100 }),
  remarks: text('remarks'),
});

export type BidItem = typeof bidItems.$inferSelect;
export type InsertBidItem = typeof bidItems.$inferInsert;

// Vendor invitations table
export const vendorInvitations = pgTable('vendor_invitations', {
  id: serial('id').primaryKey(),
  bidId: integer('bid_id').references(() => bids.id).notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  hasResponded: boolean('has_responded').default(false).notNull(),
  respondedAt: timestamp('responded_at'),
},
(table) => {
  return {
    pk: primaryKey(table.bidId, table.vendorId),
  }
});

export type VendorInvitation = typeof vendorInvitations.$inferSelect;
export type InsertVendorInvitation = typeof vendorInvitations.$inferInsert;

// Vendor submissions table
export const vendorSubmissions = pgTable('vendor_submissions', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  bidId: integer('bid_id').references(() => bids.id).notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  incoterm: varchar('incoterm', { length: 100 }),
  paymentTerms: varchar('payment_terms', { length: 100 }),
  additionalNotes: text('additional_notes'),
},
(table) => {
  return {
    pk: primaryKey(table.bidId, table.vendorId),
  }
});

export type VendorSubmission = typeof vendorSubmissions.$inferSelect;
export type InsertVendorSubmission = typeof vendorSubmissions.$inferInsert;

// Vendor item responses table
export const vendorItemResponses = pgTable('vendor_item_responses', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').references(() => vendorSubmissions.id).notNull(),
  itemId: integer('item_id').references(() => bidItems.id).notNull(),
  price: integer('price').notNull(),
  leadTime: integer('lead_time').notNull(),
  incoterm: varchar('incoterm', { length: 100 }).notNull(),
  paymentTerms: varchar('payment_terms', { length: 100 }).notNull(),
});

export type VendorItemResponse = typeof vendorItemResponses.$inferSelect;
export type InsertVendorItemResponse = typeof vendorItemResponses.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bids: many(bids),
  vendors: many(vendors),
}));

export const vendorMaterialClassesRelations = relations(vendorMaterialClasses, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorMaterialClasses.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  buyer: one(users, {
    fields: [vendors.buyerId],
    references: [users.id],
  }),
  materialClasses: many(vendorMaterialClasses),
  invitations: many(vendorInvitations),
  submissions: many(vendorSubmissions),
}));

export const bidsRelations = relations(bids, ({ one, many }) => ({
  buyer: one(users, {
    fields: [bids.buyerId],
    references: [users.id],
  }),
  requirements: one(bidRequirements),
  items: many(bidItems),
  invitations: many(vendorInvitations),
  submissions: many(vendorSubmissions),
}));

export const bidItemsRelations = relations(bidItems, ({ one, many }) => ({
  bid: one(bids, {
    fields: [bidItems.bidId],
    references: [bids.id],
  }),
  responses: many(vendorItemResponses),
}));

export const vendorInvitationsRelations = relations(vendorInvitations, ({ one }) => ({
  bid: one(bids, {
    fields: [vendorInvitations.bidId],
    references: [bids.id],
  }),
  vendor: one(vendors, {
    fields: [vendorInvitations.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorSubmissionsRelations = relations(vendorSubmissions, ({ one, many }) => ({
  bid: one(bids, {
    fields: [vendorSubmissions.bidId],
    references: [bids.id],
  }),
  vendor: one(vendors, {
    fields: [vendorSubmissions.vendorId],
    references: [vendors.id],
  }),
  itemResponses: many(vendorItemResponses),
}));

export const vendorItemResponsesRelations = relations(vendorItemResponses, ({ one }) => ({
  submission: one(vendorSubmissions, {
    fields: [vendorItemResponses.submissionId],
    references: [vendorSubmissions.id],
  }),
  item: one(bidItems, {
    fields: [vendorItemResponses.itemId],
    references: [bidItems.id],
  }),
}));