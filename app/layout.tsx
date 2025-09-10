import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import {Space_Grotesk} from "next/font/google";



export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className = {`${spaceGrotesk.className}`}>
      <body>
        {children}

        {/* Toast Container for Notifications */}
        <ToastContainer
          position="top-right"
          toastStyle={{ width:"230px",height:"30px" }}
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
