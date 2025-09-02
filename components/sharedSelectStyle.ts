export const inputLikeSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: state.isFocused ? "#22d3ee" : "rgba(255,255,255,0.4)",
    color: "white",
    boxShadow: "none",
    "&:hover": { borderColor: "#22d3ee" },
  }),
  singleValue: (provided: any) => ({ ...provided, color: "white" }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#22d3ee" // highlight when selected
      : state.isFocused
      ? "#374151" // hover color
      : "#111827", // default black
    color: "white",
    cursor: "pointer",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "rgba(0,0,0,0.9)", // nice shade of black
    border: "none",
    margin: 0,
  }),
  menuList: (provided: any) => ({
    ...provided,
    backgroundColor: "rgba(0,0,0,0.9)", // same as menu
    padding: 0, // remove extra top/bottom padding
  }),
};
