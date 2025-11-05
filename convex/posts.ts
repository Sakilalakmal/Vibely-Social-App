import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (!imageUrl) {
      throw new Error("Failed to get image URL from storage ID");
    }

    //create posts
    const postId = await ctx.db.insert("posts", {
      userId: user._id,
      storageId: args.storageId,
      imageUrl,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    //increment number of posts for user
    await ctx.db.patch(user._id, {
      posts: user.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    console.log(currentUser);

    //get all posts for user
    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length === 0) {
      return [];
    }

    //emhance with userdata
    const postWithUserData = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        const bookMarks = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!likes,
          isBookMarked: !!bookMarks,
        };
      })
    );

    return postWithUserData;
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    if (existingLike) {
      //remove like
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      //if this is not current user own post, create notification

      if (post.userId.toString() !== currentUser._id.toString()) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          postId: args.postId,
          type: "like",
        });
      }

      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId.toString() !== currentUser._id.toString()) {
      throw new Error("Unauthorized");
    }

    //delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    //delete all associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    //delete all associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    //delete post image from storage
    await ctx.storage.delete(post.storageId);

    //delete post
    await ctx.db.delete(args.postId);

    //decrement user's post count
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts - 1,
    });
  },
});
