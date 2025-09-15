"use client";

import { Control, FieldErrors, UseFormRegister, FieldValues } from "react-hook-form";
import { ProfileFormData } from "@/schemas/profileSchema";
import { AnimatePresence, motion } from "framer-motion";
import ExperienceSelect from "@/components/ExperienceSelect";

interface Step3Props <T extends FieldValues> {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  dirtyFields:Partial<Record<keyof T, boolean | boolean []>>;
}

const InputError = ({ error }: { error?: string }) => (
  <AnimatePresence>
    {error && (
      <motion.p
        className="text-sm text-red-400"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.3 }}
      >
        {error}
      </motion.p>
    )}
  </AnimatePresence>
);

export default function Step3Experience({ register, control, errors, dirtyFields }: Step3Props<ProfileFormData>) {
  return (
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
        {/* Experience Level */}
        <div className="min-h-[105px] flex flex-col w-full space-y-2">
          <label className="text-md font-medium text-white">Experience*</label>
          <ExperienceSelect control={control} />
          <InputError error={errors.experienceLevel?.message as any} />
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
          <InputError error={errors.linkedInUrl?.message as any} />
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
          <InputError error={errors.careerPath?.message as any} />
        </div>
      </div>
    </div>
  );
}
