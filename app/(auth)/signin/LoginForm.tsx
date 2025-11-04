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
import Image from "next/image";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import GoogleIcon from "../../../public/icons/googleicon.png";
import GithubIcon from "../../../public/icons/githubicon.png";
import { MdEmail, MdLock } from "react-icons/md";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("🎉 Login successful!");
      setIsRedirecting(true);
      router.replace("/profile-setup");
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorMessages: Record<string, string> = {
          "auth/user-not-found": "No user found with this email.",
          "auth/wrong-password": "Incorrect password.",
          "auth/too-many-requests": "Too many attempts. Try again later.",
          "auth/invalid-email": "Invalid email address.",
        };
        toast.error(errorMessages[error.code] || "Something went wrong.");
      } else {
        toast.error("Unexpected error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    const id = toast.loading("Signing in...");
    try {
      const selectedProvider =
        provider === "google" ? googleProvider : githubProvider;
      await signInWithPopup(auth, selectedProvider);
      toast.update(id, {
        render: `Logged in with ${
          provider === "google" ? "Google" : "GitHub"
        }!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setIsRedirecting(true);
      router.push("/profile-setup");
    } catch {
      toast.update(id, {
        render: "Login failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  if (isRedirecting) {
    return (
      <div className="w-full h-full bg-white flex justify-center items-center">
        <motion.div
          className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent md:grid md:grid-cols-12 md:gap-[5%] px-6 sm:px-8 md:px-10 py-10">
      {/* Heading */}
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center text-gray-900 mb-8 md:mb-0 md:col-span-5 flex items-center justify-center">
        Welcome Back
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 flex flex-col justify-center md:col-span-5 w-full max-w-md mx-auto"
      >
        {/* Email */}
        <div className="w-full min-h-[100px]">
          <label className="block text-sm mb-1 text-gray-800/60">Email</label>
          <div className="relative">
            <MdEmail className="absolute left-2 top-3 text-gray-800/60" />
            <input
              type="email"
              {...register("email")}
              className={`border-b-2 pl-8 pr-3 py-2 w-full bg-white/10 text-gray-800 focus:outline-none ${
                errors.email
                  ? "border-red-500"
                  : dirtyFields.email
                  ? "border-green-500"
                  : "border-white/40"
              }`}
              placeholder="you@example.com"
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                className="text-red-500 text-sm mt-1"
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
        <div className="w-full min-h-[90px]">
          <label className="block text-sm mb-1 text-white/70">Password</label>
          <div className="relative">
            <MdLock className="absolute left-2 top-3 text-white/60" />
            <input
              type="password"
              {...register("password")}
              className={`border-b-2 pl-8 pr-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                errors.password
                  ? "border-red-500"
                  : dirtyFields.password
                  ? "border-green-500"
                  : "border-white/40"
              }`}
              placeholder="••••••••"
            />
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                className="text-red-500 text-sm mt-1"
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
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          disabled={isLoading}
          className="w-full cursor-pointer bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 hover:scale-[1.02] active:scale-95 text-white font-semibold py-2 rounded-lg shadow-md transition flex justify-center items-center"
        >
          {isLoading ? (
            <motion.span
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
            />
          ) : (
            "Log In"
          )}
        </motion.button>

        {/* Social Login */}
        <div className="text-center">
          <p className="text-white font-md my-4">-OR-</p>
          <div className="flex w-full flex-col md:flex-row gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSocialLogin("google")}
              className="p-3 flex justify-center items-center will-change-transform cursor-pointer bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition"
            >
              <Image src={GoogleIcon} alt="Google" width={30} height={30} />
              <span className="text-white text-sm ml-1.5 whitespace-nowrap">
                Continue with Google
              </span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSocialLogin("github")}
              className="p-3 flex justify-center items-center will-change-transform cursor-pointer bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition"
            >
              <Image src={GithubIcon} alt="GitHub" width={30} height={30} />
              <span className="text-white text-sm ml-1.5 whitespace-nowrap">
                Continue with Github
              </span>
            </motion.button>
          </div>
        </div>

        {/* Redirect */}
        <p className="text-sm text-white/70 text-center">
          New Here?{" "}
          <Link
            href="/signup"
            className="text-white underline cursor-pointer hover:text-purple-400 transition"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
