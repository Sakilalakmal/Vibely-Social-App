import { styles } from "@/styles/auth.styles";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

const LoginPage = () => {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.log("something wrong with sign in ", error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Brand Section first*/}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>Vibely</Text>
        <Text style={styles.tagline}>don't miss Your vibe</Text>
      </View>

      {/* ILLUSTRATION */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/vibely-auth.png")}
          style={styles.illustration}
          contentFit="cover"
        />
      </View>
      {/*login section */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

export default LoginPage;
