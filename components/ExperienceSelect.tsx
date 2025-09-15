"use client";

import { Controller, Control } from "react-hook-form";
import Select from "react-select";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

type Option = {
  value: string;
  label: string;
};

const options: Option[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

interface ExperienceSelectProps {
  control: Control<any>;
  hasError?: boolean; // optional error flag
}


export default function ExperienceSelect({ control }: ExperienceSelectProps) {
  return (
    <Controller
      control={control}
      name="experienceLevel"
      render={({ field }) => (
        <Select<Option, false>
          {...field}
          options={options}
          value={options.find((option) => option.value === field.value) || null}
          onChange={(selected) => field.onChange(selected?.value ?? "")}
          styles={inputLikeSelectStyles} // <-- apply unified styles
          placeholder="Select your experience level"
        />
      )}
    />
  );
}
