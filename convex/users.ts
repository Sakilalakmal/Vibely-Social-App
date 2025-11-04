import { v } from "convex/values";
import { mutation } from "./_generated/server";



export const createUser = mutation({
  args: {
    username: v.string(),
    fullName: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    console.log("createUser mutation called with:", args);
    
    // First check if user already exists by clerkId
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists with clerkId:", args.clerkId);
      console.log("Existing user:", existingUser);
      return existingUser; // Return the existing user instead of creating a new one
    }

    // Also check by email to prevent duplicates if clerkId somehow changes
    const existingByEmail = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingByEmail) {
      console.log("User already exists with email:", args.email);
      console.log("Existing user by email:", existingByEmail);
      return existingByEmail;
    }

    console.log("Creating new user...");
    //create new user
    const newUser = await ctx.db.insert("users", {
      username: args.username,
      fullName: args.fullName,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
    
    console.log("User created with ID:", newUser);
    return newUser;
  },
});
