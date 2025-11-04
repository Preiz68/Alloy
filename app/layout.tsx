"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { useFcmToastify } from "@/hooks/useFcmToast";
import { useAuth } from "@/hooks/useAuth";
import { saveFcmToken } from "@/lib/saveFcmToken";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useFcmToastify();

  const { user } = useAuth();

  // optional: ensure user token is saved for FCM
  if (user?.uid) saveFcmToken(user.uid).catch(console.error);

  return (
    <html lang="en" className={`${spaceGrotesk.className}`}>
      <body>
        {children}

        {/* 🔔 Global Toast Container */}
        <ToastContainer
          position="top-right"
          toastStyle={{ maxWidth: "250px" }}
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}
