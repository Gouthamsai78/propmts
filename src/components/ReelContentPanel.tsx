
import { useState } from "react";

interface ReelContentPanelProps {
  authorAvatar: string;
  author: string;
  title: string;
  content?: string;
  prompt?: string;
  showAllContent: boolean;
  setShowAllContent: (v: boolean) => void;
  showAllPrompt: boolean;
  setShowAllPrompt: (v: boolean) => void;
  allow_copy: boolean;
  handleCopyPrompt: () => void;
}

export const ReelContentPanel = ({
  authorAvatar,
  author,
  title,
  content,
  prompt,
  showAllContent,
  setShowAllContent,
  showAllPrompt,
  setShowAllPrompt,
  allow_copy,
  handleCopyPrompt,
}: ReelContentPanelProps) => {
  const clampContent = !showAllContent ? "line-clamp-2" : "";
  const clampPrompt = !showAllPrompt ? "line-clamp-2" : "";
  const SHOW_CONTENT_READ_MORE = content && content.length > 100;
  const SHOW_PROMPT_READ_MORE = prompt && prompt.length > 80;

  return (
    <div className="absolute bottom-24 left-4 right-20 space-y-2 z-30">
      <div className="flex items-center space-x-2">
        <img
          src={authorAvatar}
          alt={author}
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <p className="font-bold">{author}</p>
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {content && (
        <p className={`text-sm text-gray-200 ${clampContent}`}>
          {showAllContent ? content : content.slice(0, 150)}
          {!showAllContent && SHOW_CONTENT_READ_MORE && (
            <>
              ...{" "}
              <button
                onClick={() => setShowAllContent(true)}
                className="underline text-blue-200 font-medium ml-1 text-xs"
              >
                Read more
              </button>
            </>
          )}
          {showAllContent && SHOW_CONTENT_READ_MORE && (
            <button
              onClick={() => setShowAllContent(false)}
              className="underline text-blue-200 font-medium ml-2 text-xs"
            >
              Read less
            </button>
          )}
        </p>
      )}
      {prompt && (
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg mt-2">
          <span className={`text-sm font-mono text-white ${clampPrompt}`}>
            {showAllPrompt ? prompt : prompt.slice(0, 120)}
            {!showAllPrompt && SHOW_PROMPT_READ_MORE && (
              <>
                ...{" "}
                <button
                  onClick={() => setShowAllPrompt(true)}
                  className="underline text-blue-200 font-medium ml-1 text-xs"
                >
                  Read more
                </button>
              </>
            )}
            {showAllPrompt && SHOW_PROMPT_READ_MORE && (
              <button
                onClick={() => setShowAllPrompt(false)}
                className="underline text-blue-200 font-medium ml-2 text-xs"
              >
                Read less
              </button>
            )}
            {allow_copy && (
              <button
                onClick={handleCopyPrompt}
                className="ml-4 px-2 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
              >
                Copy prompt
              </button>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
