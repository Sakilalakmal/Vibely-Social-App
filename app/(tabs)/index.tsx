import StoryUi from "@/components/Story";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { STORIES } from "../constants/mock.data";
import { Loader } from "@/components/Loader";
import Post from "@/components/Post";

export default function HomeScreen() {
  const { signOut } = useAuth();

  const posts = useQuery(api.posts.getFeedPosts);

  if (posts === undefined) {
    return <Loader />; // Or a loading indicator
  }

  if (posts?.length === 0) {
    return <NoPostsFound />;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vibely</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesContainer}
        >
          {STORIES.map((story) => (
            <StoryUi key={story.id} story={story} />
          ))}
        </ScrollView>
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}

const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
  </View>
);
