
# Vibely

A modern, full-stack social media mobile application built with **React Native (Expo)**, **Convex**, and **Clerk**. Designed to deliver a seamless social experience with features like real-time feeds, secure authentication, image sharing, and instant notifications.

## 🚀 Key Features

- **🔐 Robust Authentication:** Secure sign-up/login powered by **Clerk** integrated with Convex.
- **� Social Feed:** Real-time home feed displaying posts from confirmed users.
- **� Post Creation:** Share moments with image uploads and captions using `expo-image-picker`.
- **❤️ Interactivity:** Like, comment on posts, and save your favorites with bookmarks.
- **� Follow System:** Connect with other users through a comprehensive follow/following system.
- **🔔 Real-time Notifications:** Instant alerts for likes, comments, and new followers.
- **� User Profiles:** Customizable profiles with bio, stats (followers/following/posts), and post history.
- **⚡ Real-time Updates:** Powered by **Convex** for instant data synchronization across devices.

## 🛠️ Tech Stack

### Frontend (Mobile)

- **Framework:** React Native (via Expo SDK 52)
- **Routing:** Expo Router
- **Language:** TypeScript
- **Styling:** React Native Styles / Expo System UI
- **Icons:** Expo Vector Icons / SF Symbols
- **Image Handling:** Expo Image

### Backend & Services

- **Backend-as-a-Service:** Convex (Real-time Database & Functions)
- **Authentication:** Clerk (User Management)
- **Storage:** Convex File Storage (for post images)

## 🏗️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v20+ recommended)
- npm or pnpm or yarn
- Expo Go app on your physical device (or Android Studio/Xcode for simulators)
- **Convex** Account
- **Clerk** Account

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/vibely.git
    cd vibely
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file (or use `.env.local`) and add your Convex and Clerk keys. You will also need to configure Convex:

    ```bash
    npx convex dev
    ```

    This command will prompt you to log in and set up your Convex project, automatically generating the necessary environment variables in `.env.local`.

    Ensure your `.env` includes:

    ```env
    CONVEX_DEPLOYMENT=...
    NEXT_PUBLIC_CONVEX_URL=...
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    ```

4.  **Run the Development Server:**

    Start the backend and frontend:

    ```bash
    # In one terminal, keep the backend syncing
    npx convex dev

    # In another terminal, start the Expo app
    npx expo start
    ```

5.  **View the App:**
    - Scan the QR code with **Expo Go** (Android/iOS).
    - Or press `a` for Android Emulator / `i` for iOS Simulator.

## 📁 Project Structure

```
vibely/
├── app/                  # Expo Router screens and layouts
│   ├── (auth)/           # Authentication screens (Login/Signup)
│   ├── (tabs)/           # Main App Tabs (Home, Create, Profile, etc.)
│   │   ├── index.tsx     # Home Feed
│   │   ├── create.tsx    # Create Post
│   │   ├── profile.tsx   # User Profile
│   │   └── ...
│   └── _layout.tsx       # Root layout configuration
├── components/           # Reusable UI components
├── convex/               # Backend Logic (Serverless Functions)
│   ├── schema.ts         # Database Schema
│   ├── users.ts          # User mutations/queries
│   ├── posts.ts          # Post logic
│   ├── auth.config.ts    # Auth configuration
│   └── ...
└── assets/               # Static assets (images, fonts)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is proprietary and confidential.

---

Made with ❤️ by Sakila Lakmal
