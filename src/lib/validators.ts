import { BidItem, VendorSubmission } from "@/types";

export function validateBidItems(items: BidItem[]): string | null {
  if (!items || items.length === 0) {
    return "At least one item is required";
  }

  for (const item of items) {
    if (!item.materialCode) {
      return "Material code is required for all items";
    }

    if (!item.description) {
      return "Description is required for all items";
    }

    if (!item.quantity || item.quantity <= 0) {
      return "Quantity must be a positive number for all items";
    }

    if (!item.uom) {
      return "Unit of measure is required for all items";
    }
  }

  return null;
}

export function validateBidRequirements(requirements: {
  tier: string;
  materialClass: string;
  location: string;
  minBidAmount: number;
}): string | null {
  const { tier, materialClass, location, minBidAmount } = requirements;

  if (!tier) {
    return "Tier selection is required";
  }

  if (!materialClass) {
    return "Material class selection is required";
  }

  if (!location) {
    return "Location selection is required";
  }

  if (minBidAmount < 0) {
    return "Minimum bid amount cannot be negative";
  }

  return null;
}

export function validateVendorSubmission(submission: VendorSubmission): string | null {
  if (!submission.vendorId) {
    return "Vendor ID is required";
  }

  // Check if at least one of items or header response is provided
  if ((!submission.items || submission.items.length === 0) && !submission.headerResponse) {
    return "Submission must include either item responses or header-level information";
  }

  // Validate item responses if provided
  if (submission.items && submission.items.length > 0) {
    for (const item of submission.items) {
      if (!item.itemId) {
        return "Item ID is required for all items";
      }

      if (item.price === undefined || isNaN(item.price) || item.price < 0) {
        return "Valid price is required for all items";
      }

      if (item.leadTime === undefined || isNaN(item.leadTime) || item.leadTime < 0) {
        return "Valid lead time is required for all items";
      }
    }
  }

  return null;
}
