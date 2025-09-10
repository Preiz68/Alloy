"use client";

import { Controller } from "react-hook-form";
import Select from "react-select";
import countryList from "react-select-country-list";
import { inputLikeSelectStyles } from "./sharedSelectStyle";

const options = countryList().getData();

// Shared style to match text inputs


type Props = {
  control: any;
  name: string;
};

export const CountrySelect = ({ control, name }: Props) => {
  return (
    <div className="w-full">
      <label className="text-md font-medium mb-1 block text-white">Country*</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            options={options}
            isSearchable
            placeholder="Select your country"
            value={options.find((opt: { label: string; value: string }) => opt.label === field.value)}
            onChange={(val) => field.onChange(val?.label)}
            styles={inputLikeSelectStyles} // <-- apply shared style
          />
        )}
      />
    </div>
  );
};
