
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { MdEmail, MdLock } from "react-icons/md";
import {Space_Grotesk} from "next/font/google"

import image3 from "../../../public/colorfulbackground.jpg";
import GoogleIcon from "../../../public/icons/googleicon.png";
import GithubIcon from "../../../public/icons/githubicon.png";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { signUpFormData, signUpSchema } from "@/schemas/signupSchema";

const spaceGrotesk = Space_Grotesk({
  subsets:["latin"],
  weight:["400","600","700"]
})

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const simplifyError = (message: string) => {
    return message
      .replace("Firebase:", "")
      .replace(/auth\/|\(|\)/gi, "")
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  const handleSuccess = (message: string) => toast.success(message);
  const handleError = (message: string) => toast.error(simplifyError(message));

  const onSubmit: SubmitHandler<signUpFormData> = async (data) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      handleSuccess("Account created successfully!🎉");
      reset();
      router.push("/profile-setup");
    } catch (err: any) {
      handleError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider === "google" ? googleProvider : githubProvider);
      handleSuccess(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
      router.push("/profile-setup");
    } catch (err: any) {
      handleError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative w-full min-h-screen flex items-center justify-center ${spaceGrotesk.className}`}>
   

     <div className="z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-[90%] max-w-lg text-white shadow-xl"
>

        <h2 className="text-5xl font-extrabold text-center mb-6 text-purple-600">
          SAND
        </h2>

        {/* Top OAuth (desktop only) */}
        <div className="hidden md:block mb-6">
          <div className="flex gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full md:rounded text-white transition cursor-pointer"
            >
              <Image src={GoogleIcon} alt="Google" width={20} height={20} />
              Sign in with Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full md:rounded text-white transition cursor-pointer"
            >
              <Image src={GithubIcon} alt="GitHub" width={20} height={20} />
              Sign in with GitHub
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center my-6"
          >
            <div className="flex-grow h-px bg-white/30" />
            <span className="mx-3 text-md text-white/70">OR</span>
            <div className="flex-grow h-px bg-white/30" />
          </motion.div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 min-h-[260px]">
          <div className="min-h-[100px]">
            <label className="block text-sm mb-1 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Email
            </label>
            <div className="relative flex justify-center items-center">
              <MdEmail className="absolute left-2 top-3 text-white/60 text-lg" />
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@example.com"
                className={`pl-8 w-full bg-transparent border-b-2 py-2 px-2  placeholder:text-white/60 text-white focus:outline-none transition ${
                  errors.email && dirtyFields.email
                    ? "border-red-500"
                    : dirtyFields.email && !errors.email
                    ? "border-green-500"
                    : "border-white/30"
                }`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{duration:1,type:"spring",stiffness:150,damping:12}}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="min-h-[100px]">
            <label className="block text-sm mb-1 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Password
            </label>
            <div className="relative flex justify-center items-center">
              <MdLock className="absolute left-2 top-2 text-white/60 text-lg" />
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                placeholder="••••••••"
                className={`pl-8 w-full bg-transparent border-b-2 py-2 px-2  placeholder:text-white/60 text-white focus:outline-none transition ${
                  errors.password && dirtyFields.password
                    ? "border-red-500"
                    : dirtyFields.password && !errors.password
                    ? "border-green-500"
                    : "border-white/30"
                }`}
              />
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{duration:1,type:"spring",stiffness:150,damping:12}}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 transition duration-300 text-white font-semibold py-2 rounded shadow-md active:scale-95 hover:scale-[1.02] flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Bottom OAuth (mobile only) */}
        <div className="block md:hidden mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center my-4"
          >
            <div className="flex-grow h-px bg-white/30" />
            <span className="mx-3 text-md text-white/70">OR</span>
            <div className="flex-grow h-px bg-white/30" />
          </motion.div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition cursor-pointer"
            >
              <Image src={GoogleIcon} alt="Google" width={20} height={20} />
              Sign in with Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition cursor-pointer"
            >
              <Image src={GithubIcon} alt="GitHub" width={20} height={20} />
              Sign in with GitHub
            </motion.button>
          </div>
        </div>

        <p className="text-sm text-white/70 mt-6 text-center">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/signin")}
            className="text-white underline hover:text-purple-400 transition cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
