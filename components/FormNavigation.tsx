"use client";

interface FormNavigationProps {
  step: number;
  maxStep: number;
  back: () => void;
  next: () => void;
  isSubmitting: boolean;
}

export default function FormNavigation({ step, maxStep, back, next, isSubmitting }: FormNavigationProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 flex z-10 items-center ${
        step === 1 ? "justify-end" : "justify-between"
      } bg-white/20 backdrop-blur-md py-4 px-4 sm:px-6 border-t border-white/30`}
    >
      {step > 1 && (
        <button
          type="button"
          onClick={back}
          aria-label="Go back"
          className="border border-white/40 px-4 py-2 text-base sm:text-lg text-white rounded-lg hover:bg-white/20 hover:text-white"
        >
          Back
        </button>
      )}
      {step === maxStep ? (
        <button
          type="submit"
          aria-label="Finish setup"
          className="bg-purple-500 text-white px-4 py-2 cursor-pointer text-base sm:text-lg rounded-lg"
          disabled={isSubmitting}
        >
          Finish
        </button>
      ) : (
        <button
          type="button"
          onClick={next}
          aria-label="Next step"
          className="bg-purple-500 text-white px-4 py-2 cursor-pointer text-base sm:text-lg rounded-lg"
        >
          {step === 1 ? "Add Interests" : "Add Experience"}
        </button>
      )}
    </div>
  );
}
