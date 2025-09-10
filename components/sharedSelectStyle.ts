export const inputLikeSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "0.5rem",
    color: "white",
    boxShadow: "none !important", // 🚫 remove React Select focus shadow
    outline: "none", // 🚫 remove browser outline
    "&:hover": {
      border: "1px solid rgba(255,255,255,0.3)", // keep border consistent
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "rgba(0,0,0,0.95)",
    color: "white",
  }),
  option: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    color: "white",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "white",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "white",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "rgba(255,255,255,0.6)",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "white",
  }),
};
