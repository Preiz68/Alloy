"use client";

import { Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { ProfileFormData } from "@/schemas/profileSchema";
import { AnimatePresence, motion } from "framer-motion";
import TechInterestSelect from "@/components/TechInterestSelect";
import StackSelect from "@/components/StackSelect";

interface Step2Props {
  register: UseFormRegister<ProfileFormData>;
  control: Control<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

const InputError = ({ error }: { error?: string }) => (
  <AnimatePresence>
    {error && (
      <motion.p
        className="text-sm text-red-400 mt-1"
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

export default function Step2Interests({ register, control, watch, errors }: Step2Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
      <div className="mb-4 md:col-span-5">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
          Interests
        </h1>
        <p className="text-base sm:text-lg font-semibold text-white/80">
          Let us know what you're passionate about so we can match you with the right people and opportunities.
        </p>
      </div>

      <div className="md:col-span-6 flex flex-col space-y-4 mt-4 max-w-md">
        {/* Tech Interests */}
        <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
          <label className="text-md font-medium text-white">Tech Interests*</label>
          <TechInterestSelect control = {control} />
          <InputError error={errors.techInterests?.message as any} />
        </div>

        {/* Stack (Optional) */}
        <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
          <label className="text-md font-medium text-white">Tech Stack (Optional)</label>
          <StackSelect control={control} />
          <InputError error={errors.stack?.message as any} />
        </div>

        {/* Hobbies / Non-Tech Interests */}
        <div className="flex flex-col w-full space-y-2 relative min-h-[105px]">
          <label className="text-md font-medium text-white">Hobbies or Non-Tech Interests (Optional)</label>
          <input
            type="text"
            {...register("hobbies")}
            className="border-2 border-white/40 bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none"
            placeholder="e.g. Music, Cooking, Writing..."
          />
          <InputError error={errors.hobbies?.message as any} />
        </div>

        {/* Short Bio */}
        <div className="flex flex-col w-full space-y-2 relative">
          <label className="text-md font-medium text-white">Short Bio (Optional)</label>
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
  );
}
