import { COLORS } from "@/app/constants/colors";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import Comment from "./Comment";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Loader } from "./Loader";

type CommentModel = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
};

export default function CommentModel({
  postId,
  visible,
  onClose,
  onCommentAdded,
}: CommentModel) {
  const [comment, setComment] = useState("");

  const comments = useQuery(api.comments.getComments, { postId });
  const addComments = useMutation(api.comments.addComment);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await addComments({
        postId,
        content: comment,
      });
      setComment("");
      onCommentAdded();
    } catch (error) {
      console.log("error while commenting", error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="leave your vibe..."
            placeholderTextColor={COLORS.grey}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!comment.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !comment.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
