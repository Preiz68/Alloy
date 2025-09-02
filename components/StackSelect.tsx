"use client";

import { Controller, Control } from "react-hook-form";
import Select from "react-select";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

type Option = { value: string; label: string };

const options: Option[] = [
  { value: "React", label: "React" },
  { value: "Next.js", label: "Next.js" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Django", label: "Django" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "TailwindCSS", label: "TailwindCSS" },
  { value: "PostgreSQL", label: "PostgreSQL" },
];

// Reuse the same input-like style


interface StackSelectProps {
  control: Control<any>;
}

export default function StackSelect({ control }: StackSelectProps) {
  return (
    <Controller
      control={control}
      name="stack"
      render={({ field }) => (
        <Select<Option, true>
          {...field}
          isMulti
          options={options}
          value={field.value ? options.filter((option) => field.value.includes(option.value)) : []}
          onChange={(selected) => field.onChange(selected.map((option) => option.value))}
          styles={inputLikeSelectStyles} // <-- use shared style
          closeMenuOnSelect={false}
        />
      )}
    />
  );
}
