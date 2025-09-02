import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { motion } from "framer-motion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Toast Container for Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000} // closes after 3s
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="black" // makes it more colorful
        />
      </body>
    </html>
  );
}
