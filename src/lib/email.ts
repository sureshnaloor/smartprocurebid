// This file is now client-safe with no direct nodemailer imports
import { Bid, Vendor } from "@/types";
import { format } from 'date-fns';

// Base URL for email links
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Mock email send function for development
export async function sendEmail(options: EmailOptions) {
  const { to, subject, html } = options;
  
  // For development environment, just log that we would send an email
  console.log(`[Email Service] Would send email:
    To: ${Array.isArray(to) ? to.join(", ") : to}
    Subject: ${subject}
    Content: ${html.substring(0, 150)}...
  `);
  
  // In production, we would use a real email service
  return { success: true };
}

// Use simple HTML templates instead of React components
function generateBidInvitationEmail({
  bidId,
  vendorId,
  bidTitle,
  dueDate,
  buyerName,
  companyName,
  bidDescription,
  itemCount,
  baseUrl,
}: {
  bidId: string;
  vendorId: string;
  bidTitle: string;
  dueDate: Date;
  buyerName: string;
  companyName: string;
  bidDescription?: string;
  itemCount: number;
  baseUrl: string;
}): string {
  const formattedDueDate = format(new Date(dueDate), 'MMMM dd, yyyy');
  const vendorLink = `${baseUrl}/vendor/${bidId}?vendorId=${vendorId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bid Invitation: ${bidTitle}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .button { display: inline-block; background: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bid Invitation: ${bidTitle}</h1>
          <p>From ${companyName}</p>
        </div>
        
        <p>Hello,</p>
        <p>${buyerName} from ${companyName} has invited you to participate in a procurement bid.</p>
        
        <h2>Bid Details:</h2>
        <ul>
          <li><strong>Title:</strong> ${bidTitle}</li>
          <li><strong>Due Date:</strong> ${formattedDueDate}</li>
          <li><strong>Items:</strong> ${itemCount} items</li>
        </ul>
        
        ${bidDescription ? `<p><strong>Description:</strong> ${bidDescription}</p>` : ''}
        
        <p>Please click the button below to view the bid details and submit your response:</p>
        
        <a href="${vendorLink}" class="button">View Bid Details</a>
        
        <div class="footer">
          <p>This email was sent by the procurement system on behalf of ${companyName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBidReminderEmail({
  bidId,
  vendorId,
  bidTitle,
  dueDate,
  buyerName,
  companyName,
  daysRemaining,
  baseUrl,
}: {
  bidId: string;
  vendorId: string;
  bidTitle: string;
  dueDate: Date;
  buyerName: string;
  companyName: string;
  daysRemaining: number;
  baseUrl: string;
}): string {
  const formattedDueDate = format(new Date(dueDate), 'MMMM dd, yyyy');
  const vendorLink = `${baseUrl}/vendor/${bidId}?vendorId=${vendorId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bid Reminder: ${bidTitle}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .alert { background: #ffe9e9; color: #d00; padding: 10px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bid Reminder: ${bidTitle}</h1>
          <p>From ${companyName}</p>
        </div>
        
        <p>Hello,</p>
        <p>This is a friendly reminder from ${buyerName} at ${companyName} about the procurement bid you were invited to participate in.</p>
        
        <div class="alert">
          <p><strong>Important:</strong> The bid is due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} (${formattedDueDate}).</p>
        </div>
        
        <h2>Bid Details:</h2>
        <ul>
          <li><strong>Title:</strong> ${bidTitle}</li>
          <li><strong>Due Date:</strong> ${formattedDueDate}</li>
        </ul>
        
        <p>Please click the button below to view the bid details and submit your response:</p>
        
        <a href="${vendorLink}" class="button">View Bid Details</a>
        
        <div class="footer">
          <p>This email was sent by the procurement system on behalf of ${companyName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBidSubmissionEmail({
  bidId,
  bidTitle,
  vendorName,
  submissionDate,
  itemCount,
  hasHeaderInfo,
  buyerName,
  baseUrl,
}: {
  bidId: string;
  bidTitle: string;
  vendorName: string;
  submissionDate: Date;
  itemCount: number;
  hasHeaderInfo: boolean;
  buyerName: string;
  baseUrl: string;
}): string {
  const formattedSubmissionDate = format(new Date(submissionDate), 'MMMM dd, yyyy');
  const bidLink = `${baseUrl}/dashboard/bids/${bidId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bid Response Received: ${bidTitle}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .success { background: #e6f7e6; color: #0a0; padding: 10px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bid Response Received: ${bidTitle}</h1>
        </div>
        
        <p>Hello ${buyerName},</p>
        
        <div class="success">
          <p><strong>Good news!</strong> ${vendorName} has submitted a response to your bid.</p>
        </div>
        
        <h2>Submission Details:</h2>
        <ul>
          <li><strong>Vendor:</strong> ${vendorName}</li>
          <li><strong>Submission Date:</strong> ${formattedSubmissionDate}</li>
          <li><strong>Items Quoted:</strong> ${itemCount} items</li>
          <li><strong>Header Information:</strong> ${hasHeaderInfo ? 'Included' : 'Not included'}</li>
        </ul>
        
        <p>Please click the button below to view the full submission details:</p>
        
        <a href="${bidLink}" class="button">View Submission</a>
        
        <div class="footer">
          <p>This email was sent automatically by your procurement system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBidInvitations(bid: Bid, vendors: Vendor[]) {
  try {
    // For each vendor, send an invitation email
    for (const vendor of vendors) {
      // Find the vendor invitation in the bid
      const invitation = bid.invitedVendors.find(v => v.vendorId === vendor.id);
      if (!invitation) continue;
      
      // Generate the email HTML
      const emailHtml = generateBidInvitationEmail({
        bidId: bid.id,
        vendorId: vendor.id,
        bidTitle: bid.title,
        dueDate: bid.dueDate,
        buyerName: bid.buyer?.name || "",
        companyName: bid.buyer?.companyName || "",
        bidDescription: bid.description,
        itemCount: bid.items.length,
        baseUrl,
      });
      
      // Send the email
      await sendEmail({
        to: vendor.email,
        subject: `Bid Invitation: ${bid.title}`,
        html: emailHtml,
      });
    }
  } catch (error) {
    console.error("Failed to send bid invitations:", error);
    throw new Error("Failed to send bid invitations");
  }
}

export async function sendBidExtensionNotifications(bid: Bid) {
  try {
    // Get vendors who haven't responded yet
    const pendingVendors = bid.invitedVendors.filter(vendor => !vendor.hasResponded);
    
    // For each pending vendor, send a notification
    for (const vendor of pendingVendors) {
      // Calculate days remaining
      const dueDate = new Date(bid.dueDate);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate the email HTML
      const emailHtml = generateBidReminderEmail({
        bidId: bid.id,
        vendorId: vendor.vendorId,
        bidTitle: bid.title,
        dueDate: bid.dueDate,
        buyerName: bid.buyer?.name || "",
        companyName: bid.buyer?.companyName || "",
        daysRemaining,
        baseUrl,
      });
      
      // Send the email
      await sendEmail({
        to: vendor.email,
        subject: `Bid Due Date Extended: ${bid.title}`,
        html: emailHtml,
      });
    }
  } catch (error) {
    console.error("Failed to send bid extension notifications:", error);
    throw new Error("Failed to send bid extension notifications");
  }
}

export async function sendSubmissionNotification(bid: Bid, vendorId: string) {
  try {
    // Find the vendor
    const vendor = bid.invitedVendors.find(v => v.vendorId === vendorId);
    if (!vendor || !vendor.hasResponded || !vendor.response) {
      throw new Error("Vendor submission not found");
    }
    
    // Get buyer email
    const buyerEmail = bid.buyer?.email;
    if (!buyerEmail) {
      throw new Error("Buyer email not found");
    }
    
    // Check if vendor included header info
    const hasHeaderInfo = !!vendor.response.headerResponse;
    
    // Generate the email HTML
    const emailHtml = generateBidSubmissionEmail({
      bidId: bid.id,
      bidTitle: bid.title,
      vendorName: vendor.companyName,
      submissionDate: vendor.respondedAt || new Date(),
      itemCount: vendor.response.items.length,
      hasHeaderInfo,
      buyerName: bid.buyer?.name || "",
      baseUrl,
    });
    
    // Send the email
    await sendEmail({
      to: buyerEmail,
      subject: `Bid Response Received: ${bid.title}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send submission notification:", error);
    throw new Error("Failed to send submission notification");
  }
}
