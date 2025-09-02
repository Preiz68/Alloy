"use client";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface CustomToastProps {
  type: "success" | "error";
  message: string;
}

export const CustomToast = ({ type, message }: CustomToastProps) => {
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className={`flex items-center gap-2 rounded-md shadow-md min-w-full min-h-full text-sm text-white ${
        isSuccess ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {isSuccess ? (
        <FaCheckCircle className="text-white text-base" />
      ) : (
        <FaTimesCircle className="text-white text-base" />
      )}
      <span>{message}</span>
    </motion.div>
  );
};
