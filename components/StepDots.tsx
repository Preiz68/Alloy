"use client";

import { motion } from "framer-motion";

interface StepDotsProps {
  step: number;
  completedSteps: number[];
  setStep: (s: number) => void;
}

export const PageQuestions = [{ label: "About You" }, { label: "Interests" }, { label: "Experience" }];

export default function StepDots({ step, completedSteps }: StepDotsProps) {
  return (
    <div className="w-full flex justify-center items-center py-6">
      <div className="relative flex items-center justify-between w-full max-w-md px-4">
        <div className="absolute top-5 left-4 right-4 h-1 bg-white/30 rounded-full -z-10" />
        <motion.div
          className="absolute top-5 left-4 h-1 bg-gradient-to-b from-purple-700 to-pink-500 rounded-full -z-10"
          animate={{
            width: PageQuestions.length > 1
              ? `calc(${((step - 1) / (PageQuestions.length - 1)) * 100}% - 2rem)`
              : "0%",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {PageQuestions.map((page, i) => {
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
  );
}
