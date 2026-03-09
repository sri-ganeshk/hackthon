"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import QuizCardItem from "./QuizCardItem";
import StepProgress from "./StepProgress";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizKingDisplay() {
  const { id } = useParams();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stepCount, setStepCount] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answersStatus, setAnswersStatus] = useState<boolean[]>([]);
  const [disableOptions, setDisableOptions] = useState(false);

  useEffect(() => {
    async function fetchQuizQuestions() {
      try {
        const response = await fetch(`/api/quiz/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz questions");
        }
        const data = await response.json();
        setQuizQuestions(data.data.quizQuestions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizQuestions();
  }, [id]);

  const checkAnswer = (selectedOption: string, currentQuiz: QuizQuestion) => {
    if (disableOptions) return;
    setDisableOptions(true);

    const answerIsCorrect = selectedOption === currentQuiz.correctAnswer;
    setIsCorrectAnswer(answerIsCorrect);

    if (answerIsCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setCorrectAnswer(currentQuiz.correctAnswer);
    }

    setAnswersStatus((prev) => [...prev, answerIsCorrect]);

    setTimeout(() => {
      if (stepCount < quizQuestions.length - 1) {
        setStepCount((prevStep) => prevStep + 1);
        setIsCorrectAnswer(null);
      }
      setDisableOptions(false);
    }, 3000);
  };

  const goToCoursePage = () => {
    window.location.href = `/course/${id}`;
  };

  return (
    <div className="w-full min-h-screen bg-black px-4 py-20 sm:px-8">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Quiz King
      </h1>

      {loading && (
        <p className="text-white text-xl text-center">
          Generating the quiz...
        </p>
      )}
      {error && (
        <pre className="text-red-400 bg-gray-800 p-4 rounded mx-auto max-w-xl">
          Try again later...
        </pre>
      )}

      {!loading && quizQuestions.length > 0 ? (
        <>
          <StepProgress
            data={quizQuestions}
            stepCount={stepCount}
            answersStatus={answersStatus}
            setStepCount={(value: number) => {
              if (!disableOptions) {
                setStepCount(value);
                setIsCorrectAnswer(null);
              }
            }}
          />

          <div className="max-w-xl mx-auto w-full bg-black border border-white rounded-lg p-6 mt-6">
            <QuizCardItem
              quiz={quizQuestions[stepCount]}
              disableOptions={disableOptions}
              userSelectedOption={(v: string) =>
                checkAnswer(v, quizQuestions[stepCount])
              }
            />
          </div>

          {isCorrectAnswer === false && (
            <div className="max-w-xl mx-auto w-full border border-red-600 bg-red-200 rounded-lg mt-6 p-4 text-center">
              <h2 className="font-bold text-lg text-red-600">Incorrect</h2>
              <p className="text-red-600">
                Correct answer:{" "}
                <span className="font-mono">{correctAnswer}</span>
              </p>
            </div>
          )}
          {isCorrectAnswer === true && (
            <div className="max-w-xl mx-auto w-full border border-green-600 bg-green-200 rounded-lg mt-6 p-4 text-center">
              <h2 className="font-bold text-lg text-green-600">Correct</h2>
              <p className="text-green-600">Your answer is correct</p>
            </div>
          )}

          {stepCount === quizQuestions.length - 1 && (
            <div className="flex flex-col items-center mt-8">
              <div className="text-white mb-4">
                Your Score:{" "}
                <span className="font-bold text-green-500">{score}</span> /{" "}
                <span className="font-bold">{quizQuestions.length}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <p className="text-white text-xl text-center">
            Generating the quiz...
          </p>
        )
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={goToCoursePage}
          className="px-6 py-3 bg-black text-white rounded-md border border-white/50 
                     shadow-[0_0_10px_rgba(255,255,255,0.3)] 
                     hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]
                     transition-shadow duration-300"
        >
          Go to Course Page
        </button>
      </div>
    </div>
  );
}
