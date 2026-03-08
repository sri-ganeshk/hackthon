"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CourseOutline {
  courseTitle: string;
  courseSummary: string;
}

interface CourseItem {
  _id: string;
  outline: CourseOutline;
}

export default function Dashboard() {
  const { isSignedIn, user } = useUser();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(
          `/api/courses?email=${user?.emailAddresses[0]?.emailAddress}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchCourses();
    }
  }, [isSignedIn, user?.emailAddresses]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-xl font-semibold">
          Please sign in to access your dashboard.
        </p>
        <div className="px-6 py-3 rounded-lg shadow-md bg-pink-500 hover:bg-pink-600 transition-colors">
          <SignInButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Try Again...</p>
      </div>
    );
  }

  const truncateSummary = (summary = "", wordLimit = 5) => {
    const words = summary.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return summary;
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 md:py-20 px-4">
      {/* Header Section */}
      <div className="shadow-lg p-6 w-full max-w-4xl rounded-lg">
        <h1 className="text-2xl md:text-3xl font-bold py-10">
          Hello, {user?.fullName}
        </h1>
        <p className="text-base md:text-lg mt-2">
          Welcome back, it&apos;s time to get back and start learning a new course.
        </p>
      </div>

      {/* Courses Section */}
      <div className="mt-10 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Your Courses</h2>
          <Link href="/course">
            <button className="px-6 py-2 rounded-md text-lg font-semibold shadow-md text-pink-500 border border-pink-500 hover:bg-pink-500 hover:text-white transition">
              <span className="inline-block md:hidden">+</span>
              <span className="hidden md:inline">+ Create New</span>
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          {courses.map((course) => {
            const truncated = truncateSummary(course.outline.courseSummary, 5);

            return (
              <div
                key={course._id}
                className="p-6 rounded-lg shadow-md border border-transparent hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {course.outline.courseTitle}
                    </h3>
                    <p className="text-sm md:text-base" title={course.outline.courseSummary}>
                      {truncated}
                    </p>
                  </div>
                  <Link href={`/course/${course._id}`}>
                    <button className="px-6 py-2 font-semibold shadow-md rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
