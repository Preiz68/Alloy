"use client";

import { Control, FieldErrors, UseFormRegister, UseFormWatch,FieldValues,UseFormSetValue } from "react-hook-form";
import { ProfileFormData } from "@/schemas/profileSchema";
import { AnimatePresence, motion } from "framer-motion";
import { CountrySelect } from "./CountrySelect";

interface Step1Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  control: Control<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
  dirtyFields: Partial<Record<keyof T, boolean | boolean[]>>;
  setValue:UseFormSetValue<T>;
}

const ageRanges = [
  { label: "Under 18", value: "under18" },
  { label: "18 - 24", value: "18-24" },
  { label: "25 - 34", value: "25-34" },
  { label: "35 & Above", value: "35+" },
];

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

export default function Step1AboutYou({ register, control, watch, errors, dirtyFields,setValue }: Step1Props<ProfileFormData>) {
  return (
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
          <InputError error={errors.firstName?.message as any} />
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
          <InputError error={errors.lastName?.message as any} />
        </div>

        {/* Gender */}
        <div className="flex flex-col space-y-2 relative min-h-[105px]">
          <label className="text-md font-medium">Gender*</label>
          <div className="flex items-center gap-3">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 border-2 px-6 py-2 rounded-full border-white/40 cursor-pointer">
                <input type="radio" value={g} {...register("gender")} className="accent-purple-600" />
                <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>
          <InputError error={errors.gender?.message as any} />
        </div>

        {/* Country */}
        <div className="flex flex-col space-y-2 min-h-[105px]">
          <CountrySelect control={control} name="country" />
          <InputError error={errors.country?.message as any} />
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
                      ? "bg-pink-500 text-white border-transparent shadow-md"
                      : "border-white/40 text-white bg-white/10 hover:border-white/70"
                  }`}
                  aria-pressed={isActive}
                >
                  {range.label}
                </motion.button>
              );
            })}
          </div>
          <InputError error={errors.age?.message as any} />
        </div>
      </div>
    </div>
  );
}
