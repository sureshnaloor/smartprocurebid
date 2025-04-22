import { BidItem, VendorSubmission } from "@/types";
import { validateBidItems as validateItems } from "./validators";
import { validateVendorSubmission as validateVendorSubmission } from "./validators";

// DeepSeek API integration for AI validation
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "default_key";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Define validation result interface
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export async function validateBidItems(items: BidItem[]): Promise<ValidationResult> {
  try {
    // First perform basic validation
    const validationError = validateItems(items);
    if (validationError) {
      return {
        isValid: false,
        message: validationError,
      };
    }

    // For the MVP, we'll use a simpler approach
    // In a production app, we would integrate with the DeepSeek API here
    
    // Check for potential issues in item descriptions
    const potentialIssues = items.filter(item => {
      const description = item.description.toLowerCase();
      
      // Flag very short descriptions
      if (description.length < 5) {
        return true;
      }
      
      // Flag potentially inappropriate content
      const inappropriateTerms = ["test", "dummy", "sample", "xxx", "fake"];
      if (inappropriateTerms.some(term => description.includes(term))) {
        return true;
      }
      
      // Flag suspicious quantities
      if (item.quantity > 10000) {
        return true;
      }
      
      return false;
    });
    
    if (potentialIssues.length > 0) {
      return {
        isValid: false,
        message: `Potential issues detected in ${potentialIssues.length} items. Please review the material codes and descriptions for accuracy.`,
      };
    }
    
    // If DeepSeek API is enabled, we would make the API call here
    /*
    if (DEEPSEEK_API_KEY !== "default_key") {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that validates procurement bid items for quality and completeness."
            },
            {
              role: "user",
              content: `Please validate the following bid items and identify any potential issues: ${JSON.stringify(items)}`
            }
          ],
          temperature: 0.2,
        }),
      });
      
      const result = await response.json();
      
      if (result.choices && result.choices[0].message) {
        const aiResponse = result.choices[0].message.content;
        
        // Parse AI response to determine validation result
        if (aiResponse.toLowerCase().includes("issue") || 
            aiResponse.toLowerCase().includes("error") || 
            aiResponse.toLowerCase().includes("concern")) {
          return {
            isValid: false,
            message: aiResponse,
          };
        }
      }
    }
    */
    
    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error validating bid items with AI:", error);
    // Default to valid if AI validation fails
    return {
      isValid: true,
    };
  }
}

export async function validateSubmission(submission: VendorSubmission): Promise<ValidationResult> {
  try {
    // First perform basic validation
    const validationError = validateVendorSubmission(submission);
    if (validationError) {
      return {
        isValid: false,
        message: validationError,
      };
    }

    // For the MVP, we'll use a simpler approach
    // In a production app, we would integrate with the DeepSeek API here
    
    // Check for potential issues in item responses
    if (submission.items && submission.items.length > 0) {
      const potentialIssues = submission.items.filter(item => {
        // Flag extremely low or high prices
        if (item.price <= 0.01 || item.price > 1000000) {
          return true;
        }
        
        // Flag unrealistic lead times
        if (item.leadTime <= 0 || item.leadTime > 365) {
          return true;
        }
        
        return false;
      });
      
      if (potentialIssues.length > 0) {
        return {
          isValid: false,
          message: `Potential issues detected in ${potentialIssues.length} items. Please review the prices and lead times for accuracy.`,
        };
      }
    }
    
    // If DeepSeek API is enabled, we would make the API call here
    /*
    if (DEEPSEEK_API_KEY !== "default_key") {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that validates vendor bid submissions for quality and completeness."
            },
            {
              role: "user",
              content: `Please validate the following vendor submission and identify any potential issues: ${JSON.stringify(submission)}`
            }
          ],
          temperature: 0.2,
        }),
      });
      
      const result = await response.json();
      
      if (result.choices && result.choices[0].message) {
        const aiResponse = result.choices[0].message.content;
        
        // Parse AI response to determine validation result
        if (aiResponse.toLowerCase().includes("issue") || 
            aiResponse.toLowerCase().includes("error") || 
            aiResponse.toLowerCase().includes("concern")) {
          return {
            isValid: false,
            message: aiResponse,
          };
        }
      }
    }
    */
    
    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error validating submission with AI:", error);
    // Default to valid if AI validation fails
    return {
      isValid: true,
    };
  }
}
