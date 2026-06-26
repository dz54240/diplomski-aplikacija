import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseStreamingTextOptions {
  speed?: number;
  autoStart?: boolean;
}

export interface UseStreamingText {
  text: string;
  streaming: boolean;
  stop: () => void;
  reset: (newTarget?: string) => void;
}

export function useStreamingText(
  targetText: string,
  { speed = 14, autoStart = true }: UseStreamingTextOptions = {},
): UseStreamingText {
  const [text, setText] = useState<string>(autoStart ? '' : targetText);
  const [streaming, setStreaming] = useState<boolean>(autoStart);
  const cancelRef = useRef(false);
  const idxRef = useRef(0);
  const tokensRef = useRef<string[]>([]);

  const stop = useCallback(() => {
    cancelRef.current = true;
    setStreaming(false);
  }, []);

  const reset = useCallback(
    (newTarget?: string) => {
      cancelRef.current = false;
      idxRef.current = 0;
      tokensRef.current = (newTarget ?? targetText).match(/(\s+|[^\s]+)/g) ?? [];
      setText('');
      setStreaming(true);
    },
    [targetText],
  );

  useEffect(() => {
    if (!autoStart) return;
    reset(targetText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!streaming) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (cancelRef.current) return;
      if (idxRef.current >= tokensRef.current.length) {
        setStreaming(false);
        return;
      }
      const burst = 1 + Math.floor(Math.random() * 2);
      const next = tokensRef.current.slice(0, idxRef.current + burst).join('');
      idxRef.current += burst;
      setText(next);
      timer = setTimeout(tick, speed + Math.random() * speed);
    };
    timer = setTimeout(tick, speed);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [streaming, speed]);

  return { text, streaming, stop, reset };
}
