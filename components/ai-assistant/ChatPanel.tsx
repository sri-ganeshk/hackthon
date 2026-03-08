'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatPanelProps {
  resourceId?: string;
}

interface Source {
  chunkIndex: number;
  text: string;
}

/** Persistent floating AI chat panel accessible on all pages */
export default function ChatPanel({ resourceId }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { resourceId },
    onResponse: (response) => {
      const sourcesHeader = response.headers.get('X-Sources');
      if (sourcesHeader) {
        try {
          setSources(JSON.parse(sourcesHeader) as Source[]);
        } catch {
          // ignore parse errors
        }
      }
    },
  });

  const toggleSource = (index: number) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-black border border-white/20 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MessageCircle size={18} />
          AI Study Assistant
          {resourceId && (
            <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">
              RAG
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-8">
            Ask me anything about your study materials!
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white/60 rounded-lg px-3 py-2 text-sm">
              Thinking...
            </div>
          </div>
        )}

        {/* Source citations */}
        {sources.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-white/40">Sources:</p>
            {sources.map((source, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSource(i)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-white/60 hover:bg-white/5"
                >
                  <span>Chunk #{source.chunkIndex}</span>
                  {expandedSources.has(i) ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                {expandedSources.has(i) && (
                  <div className="px-3 py-2 text-xs text-white/50 border-t border-white/10">
                    {source.text.substring(0, 300)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/10 flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-pink-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
