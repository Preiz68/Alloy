const IconButton = ({children,label,}: {children: React.ReactNode; label?: string;}) => (
  <button
    className="p-2 rounded-md hover:bg-gray-100 transition text-gray-700"
    aria-label={label}
  >
    {children}
  </button>
);
export default IconButton;