"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** Position after text commits, without a second React render per keystroke. */
export function useTypingCaret({
  wordRef,
  containerRef,
  inputLength,
  wordIndex,
  ready,
  smooth,
  showAllLines,
  fontFamily,
  fontSize,
}: {
  wordRef: RefObject<HTMLSpanElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  inputLength: number;
  wordIndex: number;
  ready: boolean;
  smooth: boolean;
  showAllLines: boolean;
  fontFamily: string;
  fontSize: number;
}) {
  const caretRef = useRef<HTMLDivElement>(null);
  const previous = useRef<{ x: number; y: number } | null>(null);
  const animation = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    const word = wordRef.current;
    const container = containerRef.current;
    if (!ready || !caret || !word || !container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function position(animate = true) {
      if (!caret || !word || !container) return;
      const character =
        word.children[Math.min(inputLength, word.children.length - 1)];
      const bounds = container.getBoundingClientRect();
      const wordBounds = word.getBoundingClientRect();
      const x =
        (character?.getBoundingClientRect().left ?? wordBounds.right) -
        bounds.left;
      const y = wordBounds.top - bounds.top;
      // Derive line height from the actual rendered font, including mobile sizing.
      const lineHeight =
        wordBounds.height +
        parseFloat(getComputedStyle(word).marginTop) +
        parseFloat(getComputedStyle(word).marginBottom);
      const offset = showAllLines ? 0 : Math.max(0, y - lineHeight);
      const target = `translate3d(${x}px, ${y}px, 0)`;
      const changed = previous.current?.x !== x || previous.current?.y !== y;
      const sameLine =
        previous.current !== null && Math.abs(previous.current.y - y) < 1;
      const from = changed ? getComputedStyle(caret).transform : "none";

      caret.style.height = `${wordBounds.height}px`;
      container.style.transform = `translate3d(0, -${offset}px, 0)`;
      if (!smooth || reducedMotion.matches) animation.current?.cancel();
      if (!changed) return;
      animation.current?.cancel();
      caret.style.transform = target;
      // Retarget from the currently displayed position during fast bursts.
      // Line changes and first placement snap; the word window handles scrolling.
      if (animate && smooth && sameLine && !reducedMotion.matches) {
        animation.current = caret.animate(
          [{ transform: from }, { transform: target }],
          { duration: 100, easing: "linear" },
        );
      }
      previous.current = { x, y };
    }

    position();
    const observer = new ResizeObserver(() => position(false));
    observer.observe(container);
    observer.observe(word);
    const remeasure = () => position(false);
    document.fonts.addEventListener("loadingdone", remeasure);
    reducedMotion.addEventListener("change", remeasure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", remeasure);
      reducedMotion.removeEventListener("change", remeasure);
    };
  }, [
    wordRef,
    containerRef,
    inputLength,
    wordIndex,
    ready,
    smooth,
    showAllLines,
    fontFamily,
    fontSize,
  ]);

  useLayoutEffect(
    () => () => {
      animation.current?.cancel();
    },
    [],
  );
  return caretRef;
}
