"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  AuthProvider,
} from "firebase/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { MdEmail, MdLock } from "react-icons/md";
import { FirebaseError } from "firebase/app";

import GoogleIcon from "../../../public/icons/googleicon.png";
import GithubIcon from "../../../public/icons/githubicon.png";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { signUpFormData, signUpSchema } from "@/schemas/signupSchema";

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password is too weak.",
    "auth/invalid-email": "Invalid email format.",
    "auth/network-request-failed": "Network error.",
  };

  const handleError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      toast.error(errorMessages[err.code] || err.message);
    } else {
      toast.error("Something went wrong.");
    }
  };

  const handleSuccess = (message: string) => toast.success(message);

  const onSubmit: SubmitHandler<signUpFormData> = async (data) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      handleSuccess("Account created successfully! 🎉");
      reset();
      setIsRedirecting(true);
      router.push("/profile-setup");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      const authProvider: AuthProvider =
        provider === "google" ? googleProvider : githubProvider;

      await signInWithPopup(auth, authProvider);
      handleSuccess(
        `Signed up with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
      );
      setIsRedirecting(true);
      router.push("/profile-setup");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundImage = "/colorfulbackground.jpg";

  return (
    <div
      className="w-full h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Redirect Spinner */}
      {isRedirecting ? (
        <div className="fixed inset-0  bg-white/10 backdrop-blur-lg shadow-lg flex flex-col items-center justify-center z-50">
          <motion.div
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          />
        </div>
      ):(
        <div className="w-full h-full bg-white/10 backdrop-blur-lg shadow-lg md:grid md:grid-cols-12 md:gap-[5%] px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center text-white mb-8 md:mb-0 md:col-span-5 flex items-center justify-center">
          Create an Account
        </h2>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col w-full h-full md:col-span-6"
        >
          {/* EMAIL */}
          <div className="w-full min-h-[100px]">
            <label
              htmlFor="email"
              className="block text-sm mb-1 text-white/80"
            >
              Email
            </label>
            <div className="relative">
              <MdEmail className="absolute left-2 top-3 text-white/60" />
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`border-b-2 pl-8 pr-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* PASSWORD */}
          <div className="w-full min-h-[90px]">
            <label
              htmlFor="password"
              className="block text-sm mb-1 text-white/80"
            >
              Password
            </label>
            <div className="relative">
              <MdLock className="absolute left-2 top-3 text-white/60" />
              <input
                id="password"
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* SUBMIT */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            className="w-full bg-gradient-to-r cursor-pointer from-pink-500 via-purple-600 to-indigo-500 text-white font-semibold py-2 rounded shadow-md active:scale-95 hover:scale-[1.02] flex items-center justify-center"
          >
            {isLoading ? (
              <motion.span
                className="h-6 w-6 border-2 border-white border-t-transparent rounded-full"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              "Sign Up"
            )}
          </motion.button>

          {/* OAUTH */}
          <div className="mt-4">
            <div className="flex items-center my-2">
              <div className="flex-grow h-px bg-white/30" />
              <span className="mx-3 text-md text-white/80">OR</span>
              <div className="flex-grow h-px bg-white/30" />
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
               type = "button"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition"
              >
                <Image src={GoogleIcon} alt="Google" width={20} height={20} />
                Sign up with Google
              </motion.button>

              <motion.button
              type = "button"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition"
              >
                <Image src={GithubIcon} alt="GitHub" width={20} height={20} />
                Sign up with GitHub
              </motion.button>
            </div>

            <p className="text-sm text-white/80 mt-6 text-center">
              Already have an account?{" "}
              <Link
                href="/signin"
                 className="text-white underline cursor-pointer hover:text-purple-400 transition"
                >Sign In
                </Link>
            </p>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default SignUpPage;
