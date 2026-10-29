"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_MOTION } from "./motion";

export type StreamWord = {
  key: number;
  text: string;
};

function splitCompleteTokens(value: string) {
  return value.match(/\r?\n+|[^\S\r\n]+|[^\s]+/g) ?? [];
}

export function useWordStream() {
  const [shownWords, setShownWords] = useState<StreamWord[]>([]);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [settled, setSettled] = useState(false);
  const [queueVersion, setQueueVersion] = useState(0);
  const queue = useRef<StreamWord[]>([]);
  const buffer = useRef("");
  const nextKey = useRef(0);
  const finishedRef = useRef(false);

  const enqueue = useCallback((tokens: string[]) => {
    const queued = tokens.map((text) => ({
      key: nextKey.current++,
      text,
    }));
    queue.current.push(...queued);
    if (queued.length) setQueueVersion((version) => version + 1);
  }, []);

  const pushChunk = useCallback(
    (text: string) => {
      if (finishedRef.current || !text) return;
      setStarted(true);
      buffer.current += text;
      const tokens = splitCompleteTokens(buffer.current);
      const tail = tokens.at(-1);
      if (tail && !/\s/.test(tail)) {
        buffer.current = tail;
        tokens.pop();
      } else {
        buffer.current = "";
      }
      enqueue(tokens);
    },
    [enqueue],
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStarted(true);
    if (buffer.current) {
      enqueue(splitCompleteTokens(buffer.current));
      buffer.current = "";
    }
    setFinished(true);
  }, [enqueue]);

  const reset = useCallback(() => {
    queue.current = [];
    buffer.current = "";
    nextKey.current = 0;
    finishedRef.current = false;
    setShownWords([]);
    setFinished(false);
    setStarted(false);
    setSettled(false);
    setQueueVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (settled) return;
    if (queue.current.length) {
      const delay = Math.min(
        CHAT_MOTION.word.interval,
        Math.max(
          CHAT_MOTION.word.floorInterval,
          (CHAT_MOTION.word.interval * CHAT_MOTION.word.speedUpAt) /
            queue.current.length,
        ),
      );
      const timer = setTimeout(() => {
        const nextWord = queue.current.shift();
        if (nextWord) {
          setShownWords((words) => [...words, nextWord]);
          setQueueVersion((version) => version + 1);
        }
      }, delay);
      return () => clearTimeout(timer);
    }

    if (finished) {
      const settleDelay =
        (shownWords.length ? CHAT_MOTION.word.fade : 0) * 1000 +
        CHAT_MOTION.word.settleGrace * 1000;
      const timer = setTimeout(() => setSettled(true), settleDelay);
      return () => clearTimeout(timer);
    }
  }, [finished, queueVersion, settled, shownWords.length]);

  return {
    pushChunk,
    finish,
    reset,
    shownWords,
    settled,
    isStreaming: started && !settled,
  };
}
