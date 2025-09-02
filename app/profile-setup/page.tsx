"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Space_Grotesk } from "next/font/google";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

import { CountrySelect } from "@/components/CountrySelect";
import StackSelect from "@/components/StackSelect";
import ExperienceSelect from "@/components/ExperienceSelect";
import { profileSchema, ProfileFormData } from "@/schemas/profileSchema";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import image3 from "../../public/colorfulbackground.jpg";
import { inputLikeSelectStyles } from "@/components/sharedSelectStyle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ageRanges = [
  { label: "Under 18", value: "under18" },
  { label: "18 - 24", value: "18-24" },
  { label: "25 - 34", value: "25-34" },
  { label: "35 & Above", value: "35+" },
];

const Pagequestions = [
  { label: "About You" },
  { label: "Interests" },
  { label: "Experience" },
];

export default function UserOnboardingForm() {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { user, loading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  useEffect(() => {
  const yOffset = -20; // adjust this if you have a fixed header
  const element = document.querySelector("form");
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, left: 0, behavior: "smooth" });
  }
}, [step]);


  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }


    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ProfileFormData>;
          reset(data as any);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        toast.error(`Could not load profile: ${err.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid, loading, reset]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const techInterests = (data as any).techInterests
        ? (data as any).techInterests.map((o: any) => o.value ?? o)
        : [];
      const stack = (data as any).stack
        ? ((data as any).stack.map ? (data as any).stack.map((o: any) => o.value ?? o) : (data as any).stack)
        : [];

      const finalData = {
        ...data,
        techInterests,
        stack,
      };

      await setDoc(doc(db, "users", user.uid), finalData, { merge: true });
      toast.success("Profile saved 🚀");
      router.push("/welcome");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const next = async () => {
    if (step === 1) {
      const ok = await trigger(["firstName", "lastName", "gender", "country", "age"]);
      if (!ok) {
        toast.error("Complete required fields");
        return;
      }
    }
    if (step === 2) {
      const ok = await trigger(["techInterests"]);
      if (!ok) {
        toast.error("Please select at least one tech interest");
        return;
      }
    }

    const currentStep = step;
    if (!completedSteps.includes(currentStep)) setCompletedSteps((p) => [...p, currentStep]);

    if (step < Pagequestions.length) {
      setStep((s) => s + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const backgroundImage = "/colorfulbackground.jpg"; // path from public folder


  return (
    <div
      className={`flex justify-center w-full min-h-screen ${spaceGrotesk.className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full min-h-full bg-white/10 backdrop-blur-lg p-6">
        {isLoading ? (
          <p className="text-center text-white">Loading profile...</p>
        ) : (
          <div>
            {/* Step Dots */}
            <div className="w-full flex justify-center items-center mb-6">
              <div className="relative flex items-center justify-between w-full max-w-md px-4">
                <div className="absolute top-5 left-4 right-4 h-1 bg-white/30 rounded-full -z-10 transform -translate-y-1/2" />
                <motion.div
                  className="absolute top-5 left-4 h-1 bg-gradient-to-b from-purple-700 to-pink-500 rounded-full -z-10 transform -translate-y-1/2"
                  animate={{
                    width:
                      Pagequestions.length > 1
                        ? `calc(${((step - 1) / (Pagequestions.length - 1)) * 100}% - 2rem)`
                        : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                {Pagequestions.map((page, i) => {
                  const stepNumber = i + 1;
                  const isCurrent = stepNumber === step;
                  const isCompleted = completedSteps.includes(stepNumber);
                  return (
                    <div key={i} className="flex flex-col items-center z-10 w-10">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          opacity: 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`w-10 h-10 rounded-full flex justify-center items-center font-bold ${
                          isCurrent || isCompleted
                            ? "bg-gradient-to-br from-purple-700 to-pink-500 text-white shadow-md"
                            : "bg-white/30 text-white"
                        }`}
                      >
                        {isCompleted ? "✓" : stepNumber}
                      </motion.div>
                      <span className="text-xs mt-1 text-center font-medium text-white whitespace-nowrap">
                        {page.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Animated Steps */}
            <AnimatePresence mode="wait">
              <motion.div key={step} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="space-y-6">
                {/* Step 1: About You */}
                {step === 1 && (
                  <div className="md:grid md:grid-cols-12 md:gap-[5%] text-white">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-5xl font-bold mb-4">About You</h1>
                      <p className="text-lg font-semibold text-white/80">
                        Tell us a bit about yourself so we can help you get the best out of this community.
                      </p>
                    </div>
                    <div className="md:col-span-6 flex flex-col space-y-8 mt-4">
                      {/* First Name */}
                      <div className="flex flex-col w-full space-y-2 relative max-h-[100px]">
                        <label htmlFor="firstName" className="text-md font-medium">
                          First name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          {...register("firstName")}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.firstName ? "border-red-500" : dirtyFields.firstName ? "border-green-500" : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.firstName && (
                            <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.firstName.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col w-full space-y-2 relative max-h-[100px]">
                        <label htmlFor="lastName" className="text-md font-medium">
                          Last name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          {...register("lastName")}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.lastName ? "border-red-500" : dirtyFields.lastName ? "border-green-500" : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.lastName && (
                            <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.lastName.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col space-y-2 relative">
                        <label className="text-md font-medium">Gender</label>
                        <div className="flex items-center gap-3">
                          {["male", "female"].map((g) => (
                            <label key={g} className="flex items-center gap-2 border-2 px-6 py-2 rounded-full border-white/40 cursor-pointer">
                              <input type="radio" value={g} {...register("gender")} className="accent-blue-500" />
                              <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                        <AnimatePresence>
                          {errors.gender && (
                            <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.gender.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Country Select */}
                      <CountrySelect control={control} name="country"/>
                      <AnimatePresence>
                        {errors.country && (
                          <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                            {errors.country.message as any}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Age */}
                      <div className="mb-30">
                        <label className="block text-md font-medium mb-2">Select Your Age</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ageRanges.map((range) => {
                            const isActive = watch("age") === range.value;
                            return (
                              <motion.button
                                key={range.value}
                                type="button"
                                onClick={() => setValue("age", range.value)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`rounded-full px-4 py-2 text-sm border shadow-sm focus:outline-none ${
                                  isActive ? "bg-blue-500 text-white border-blue-500 shadow-md" : "border-white/40 text-white bg-white/10 hover:border-blue-400"
                                }`}
                              >
                                {range.label}
                              </motion.button>
                            );
                          })}
                        </div>
                        <AnimatePresence>
                          {errors.age && (
                            <motion.p className="text-sm text-red-500 mt-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.age.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                  <div className="md:grid md:grid-cols-12 md:gap-[5%]">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-5xl font-bold mb-4 text-white">Interests</h1>
                      <p className="text-lg font-semibold text-white/80">
                        Let us know what you're passionate about so we can match you with the right people and opportunities.
                      </p>
                    </div>

                    <div className="md:col-span-6 flex flex-col space-y-8 mt-4">
                      {/* Tech Interests */}
                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">Tech Interests</label>
                        <Controller
                          name="techInterests"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              isMulti
                              options={[
                                { value: "Web Development", label: "Web Development" },
                                { value: "Mobile Development", label: "Mobile Development" },
                                { value: "Frontend Development", label: "Frontend Development" },
                                { value: "Backend Development", label: "Backend Development" },
                                { value: "Full Stack Development", label: "Full Stack Development" },
                                { value: "AI", label: "AI" },
                                { value: "Machine Learning", label: "Machine Learning" },
                                { value: "Data Science", label: "Data Science" },
                                { value: "UI/UX Design", label: "UI/UX Design" },
                                { value: "Cybersecurity", label: "Cybersecurity" },
                                { value: "Blockchain", label: "Blockchain" },
                                { value: "AR/VR", label: "AR/VR" },
                                { value: "DevOps", label: "DevOps" },
                                { value: "Game Development", label: "Game Development" },
                              ]}
                              className=" rounded-lg"
                              placeholder="Select your interests..."
                              styles={inputLikeSelectStyles}
                            />
                          )}
                        />
                        <AnimatePresence>
                          {errors.techInterests && (
                            <motion.p className="text-sm text-red-500 mt-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.techInterests.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Stack (Optional) */}
                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">Tech Stack (Optional)</label>
                        <StackSelect control={control}/>
                      </div>

                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">Hobbies or Non-Tech Interests (optional)</label>
                        <input type="text" {...register("hobbies")} className="border-2 border-white/40 bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none" placeholder="e.g. Music, Cooking, Writing..." />
                        </div>

                        <div className="flex flex-col w-full space-y-2 relative mb-30">
                          <label className="text-md font-medium text-white">Short Bio (optional)</label>
                          <textarea rows={4} maxLength={250} {...register("bio")} className="border-2 border-white/40 bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none resize-none" placeholder="Tell us a little about yourself in 250 characters..." />
                          <div className="text-sm text-white/70 text-right">{watch("bio")?.length || 0}/250</div>
                          </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Experience */}
                {step === 3 && (
                  <div className="md:grid md:grid-cols-12 md:gap-[5%]">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-5xl font-bold mb-4 text-white">Experience</h1>
                      <p className="text-lg font-semibold text-white/80">
                        Share your professional experience so we can better support your growth.
                      </p>
                    </div>

                    <div className="md:col-span-6 flex flex-col space-y-6 mt-4">
                      {/* Experience */}
                      <label className="text-md font-medium text-white">Experience (Optional)</label>
                      <ExperienceSelect control={control}/>
                      <AnimatePresence>
                        {errors.experienceLevel && (
                          <motion.p className="text-sm text-red-500 mt-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                            {errors.experienceLevel.message as any}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* LinkedIn URL */}
                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">LinkedIn URL</label>
                        <input
                          {...register("linkedInUrl")}
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.linkedInUrl ? "border-red-500" : dirtyFields.linkedInUrl ? "border-green-500" : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.linkedInUrl && (
                            <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.linkedInUrl?.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Career Path */}
                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">Career Path</label>
                        <input
                          {...register("careerPath")}
                          placeholder="Your desired career path"
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.careerPath ? "border-red-500" : dirtyFields.careerPath ? "border-green-500" : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.careerPath && (
                            <motion.p className="text-sm text-red-500 absolute -bottom-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5 }}>
                              {errors.careerPath.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </form>

      {/* Footer nav */}
      <div className={`fixed bottom-0 left-0 right-0 flex items-center ${step === 1 ? "justify-end" : "justify-between"} bg-white/20 backdrop-blur-md py-4 px-6 border-t border-white/30`}>
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="border border-white/40 px-4 py-2 text-lg text-white rounded-lg hover:bg-white/20 hover:text-white"
          >
            Back
          </button>
        )}
        <button
          type={step === Pagequestions.length ? "submit" : "button"}
          onClick={step === Pagequestions.length ? undefined : next}
          className="bg-purple-600 text-white px-4 py-2 text-sm rounded-lg"
          disabled={isSubmitting}
        >
          {step === 1 ? "Add Interests" : step === 2 ? "Add Experience" : "Finish"}
        </button>
      </div>

      {/* Toasts */}
      <Toaster position="top-right" />
    </div>
  );
}
