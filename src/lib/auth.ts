import { NextRequest } from "next/server";
import { User } from "@/types";
import { db } from "./db";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Function to get a JWT for a user
// In a real app this would generate and sign a JWT token
// For this demo, we'll just create a simple string with the user ID
function generateAuthToken(userId: string): string {
  return `auth_${userId}_${Date.now()}`;
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: string,
  companyName: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = db.users.find((user) => user.email === email);
    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    // Create new user
    const userId = uuidv4();
    const newUser: User = {
      id: userId,
      email,
      name,
      role,
      companyName,
      password, // In a real app, this would be hashed
      createdAt: new Date(),
    };

    // Add user to database
    db.users.push(newUser);

    // Create auth token
    const token = generateAuthToken(userId);
    
    // In a real app, we would set a cookie with the token
    // Store token in localStorage instead of using cookies() API for our simple demo
    // client side handling of this is in auth-context.tsx

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Find user by email
    const user = db.users.find((user) => user.email === email);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check password
    if (user.password !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create auth token
    const token = generateAuthToken(user.id);
    
    // In a real app, we would set a cookie with the token
    // Store token in localStorage instead of using cookies() API for our simple demo
    // client side handling of this is in auth-context.tsx

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return null;
    }

    // Parse token to get user ID
    // In a real app, this would validate the JWT
    const userId = token.split("_")[1];
    if (!userId) {
      return null;
    }

    // Find user by ID
    const user = db.users.find((user) => user.id === userId);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

export async function getUserFromToken(token: string | undefined): Promise<User | null> {
  try {
    if (!token) {
      return null;
    }

    // Parse token to get user ID
    // In a real app, this would validate the JWT
    const userId = token.split("_")[1];
    if (!userId) {
      return null;
    }

    // Find user by ID
    const user = db.users.find((user) => user.id === userId);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}

export async function logout() {
  // Cookie handling is done on client side instead
  return { success: true };
}
