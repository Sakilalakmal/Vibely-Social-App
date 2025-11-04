import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthPage = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthPage) {
      // Redirect to the sign-in page
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthPage) {
      // Redirect to the main app
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
