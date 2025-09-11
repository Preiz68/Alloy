"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { CountrySelect } from "@/components/CountrySelect";
import StackSelect from "@/components/StackSelect";
import ExperienceSelect from "@/components/ExperienceSelect";
import { profileSchema, ProfileFormData } from "@/schemas/profileSchema";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import TechInterestSelect from "@/components/TechInterestSelect";
import { useRouter } from "next/navigation";

const ageRanges = [
  { label: "Under 18", value: "under18" },
  { label: "18 - 24", value: "18-24" },
  { label: "25 - 34", value: "25-34" },
  { label: "35 & Above", value: "35+" },
];

const Pagequestions = [{ label: "About You" }, { label: "Interests" }, { label: "Experience" }];

export default function UserOnboardingForm() {
  const [step, setStep] = useState<number>(1);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [fadeOut, setFadeOut] = useState(false);
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
  });

  // ✅ Single effect: check profile + (if not complete) prefill form
  useEffect(() => {
    const run = async () => {
      try {
        if (!user?.uid || loading) return;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().profileCompleted) {
          // Fade out smoothly before redirect
            router.replace("/")
            toast.success(`Welcome Back, ${docSnap.data().firstName}`);
        }
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ProfileFormData>;
          reset(data as any);
        }
      } catch (err: any) {
        console.error("Profile load error:", err);
        setFadeOut(true);
        // Allow form anyway
      } finally {
        setIsRedirecting(false);
      }
    };
    run();
  }, [user?.uid, loading, reset, router]);

  // Smooth scroll on step change
  useEffect(() => {
    const el = document.querySelector("form");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [step]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const techInterests = data.techInterests ? data.techInterests.map((o: any) => o.value ?? o) : [];
      const stack = data.stack ? (Array.isArray(data.stack) ? data.stack.map((o: any) => o.value ?? o) : data.stack) : [];

      const finalData = {
        ...data,
        techInterests,
        stack,
        profileCompleted: true,
      };

      await setDoc(doc(db, "users", user.uid), finalData, { merge: true });
      toast.success("Profile saved 🚀");
      router.push("/");
      toast.success(`Welcome ${data.firstName}`)
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong");
    }
  };

  const next = async () => {
    let ok = false;

    if (step === 1) {
      ok = await trigger(["firstName", "lastName", "gender", "country", "age"]);
      if (!ok) return toast.error("Complete required fields");
    }
    if (step === 2) {
      ok = await trigger(["techInterests"]);
      if (!ok) return toast.error("Please select at least one tech interest");
    }
    if (step === 3) {
      ok = await trigger(["careerPath"]);
      if (!ok) return toast.error("Please enter a career path");
    }

    if (!completedSteps.includes(step)) setCompletedSteps((p) => [...p, step]);
    if (step < Pagequestions.length) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const backgroundImage = "/colorfulbackground.jpg";

  return (
    <div
      className="flex justify-center w-full min-h-screen max-h-full overflow-x-clip"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full bg-white/10 backdrop-blur-lg">
        {isRedirecting || fadeOut && (
          <div className="fixed inset-0 flex flex-col justify-center items-center space-y-2 bg-black/40">
            <motion.div
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
            />
          </div>
        )}

           {fadeOut && <div>
            {/* Step Dots */}
            <div className="w-full flex justify-center items-center my-6">
              <div className="relative flex items-center justify-between w-full max-w-md px-4">
                <div className="absolute top-5 left-4 right-4 h-1 bg-white/30 rounded-full -z-10" />
                <motion.div
                  className="absolute top-5 left-4 h-1 bg-gradient-to-b from-purple-700 to-pink-500 rounded-full -z-10"
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
                        animate={{ scale: isCurrent ? 1.2 : 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`w-10 h-10 rounded-full flex justify-center items-center font-bold ${
                          isCurrent || isCompleted
                            ? "bg-gradient-to-br from-purple-700 to-pink-500 text-white shadow-md"
                            : "bg-white/30 text-white"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {isCompleted ? "✓" : stepNumber}
                      </motion.div>
                      <span className="text-xs mt-1 text-center font-medium text-white truncate max-w-[70px]">
                        {page.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Animated Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6 px-4 sm:px-6 pb-24"
              >
                {/* Step 1: About You */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8 text-white">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">About You</h1>
                      <p className="text-base sm:text-lg font-semibold text-white/80">
                        Tell us a bit about yourself so we can help you get the best out of this community.
                      </p>
                    </div>
                    <div className="md:col-span-6 flex flex-col space-y-4 mt-4 max-w-md">
                      {/* First Name */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label htmlFor="firstName" className="text-md font-medium">
                          First name*
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          aria-invalid={!!errors.firstName}
                          {...register("firstName")}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.firstName
                              ? "border-red-500"
                              : dirtyFields.firstName
                              ? "border-green-500"
                              : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.firstName && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.firstName.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label htmlFor="lastName" className="text-md font-medium">
                          Last name*
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          aria-invalid={!!errors.lastName}
                          {...register("lastName")}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.lastName
                              ? "border-red-500"
                              : dirtyFields.lastName
                              ? "border-green-500"
                              : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.lastName && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.lastName.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium">Gender*</label>
                        <div className="flex items-center gap-3">
                          {["male", "female"].map((g) => (
                            <label
                              key={g}
                              className="flex items-center gap-2 border-2 px-6 py-2 rounded-full border-white/40 cursor-pointer"
                            >
                              <input type="radio" value={g} {...register("gender")} className="accent-purple-600" />
                              <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                        <AnimatePresence>
                          {errors.gender && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.gender.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Country Select */}
                      <div className="flex flex-col space-y-2 min-h-[105px]">
                        <CountrySelect control={control} name="country" />
                        <AnimatePresence>
                          {errors.country && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.country.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Age */}
                      <div className="flex flex-col space-y-2 min-h-[120px]">
                        <label className="block text-md font-medium mb-2">Select Your Age*</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ageRanges.map((range) => {
                            const isActive = watch("age") === range.value;
                            return (
                              <motion.button
                                key={range.value}
                                type="button"
                                onClick={() => setValue("age", range.value, { shouldValidate: true })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`rounded-full px-4 py-2 text-sm border shadow-sm focus:outline-none ${
                                  isActive
                                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md"
                                    : "border-white/40 text-white bg-white/10 hover:border-white/70"
                                }`}
                                aria-pressed={isActive}
                              >
                                {range.label}
                              </motion.button>
                            );
                          })}
                        </div>
                        <AnimatePresence>
                          {errors.age && (
                            <motion.p
                              className="text-sm text-red-500 mt-1"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
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
                  <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                        Interests
                      </h1>
                      <p className="text-base sm:text-lg font-semibold text-white/80">
                        Let us know what you're passionate about so we can match you with the right people and
                        opportunities.
                      </p>
                    </div>

                    <div className="md:col-span-6 flex flex-col space-y-4 mt-4 max-w-md">
                      {/* Tech Interests */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium text-white">Tech Interests*</label>
                        <TechInterestSelect control={control} />
                        <AnimatePresence>
                          {errors.techInterests && (
                            <motion.p
                              className="text-sm text-red-500 mt-1"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.techInterests.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Stack (Optional) */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium text-white">Tech Stack (Optional)</label>
                        <StackSelect control={control} />
                        <AnimatePresence>
                          {errors.stack && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.stack.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium text-white">
                          Hobbies or Non-Tech Interests (optional)
                        </label>
                        <input
                          type="text"
                          {...register("hobbies")}
                          className="border-2 border-white/40 bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none"
                          placeholder="e.g. Music, Cooking, Writing..."
                        />
                        <AnimatePresence>
                          {errors.hobbies && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.hobbies.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col w-full space-y-2 relative">
                        <label className="text-md font-medium text-white">Short Bio (optional)</label>
                        <textarea
                          rows={4}
                          maxLength={250}
                          {...register("bio")}
                          className="border-2 border-white/40 bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none resize-none"
                          placeholder="Tell us a little about yourself in 250 characters..."
                        />
                        <div className="text-sm text-white/70 text-right">{watch("bio")?.length || 0}/250</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Experience */}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
                    <div className="mb-4 md:col-span-5">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                        Experience
                      </h1>
                      <p className="text-base sm:text-lg font-semibold text-white/80">
                        Share your professional experience so we can better support your growth.
                      </p>
                    </div>

                    <div className="md:col-span-6 flex flex-col space-y-6 mt-4 max-w-md">
                      {/* Experience */}
                      <div className="min-h-[105px] flex flex-col w-full space-y-2">
                        <label className="text-md font-medium text-white">Experience*</label>
                        <ExperienceSelect control={control} />
                        <AnimatePresence>
                          {errors.experienceLevel && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.experienceLevel.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* LinkedIn URL */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium text-white">LinkedIn URL (Optional)</label>
                        <input
                          {...register("linkedInUrl")}
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          aria-invalid={!!errors.linkedInUrl}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.linkedInUrl
                              ? "border-red-500"
                              : dirtyFields.linkedInUrl
                              ? "border-green-500"
                              : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.linkedInUrl && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
                              {errors.linkedInUrl?.message as any}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Career Path */}
                      <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
                        <label className="text-md font-medium text-white">Career Path*</label>
                        <input
                          {...register("careerPath")}
                          placeholder="Your desired career path"
                          aria-invalid={!!errors.careerPath}
                          className={`border-b-2 px-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                            errors.careerPath
                              ? "border-red-500"
                              : dirtyFields.careerPath
                              ? "border-green-500"
                              : "border-white/40"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.careerPath && (
                            <motion.p
                              className="text-sm text-red-500"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                            >
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

            {/* Navigation buttons */}
            {!isRedirecting && (
              <div
                className={`sticky bottom-0 left-0 right-0 flex z-10 items-center ${
                  step === 1 ? "justify-end" : "justify-between"
                } bg-white/20 backdrop-blur-md py-4 px-4 sm:px-6 border-t border-white/30`}
              >
                {step > 1 && (
                  <button
                    type="button"
                    onClick={back}
                    aria-label="Go back"
                    className="border border-white/40 px-4 py-2 text-base sm:text-lg text-white rounded-lg hover:bg-white/20 hover:text-white"
                  >
                    Back
                  </button>
                )}
                {step === Pagequestions.length ? (
                  <button
                    type="submit"
                    aria-label="Finish setup"
                    className="bg-purple-600 text-white px-4 py-2 cursor-pointer text-base sm:text-lg rounded-lg"
                    disabled={isSubmitting}
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next step"
                    className="bg-purple-600 text-white px-4 py-2 cursor-pointer text-base sm:text-lg rounded-lg"
                  >
                    {step === 1 ? "Add Interests" : "Add Experience"}
                  </button>
                )}
              </div>
            )}
          </div>
          }

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center z-50">
            <motion.div
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            />
            <p className="mt-3 text-sm text-white">Saving Profile</p>
          </div>
        )}
      </form>
    </div>
  );
}
