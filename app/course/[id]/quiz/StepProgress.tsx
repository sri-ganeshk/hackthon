import React from "react";

interface StepProgressProps {
  data: unknown[];
  stepCount: number;
  answersStatus: boolean[];
  setStepCount: (index: number) => void;
}

function StepProgress({ data, stepCount, answersStatus, setStepCount }: StepProgressProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
      {data.map((_, index) => {
        let bgColor = "bg-gray-400";

        if (index < answersStatus.length) {
          bgColor = answersStatus[index] ? "bg-green-500" : "bg-red-500";
        } else if (index === stepCount) {
          bgColor = "bg-blue-500";
        }

        return (
          <div
            key={index}
            onClick={() => setStepCount(index)}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer text-white text-sm sm:text-base ${bgColor}`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );
}

export default StepProgress;
