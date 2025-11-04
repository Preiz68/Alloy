"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { profileSchema, ProfileFormData } from "@/schemas/profileSchema";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import StepDots, { PageQuestions } from "@/components/StepDots";
import Step1AboutYou from "@/components/AboutYou";
import Step2Interests from "@/components/Interest";
import Step3Experience from "@/components/Experience";
import FormNavigation from "@/components/FormNavigation";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function UserOnboardingForm() {
  const [step, setStep] = useState<number>(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    trigger,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  const stepFields: Record<number, (keyof ProfileFormData)[]> = {
    1: ["firstName", "lastName", "gender", "country", "age"],
    2: ["techInterests"],
    3: ["careerPath"],
  };

  // ✅ Single effect: check profile + (if not complete) prefill form
  useEffect(() => {
    const run = async () => {
      try {
        if (!user?.uid || loading) return;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().profileCompleted) {
          setIsRedirecting(true);
          router.replace("/dashboard");
          {
            !isRedirecting &&
              toast.success(`Welcome Back, ${docSnap.data().firstName}`);
          }
        }
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ProfileFormData>;
          reset(data as any);
        }
      } catch (err: any) {
        console.error("Profile load error:", err);
        // Allow form anyway
      } finally {
        setIsRedirecting(false);
      }
    };
    run();
  }, [user?.uid, loading, reset, router]);

  // Smooth scroll on step change
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const techInterests = data.techInterests
        ? data.techInterests.map((o: any) => o.value ?? o)
        : [];
      const stack = data.stack
        ? Array.isArray(data.stack)
          ? data.stack.map((o: any) => o.value ?? o)
          : data.stack
        : [];

      const finalData = {
        ...data,
        techInterests,
        stack,
        profileCompleted: true,
      };

      await setDoc(doc(db, "users", user.uid), finalData, { merge: true });
      await updateProfile(user, {
        displayName: data.firstName,
      });
      toast.success("Profile saved 🚀");
      router.push("/dashboard");
      {
        !isRedirecting && toast.success(`Welcome ${data.firstName}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong");
    }
  };

  const next = async () => {
    const ok = await trigger(stepFields[step]);
    if (!ok) return toast.error("Complete required fields");

    if (!completedSteps.includes(step))
      setCompletedSteps([...completedSteps, step]);
    if (step < PageQuestions.length) setStep(step + 1);
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isRedirecting || loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <motion.div
          className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full min-h-screen"
    >
      {/* Step Dots */}
      <StepDots {...{ step, completedSteps, setStep }} />

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
            <Step1AboutYou
              {...{ register, control, watch, errors, dirtyFields, setValue }}
            />
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <Step2Interests {...{ register, control, watch, errors }} />
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <Step3Experience {...{ register, control, errors, dirtyFields }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <FormNavigation
        {...{ step, back, next }}
        isSubmitting={isSubmitting}
        maxStep={PageQuestions.length}
      />

      {/* Fullscreen submitting overlay */}
      {isSubmitting && <LoadingOverlay message="Saving Profile" />}
    </form>
  );
}
