"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const courseTypes = [
  "Exam Preparation",
  "Professional Certification",
  "Skill Development",
  "Academic Course",
  "Tutorial Series",
  "Workshop",
  "Crash Course",
  "Career Training",
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function UploadPage() {
  const { user } = useUser();
  const [msg, setMsg] = useState("");
  const [courseType, setCourseType] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setPdfFiles(files);
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setSelectedFileNames(fileNames);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("msg", msg);
    formData.append("courseType", courseType);
    formData.append("difficultyLevel", difficultyLevel);
    formData.append("userName", "your-username");
    formData.append("email", user?.emailAddresses[0]?.emailAddress ?? "");

    if (pdfFiles) {
      for (let i = 0; i < pdfFiles.length; i++) {
        formData.append("pdfFiles", pdfFiles[i]);
      }
    }

    try {
      const response = await fetch("/api/generate-course-ouline", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      router.push(`/course/${data.data.insertedId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 pt-[83px]">
      <h1 className="text-3xl font-bold mb-6">Generate Course Material</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label className="block mb-1 font-medium">Message:</label>
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 border-transparent dark:border-white/[0.2] hover:border-pink-500 bg-[#1a1a1a] transition-colors"
            placeholder="Enter your message"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Course Type:</label>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 border-transparent dark:border-white/[0.2] bg-[#1a1a1a] text-white appearance-none cursor-pointer hover:border-pink-500 transition-colors"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="" className="bg-[#1a1a1a]">
              Select Course Type
            </option>
            {courseTypes.map((type) => (
              <option key={type} value={type} className="bg-[#1a1a1a]">
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Difficulty Level:</label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 border-transparent dark:border-white/[0.2] bg-[#1a1a1a] text-white appearance-none cursor-pointer hover:border-pink-500 transition-colors"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="" className="bg-[#1a1a1a]">
              Select Difficulty Level
            </option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level} className="bg-[#1a1a1a]">
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">PDF Files:</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              required
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-pink-500 transition-colors bg-[#1a1a1a] text-center">
              <div className="flex flex-col items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-sm text-white/70">
                  <span className="font-medium">Click to upload</span> or drag and
                  drop
                  <p className="text-xs">PDF files only</p>
                </div>
              </div>
            </div>
            {selectedFileNames.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFileNames.map((fileName, index) => (
                  <div
                    key={index}
                    className="text-sm text-white/70 bg-[#2a2a2a] p-2 rounded flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {fileName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-2 rounded-md transition relative bg-[#1a1a1a] border border-transparent hover:border-pink-500 disabled:hover:border-transparent disabled:opacity-75 disabled:cursor-not-allowed text-pink-500 cursor-pointer hover:bg-pink-500 hover:text-white flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Course...
            </>
          ) : (
            "Generate Course"
          )}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-600 text-white rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
