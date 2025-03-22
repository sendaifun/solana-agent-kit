"use client";
interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  buttonLabel: string;
  disabled: boolean;
  onClick: () => void;
  isComplete: boolean;
  children?: React.ReactNode;
}

export function StepCard({
  stepNumber,
  title,
  description,
  buttonLabel,
  disabled,
  onClick,
  isComplete,
  children,
}: StepCardProps) {
  return (
    <div className="flex flex-col w-full max-w-md p-4 border rounded border-gray-300 gap-2">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
            isComplete ? "bg-green-600" : "bg-gray-500"
          }`}>
          {stepNumber}
        </div>
        <h2 className="ml-2 text-lg font-semibold">{title}</h2>
      </div>
      <p>{description}</p>
      {children}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-2 px-4 py-2 rounded ${
          disabled ? "bg-gray-300 text-gray-600" : "bg-blue-900 text-white hover:bg-blue-950"
        }`}>
        {buttonLabel}
      </button>
    </div>
  );
}