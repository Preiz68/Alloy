"use client";

import { Controller } from "react-hook-form";
import Select from "react-select";
import countryList from "react-select-country-list";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

const options = countryList().getData();

type Props = {
  control: any;
  name: string;
};

export const CountrySelect = ({ control, name }: Props) => {
  return (
    <div className="w-full">
      <label className="text-md font-medium mb-1 block text-white">
        Country*
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            isSearchable
            placeholder="Type/Select your country..."
            value={options.find((opt) => opt.value === field.value) || null}
            onChange={(val) => field.onChange(val?.value ?? "")} // ✅ normalize to string
            styles={inputLikeSelectStyles}
            menuPlacement="auto"
          />
        )}
      />
    </div>
  );
};
