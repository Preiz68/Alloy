"use client";

import { Controller, Control } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

type Option = { value: string; label: string };

const options: Option[] = [
  // --- Frontend ---
  { value: "React", label: "React" },
  { value: "Next.js", label: "Next.js" },
  { value: "Vue.js", label: "Vue.js" },
  { value: "Angular", label: "Angular" },
  { value: "Svelte", label: "Svelte" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "TailwindCSS", label: "TailwindCSS" },
  { value: "Bootstrap", label: "Bootstrap" },

  // --- Backend ---
  { value: "Node.js", label: "Node.js" },
  { value: "Express", label: "Express" },
  { value: "Django", label: "Django" },
  { value: "Flask", label: "Flask" },
  { value: "Spring Boot", label: "Spring Boot" },
  { value: "Ruby on Rails", label: "Ruby on Rails" },

  // --- Databases ---
  { value: "MongoDB", label: "MongoDB" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MySQL", label: "MySQL" },
  { value: "SQLite", label: "SQLite" },
  { value: "Firebase", label: "Firebase" },
  { value: "Supabase", label: "Supabase" },

  // --- DevOps / Tools ---
  { value: "Docker", label: "Docker" },
  { value: "Kubernetes", label: "Kubernetes" },
  { value: "Git", label: "Git" },
  { value: "GitHub Actions", label: "GitHub Actions" },
  { value: "AWS", label: "AWS" },
  { value: "Azure", label: "Azure" },
  { value: "Google Cloud", label: "Google Cloud" },
];

interface StackSelectProps {
  control: Control<any>;
}

export default function StackSelect({ control }: StackSelectProps) {
  return (
    <Controller
      control={control}
      name="stack"
      render={({ field }) => (
        <CreatableSelect<Option, true>
          isMulti
          options={options}
          value={
            field.value
              ? field.value.map((val: string) => ({ value: val, label: val }))
              : []
          } // string[] → Option[]
          onChange={(selected) =>
            field.onChange(selected ? selected.map((opt) => opt.value) : [])
          } // Option[] → string[]
          styles={inputLikeSelectStyles}
          placeholder="Select or type your stack..."
          closeMenuOnSelect={false}
        />
      )}
    />
  );
}
