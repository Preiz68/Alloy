"use client";

import { Controller, Control } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

type Option = {
  value: string;
  label: string;
};

const options: Option[] = [
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
];

interface TechSelectProps {
  control: Control<any>;
  hasError?: boolean;
}

export default function TechInterestSelect({ control }: TechSelectProps) {
  return (
    <Controller
      control={control}
      name="techInterests"
      render={({ field }) => (
        <CreatableSelect<Option, true>
          isMulti
          options={options}
          value={
            field.value?.map((val: string) => ({
              value: val,
              label: val,
            })) || []
          } // string[] → Option[]
          onChange={(selected) =>
            field.onChange(selected ? selected.map((opt) => opt.value) : [])
          } // Option[] → string[]
          styles={inputLikeSelectStyles}
          placeholder="Select or type your interests..."
        />
      )}
    />
  );
}
