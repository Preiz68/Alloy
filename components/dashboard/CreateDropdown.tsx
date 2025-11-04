const CreateDropdown = ({ handledropdownSelect }: any) => {
  const handleSelectedOption = (option: string) => {
    handledropdownSelect(option);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md shadow-lg border border-gray-200 rounded-lg text-sm text-gray-800 w-44 py-2">
      <div
        onClick={() => handleSelectedOption("projectGroup")}
        className="px-3 py-2 hover:bg-purple-50 hover:text-purple-600 cursor-pointer transition-all duration-200 rounded-md"
      >
        + Project Group
      </div>
      <div
        onClick={() => handleSelectedOption("community")}
        className="px-3 py-2 hover:bg-purple-50 hover:text-purple-600 cursor-pointer transition-all duration-200 rounded-md"
      >
        + Community
      </div>
    </div>
  );
};

export default CreateDropdown;
