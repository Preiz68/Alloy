"use client";

import Image from "next/image";
import { auth, githubProvider, googleProvider } from "@/lib/firebase";
import { signUpSchema, signUpFormData } from "@/schemas/signupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import image1 from "../../../public/image1.svg";
import image2 from "../../../public/image2.svg"
import image3 from "../../../public/image3.svg"
import image4 from "../../../public/image4.svg"
import { FaCircleArrowRight } from "react-icons/fa6";
import GoogleIcon from "../../../public/icons/googleicon.png"
import GithubIcon from "../../../public/icons/githubicon.png"

const SignUpPage = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<signUpFormData> = async (data) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      console.log("✅ User registered:", data.email);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={image3}
        alt="Background"
        fill
        className="object-cover"
      />
        <div className="relative z-10 bg-white w-full my-16 mx-8 sm:mx-16 xl:max-w-5xl rounded-lg xl:rounded-3xl shadow-violet-500 shadow-lg grid grid-cols-12 overflow-hidden p-3">
        <div className="lg:col-span-6 cols-span-12 p-4 xl:p-8 flex flex-col">
          <h1 className="text-3xl font-bold text-blue-700 text-shadow">Get Started Now</h1>
           <p className="text-blue-500 text-lg mb-10">Join something that is beyound collaboration</p>
           <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex space-x-3">
               <button
               type="button"
               className="px-3 py-2 border-2 border-blue-600 rounded-lg font-semibold"
               onClick={handleGoogleSignIn}
               >
                <div className="flex justify-center items-center space-x-1">
                  <Image
                  src={GoogleIcon}
                  alt="google icon"
                   className="w-[24px]"
                  />
                  <p className="text-purple-600 text-lg">Sign up Google</p>
                </div>
               </button>
               <button
               type="button"
               className="px-3 py-2 border-2 border-blue-600 rounded-lg font-semibold"
                onClick={handleGithubSignIn}>
                  <div className="flex justify-center items-center space-x-1">
                  <Image
                  src={GithubIcon}
                  alt="github icon"
                   className="w-[24px]"
                  />
                  <p className="text-purple-600 text-lg">Sign up Github</p>
                </div>
               </button>
               </div>
               <div className="my-2">
                <label className="block text-lg text-blue-600" htmlFor="email">Email</label>
                <input
                className=" w-full p-2 border-b-2 border-blue-500 focus:outline-none focus:border-b-2 focus:ring-blue-600"
                id="email"
                type="email"
                placeholder="praiseAkoji@gmail.com"
                autoComplete="email"
                {...register("email")}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
               </div>
               <div className="mb-20">
                <label className="block text-lg text-blue-500" htmlFor="password">Password</label>
                <input
                type="password"
                id="password"
                placeholder="Happy89$"
                autoComplete="current-password"
                {...register("password")}
                className=" w-full p-2 border-b-2 border-blue-500 focus:outline-none focus:border-b-2 focus:ring-blue-600"
                />
                   {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
               </div>
               <button type="submit" className="w-full flex justify-center items-center bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg py-2">SIGN UP</button>
           </form>
        </div>
        <div className="col-span-6 relative w-full h-full flex justify-center items-center lg:block rounded-lg xl:rounded-3xl overflow-hidden">
            <Image
        src={image1}
        alt="Background"
        fill
        className="object-cover"/>
           <div className="z-20 absolute top-0 right-0 bottom-0 left-0 m-auto w-[400px] h-[400px] rounded-full flex flex-col items-center space-y-20 text-center">
            <div className="mt-3">
              <h1 className="text-4xl text-white font-semibold">Welcome Back</h1>
            <p className="text-white/80 text-lg">to the hub of growth</p>
            </div>
            <div className="space-y-2">
              <p className="text-lg text-pink-500">Already have an account ? </p>
            <button className="bg-white px-3 py-2 rounded-full cursor-pointer hover:border-2 hover:border-pink-400">
              <div className="flex space-x-3 justify-center items-center">
                 <span className="text-pink-500 font-semibold">SIGN IN</span>
                  <FaCircleArrowRight size={25} className="text-pink-600"/>
              </div>
               </button>
           
            </div>
           </div>
           </div>
        </div>
    </div>
  );
};

export default SignUpPage;
