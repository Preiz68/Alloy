"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdEmail, MdLock } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";

import image3 from "../../../public/colorfulbackground.jpg";
import GoogleIcon from "../../../public/icons/googleicon.png";
import GithubIcon from "../../../public/icons/githubicon.png";
import { Space_Grotesk } from "next/font/google";


 const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
  });

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("🎉 Login successful!");
      router.push("/profile-setup");
    } catch (error: any) {
      console.log(error);
      const errorMessages: Record<string, string> = {
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/invalid-email": "Invalid email address.",
      };
      toast.error(
        errorMessages[error.code] || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    const id = toast.loading(
      `Signing in with ${provider === "google" ? "Google" : "GitHub"}...`
    );
    try {
      const selectedProvider =
        provider === "google" ? googleProvider : githubProvider;
      await signInWithPopup(auth, selectedProvider);
      toast.update(id, {
        render: `🎉 Logged in with ${
          provider === "google" ? "Google" : "GitHub"
        }!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      router.push("/profile-setup");
    } catch {
      toast.update(id, {
        render: "Social login failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };
   const backgroundImage = "/colorfulbackground.jpg";

  return (
    <div
      className={`flex justify-center flex-col w-full min-h-screen ${spaceGrotesk.className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Glassmorphic Card */}
        <h2 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Welcome Back
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full min-h-full bg-white/10 space-y-6 backdrop-blur-lg p-6">
          {/* Email */}
          <div className="min-h-[100px]">
            <label className="block text-sm mb-1 text-white/70">Email</label>
            <div className="relative">
              <MdEmail className="absolute left-2 top-3 text-white/60" />
              <input
                type="email"
                {...register("email")}
               className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                errors.email ? "border-red-500" : dirtyFields.email ? "border-green-500" : "border-white/40"
                }`}
                placeholder="you@example.com"
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  className="text-red-300 text-sm mt-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="min-h-[90px]">
            <label className="block text-sm mb-1 text-white/70">Password</label>
            <div className="relative">
              <MdLock className="absolute left-2 top-3 text-white/60" />
              <input
                type="password"
                {...register("password")}
               className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
              errors.password ? "border-red-500" : dirtyFields.password ? "border-green-500" : "border-white/40"
                }`}
                placeholder="••••••••"
              />
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  className="text-red-300 text-sm mt-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold py-2 rounded shadow-md active:scale-95 hover:scale-[1.02] transition flex justify-center items-center"
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm mb-4">Or continue with</p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => handleSocialLogin("google")}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition"
            >
              <Image src={GoogleIcon} alt="Google" width={24} height={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => handleSocialLogin("github")}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition"
            >
              <Image src={GithubIcon} alt="GitHub" width={24} height={24} />
            </motion.button>
          </div>
        </div>

        {/* Redirect */}
        <p className="text-sm text-white/70 mt-6 text-center">
          New here?{" "}
          <Link
            href="/signup"
            className="text-white underline hover:text-purple-400 transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
  );
};

export default LoginForm;
