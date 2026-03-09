"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QAItem {
  question: string;
  answer: string;
}

export default function DescriptiveQA() {
  const { id } = useParams();
  const [descriptiveQA, setDescriptiveQA] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goToCoursePage = () => {
    window.location.href = `/course/${id}`;
  };

  useEffect(() => {
    async function fetchDescriptiveQA() {
      try {
        const response = await fetch(`/api/qna/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch descriptive Q&A data");
        }
        const data = await response.json();
        setDescriptiveQA(data.data.descriptiveQA);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchDescriptiveQA();
  }, [id]);

  return (
    <div className="min-h-screen bg-black py-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Descriptive Q&A
        </h1>

        {loading && (
          <p className="text-center text-white">
            Generating descriptive questions and answers...
          </p>
        )}

        {error && (
          <pre className="text-center text-red-400 bg-gray-800 p-4 rounded">
            {error}
          </pre>
        )}

        {!loading && descriptiveQA.length > 0 && (
          <div className="flex flex-col gap-6">
            {descriptiveQA.map((item, idx) => (
              <div
                key={idx}
                className="border border-white/20 rounded-lg p-6 bg-black shadow-md"
              >
                <div className="font-bold mb-3 text-s sm:text-xl text-center text-white">
                  Q. {item.question}
                </div>
                <div className="text-gray-300 text-xs sm:text-xl text-center">
                  A.{" "}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.answer}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
