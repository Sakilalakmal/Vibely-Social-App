import { COLORS } from "@/app/constants/colors";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { styles } from "@/styles/feed.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommentModel from "./CommentModel";

//interface
type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookMarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [isBookMarked, setIsBookMarked] = useState(post.isBookMarked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmark.toggleBookMark);
  const deletePost = useMutation(api.posts.deletePost);

  const { user } = useUser();

  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id!,
  });

  const handleLike = async () => {
    try {
      const newLike = await toggleLike({ postId: post._id });
      setLiked(newLike);
      setLikesCount((prev) => (newLike ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookMarks = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookMarked(newIsBookmarked);
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePost({ postId: post._id });
          },
        },
      ]);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.post}>
      {/*header*/}
      <View style={styles.postHeader}>
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {/* if current user owner of the post let delete it */}

        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDeletePost}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={"red"} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={"red"} />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/*post image*/}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy={"memory-disk"}
      />
      {/*post actions*/}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowComments(true);
            }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookMarks}>
          <Ionicons
            name={isBookMarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
      {/*post Info*/}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <CommentModel
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
      />
    </View>
  );
}
