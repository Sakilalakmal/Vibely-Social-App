import { Loader } from "@/components/Loader";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../constants/colors";
import { Image } from "expo-image";

const BookMarkScreen = () => {
  const bookMarked = useQuery(api.bookmark.getBookMarkedPosts);

  if (bookMarked === undefined) return <Loader />;

  if (bookMarked.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vibing Bookmarks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {bookMarked.map((post) => {
          if (!post) return null;
          return (
            <View key={post._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={post.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

function NoBookmarksFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ color: COLORS.primary, fontSize: 22 }}>
        No bookmarked posts yet
      </Text>
    </View>
  );
}

export default BookMarkScreen;
