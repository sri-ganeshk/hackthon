"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Page {
  title: string;
  content: string;
}

interface Article {
  topic: string;
  pages: Page[];
}

interface Chapter {
  chapter: string;
  articles: Article[];
}

export default function GeminiChaptersByTopicRaw() {
  const { id } = useParams();
  const [chapterResponses, setChapterResponses] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNoteData() {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch note data");
        }
        const data = await response.json();
        setChapterResponses(data.data.note.chapters);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchNoteData();
    }
  }, [id]);

  useEffect(() => {
    setCurrentTopicIndex(0);
  }, [currentChapterIndex]);

  const handleTopicNext = () => {
    const currentArticles = chapterResponses[currentChapterIndex].articles;
    if (currentTopicIndex < currentArticles.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    } else if (currentChapterIndex < chapterResponses.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentTopicIndex(0);
    }
  };

  const handleTopicPrev = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
    } else if (currentChapterIndex > 0) {
      const prevArticles = chapterResponses[currentChapterIndex - 1].articles;
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentTopicIndex(prevArticles.length - 1);
    }
  };

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    setCurrentTopicIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Generating the notes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Try again later...
      </div>
    );
  }

  if (!chapterResponses.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Generating the notes...
      </div>
    );
  }

  const currentChapter = chapterResponses[currentChapterIndex];
  const currentArticle = currentChapter.articles[currentTopicIndex];

  return (
    <div className="container py-20">
      {/* Chapter Header */}
      <header className="chapter-header">
        <h1>{currentChapter.chapter}</h1>
      </header>

      {/* Chapter Dots Navigation */}
      <div className="chapter-dots">
        {chapterResponses.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentChapterIndex ? "active" : ""}`}
            onClick={() => handleChapterSelect(idx)}
          />
        ))}
      </div>

      {/* Topic Navigation Controls */}
      <div className="topic-navigation">
        <button onClick={handleTopicPrev} className="nav-button">
          Previous Topic
        </button>
        <span className="page-info">
          Topic {currentTopicIndex + 1} of {currentChapter.articles.length}
        </span>
        <button onClick={handleTopicNext} className="nav-button">
          Next Topic
        </button>
      </div>

      {/* Topic Content */}
      <section className="content-section">
        <div className="article">
          <h2>{currentArticle.topic}</h2>
          {currentArticle.pages[0] && (
            <>
              <div
                className="page-title"
                dangerouslySetInnerHTML={{
                  __html: currentArticle.pages[0].title,
                }}
              />
              <div
                className="page-content"
                dangerouslySetInnerHTML={{
                  __html: currentArticle.pages[0].content,
                }}
              />
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
        }
        /* Chapter dots */
        .chapter-dots {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .dot {
          height: 12px;
          width: 12px;
          margin: 0 5px;
          background-color: #bbb;
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .dot.active {
          background-color: #0070f3;
        }
        /* Chapter header */
        .chapter-header h1 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2rem;
        }
        /* Topic Navigation */
        .topic-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }
        .topic-navigation .nav-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 0 10px;
          font-size: 1rem;
          transition: background-color 0.2s ease;
          white-space: nowrap;
        }
        .topic-navigation .nav-button:hover {
          background-color: #005bb5;
        }
        .page-info {
          font-size: 1rem;
          font-weight: bold;
        }
        /* Topic content */
        .content-section {
          line-height: 1.6;
          padding: 0 10px;
        }
        .article {
          margin-bottom: 30px;
        }
        .article h2 {
          font-size: 1.75rem;
          margin-bottom: 15px;
        }
        .page-title h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
        .page-content h4 {
          font-size: 1.25rem;
          margin-bottom: 10px;
        }
        .page-content p {
          font-size: 1rem;
        }

        /* Responsive Styles for Mobile */
        @media (max-width: 768px) {
          .container {
          }
          .chapter-header h1 {
            font-size: 1.4rem;
            margin-bottom: 20px;
          }
          .chapter-dots {
            margin-bottom: 15px;
          }
          .dot {
            height: 10px;
            width: 10px;
            margin: 0 4px;
          }
          .topic-navigation {
            /* Keep the buttons on the same line */
            flex-direction: row;
            flex-wrap: wrap; /* Allows wrapping if needed on very small screens */
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
          }
          .topic-navigation .nav-button {
            margin: 5px;
            padding: 6px 12px;
            font-size: 0.9rem;
          }
          .page-info {
            font-size: 0.9rem;
            margin: 5px;
            white-space: nowrap; /* Prevents line break */
          }
          .article h2 {
            font-size: 1.3rem;
            margin-bottom: 10px;
            text-align: center;
          }
          .page-title h3 {
            font-size: 1.1rem;
            margin-bottom: 8px;
            text-align: center;
          }
          .page-content h4 {
            font-size: 1rem;
            margin-bottom: 8px;
          }
          .page-content p {
            font-size: 0.9rem;
            line-height: 1.4;
          }
        }
      `}</style>
    </div>
  );
}
