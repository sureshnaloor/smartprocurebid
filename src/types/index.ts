// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'vendor';
  companyName?: string;
  createdAt?: string;
}

// Vendor types
export interface VendorMaterialClass {
  id: string;
  vendorId: string;
  materialClass: string;
}

export interface Vendor {
  id: string;
  buyerId: string;
  companyName: string;
  email: string;
  contactName?: string;
  phone?: string;
  tier: string;
  location?: string;
  materialClasses?: VendorMaterialClass[];
}

// Bid types
export interface BidItem {
  id: string;
  materialCode: string;
  description: string;
  quantity: number;
  uom: string;
  packaging?: string;
  remarks?: string;
}

export interface BidRequirements {
  tier: string;
  materialClass: string;
  location: string;
  minBidAmount: number;
}

export interface VendorInvitation {
  vendorId: string;
  email: string;
  companyName: string;
  hasResponded: boolean;
  respondedAt?: Date;
  response?: VendorSubmission;
}

export interface Bid {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  createdAt: Date;
  dueDate: Date;
  requirements: BidRequirements;
  items: BidItem[];
  invitedVendors: VendorInvitation[];
  lastReminderSent?: Date;
  buyer?: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
}

// Vendor submission types
export interface VendorItemResponse {
  itemId: string;
  price: number;
  leadTime: number;
  incoterm: string;
  paymentTerms: string;
}

export interface VendorHeaderResponse {
  incoterm: string;
  paymentTerms: string;
  additionalNotes?: string;
}

export interface VendorSubmission {
  vendorId: string;
  items: VendorItemResponse[];
  headerResponse?: VendorHeaderResponse;
}

export interface VendorResponse {
  vendorId: string;
  companyName: string;
  items: VendorItemResponse[];
  headerResponse?: VendorHeaderResponse;
  submittedAt: Date;
}
