"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Copy, Check } from "lucide-react";
import { CHAT_MOTION } from "./motion";
import { useWordStream, type StreamWord } from "./useWordStream";
import MarkdownAnswer from "./MarkdownAnswer";

type StreamedTextProps = {
  content: string;
  animate: boolean;
  runKey: string;
  copyText: string;
  showCopy: boolean;
  onSettled: (index: number) => void;
  index: number;
};

type DisplayLine = {
  tokens: StreamWord[];
  breakAfter: boolean;
  paragraphAfter: boolean;
};

function splitLines(words: StreamWord[]): DisplayLine[] {
  const lines: DisplayLine[] = [];
  let tokens: StreamWord[] = [];

  for (const word of words) {
    if (/^\r?\n+$/.test(word.text)) {
      lines.push({
        tokens,
        breakAfter: word.text.length === 1,
        paragraphAfter: word.text.length > 1,
      });
      tokens = [];
    } else {
      tokens.push(word);
    }
  }
  lines.push({ tokens, breakAfter: false, paragraphAfter: false });
  return lines;
}

function lineKind(line: DisplayLine) {
  const firstIndex = line.tokens.findIndex((token) => token.text.trim());
  if (firstIndex < 0) return { kind: "empty", markerIndex: -1 };
  const marker = line.tokens[firstIndex].text.trim();
  if (/^#{1,6}$/.test(marker)) return { kind: "heading", markerIndex: firstIndex };
  if (marker === "-" || marker === "*") return { kind: "ul", markerIndex: firstIndex };
  if (/^\d+[.)]$/.test(marker)) return { kind: "ol", markerIndex: firstIndex };
  return { kind: "p", markerIndex: -1 };
}

function WordSpans({
  tokens,
  markerIndex = -1,
}: {
  tokens: StreamWord[];
  markerIndex?: number;
}) {
  return (
    <>
      {tokens.map((token, index) => {
        if (index === markerIndex) return null;
        const content = token.text.replace(/\*\*/g, "");
        const visible = markerIndex >= 0 && index === markerIndex + 1
          ? content.replace(/^[^\S\r\n]+/, "")
          : content;
        if (!visible) return null;
        return (
          <span className="chat-stream-word" key={token.key}>
            {visible}
          </span>
        );
      })}
    </>
  );
}

function StreamingMarkdown({ words }: { words: StreamWord[] }) {
  const lines = splitLines(words);
  const blocks: Array<{ kind: "paragraph" | "heading" | "ul" | "ol"; lines: DisplayLine[] }> = [];
  let paragraphLines: DisplayLine[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ kind: "paragraph", lines: paragraphLines });
      paragraphLines = [];
    }
  };

  for (const line of lines) {
    const kind = lineKind(line);
    if (kind.kind === "empty") {
      flushParagraph();
      continue;
    }
    if (kind.kind === "heading") {
      flushParagraph();
      blocks.push({ kind: "heading", lines: [line] });
    } else if (kind.kind === "ul" || kind.kind === "ol") {
      flushParagraph();
      const previous = blocks.at(-1);
      if (previous?.kind === kind.kind) previous.lines.push(line);
      else blocks.push({ kind: kind.kind, lines: [line] });
    } else {
      paragraphLines.push(line);
    }
    if (line.paragraphAfter) flushParagraph();
  }
  flushParagraph();

  return (
    <div className="min-w-0 text-[15px] leading-[1.65] text-[#eee]">
      {blocks.map((block, blockIndex) => {
        if (block.kind === "heading") {
          const line = block.lines[0];
          const markerIndex = lineKind(line).markerIndex;
          return (
            <h2
              key={`heading-${blockIndex}`}
              className="mb-2 mt-5 text-[19px] font-semibold text-white"
            >
              <WordSpans tokens={line.tokens} markerIndex={markerIndex} />
            </h2>
          );
        }
        if (block.kind === "ul" || block.kind === "ol") {
          const List = block.kind;
          return (
            <List
              key={`${block.kind}-${blockIndex}`}
                    className={`mb-3 space-y-1.5 pl-[22px] ${
                      block.kind === "ul" ? "list-disc" : "list-decimal"
                    }`}
            >
              {block.lines.map((line, lineIndex) => (
                <li key={`line-${lineIndex}`}>
                  <WordSpans tokens={line.tokens} markerIndex={lineKind(line).markerIndex} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={`paragraph-${blockIndex}`} className="mb-3">
            {block.lines.map((line, lineIndex) => (
              <span key={`line-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                <WordSpans tokens={line.tokens} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function StreamedText({
  content,
  animate,
  runKey,
  copyText,
  showCopy,
  onSettled,
  index,
}: StreamedTextProps) {
  const { pushChunk, finish, shownWords, settled } = useWordStream();
  const [buttonReady, setButtonReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const settledNotified = useRef(false);

  useEffect(() => {
    settledNotified.current = false;
    if (!animate) return;

    let offset = 0;
    const timer = setInterval(() => {
      const chunk = content.slice(
        offset,
        offset + CHAT_MOTION.word.chunkSize,
      );
      if (!chunk) {
        clearInterval(timer);
        finish();
        return;
      }
      pushChunk(chunk);
      offset += chunk.length;
      if (offset >= content.length) {
        clearInterval(timer);
        finish();
      }
    }, CHAT_MOTION.word.chunkInterval);

    return () => clearInterval(timer);
  }, [animate, content, finish, pushChunk, runKey]);

  useEffect(() => {
    if (!animate || !settled || settledNotified.current) return;
    settledNotified.current = true;
    onSettled(index);
    const timer = setTimeout(
      () => setButtonReady(true),
      CHAT_MOTION.word.buttonsDelay * 1000,
    );
    return () => clearTimeout(timer);
  }, [animate, index, onSettled, settled]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setCopyError(null);
      setTimeout(
        () => setCopied(false),
        CHAT_MOTION.word.copyFeedback * 1000,
      );
    } catch (reason) {
      setCopyError(reason instanceof Error ? reason.message : "Copy failed.");
    }
  };

  const customStyle = {
    "--chat-logo-max-opacity": CHAT_MOTION.logo.maxOpacity,
    "--chat-word-duration": `${CHAT_MOTION.word.fade}s`,
    "--chat-word-distance": `${CHAT_MOTION.word.distance}px`,
    "--chat-word-rest-distance": `${CHAT_MOTION.word.restDistance}px`,
    "--chat-word-button-fade": `${CHAT_MOTION.word.buttonFade}s`,
  } as CSSProperties;

  return (
    <div className="min-w-0 flex-1" style={customStyle}>
      {animate && !settled ? (
        <StreamingMarkdown words={shownWords} />
      ) : (
        <MarkdownAnswer content={content} />
      )}
      <div className="mt-2 flex h-9 items-start">
        {showCopy && (!animate || (settled && buttonReady)) && (
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label={copied ? "Copied response" : "Copy response"}
            className="chat-copy-button inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] text-[#a8a8a2] hover:bg-[#2f2f2d] hover:text-[#eee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
          >
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      {copyError && (
        <p role="alert" className="text-sm text-[#f0b44c]">
          {copyError}
        </p>
      )}
    </div>
  );
}
