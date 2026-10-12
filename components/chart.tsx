"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Sample } from "@/lib/config";
import { smoothPath } from "@/lib/chart-path";

export function Chart({
  samples,
  compact = false,
  expanded = false,
}: {
  samples: Sample[];
  compact?: boolean;
  expanded?: boolean;
}) {
  const [hover, setHover] = useState({ index: 0, visible: false });
  const frame = useRef<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 300 });
  useEffect(() => {
    if (!expanded || !container.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [expanded]);
  const width = expanded ? size.width : 800,
    height = expanded ? size.height : compact ? 140 : 210,
    pad = 35;
  const plot = useMemo(() => {
    const maximum = samples.reduce(
      (max, sample) => Math.max(max, sample.raw, sample.wpm),
      50,
    );
    const rounded = Math.ceil(maximum / 25) * 25;
    const x = (i: number) =>
      samples.length === 1
        ? width / 2
        : pad + (i / Math.max(1, samples.length - 1)) * (width - pad * 2);
    const y = (value: number) =>
      height - pad - (value / rounded) * (height - pad * 2);
    const points = samples.map((sample, i) => ({
      x: x(i),
      wpmY: y(sample.wpm),
      rawY: y(sample.raw),
    }));
    return {
      rounded,
      y,
      points,
      wpm: smoothPath(points.map((p) => ({ x: p.x, y: p.wpmY }))),
      raw: smoothPath(points.map((p) => ({ x: p.x, y: p.rawY }))),
    };
  }, [samples, height, width]);
  const select = (index: number) =>
    setHover((old) =>
      old.visible && old.index === index ? old : { index, visible: true },
    );
  const hide = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHover((old) => ({ ...old, visible: false }));
  };
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const index = Math.min(hover.index, Math.max(0, samples.length - 1));
  const sample = samples[index],
    point = plot.points[index];
  return (
    <div ref={container} className={`chart ${expanded ? "chart-expanded" : ""}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={samples.length ? 0 : undefined}
        aria-label="Words per minute and raw speed over time. Use left and right arrow keys to inspect samples."
        onPointerMove={(event) => {
          const svg = event.currentTarget,
            clientX = event.clientX,
            clientY = event.clientY;
          if (frame.current !== null) cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => {
            frame.current = null;
            const matrix = svg.getScreenCTM();
            if (!matrix || !samples.length) return;
            const local = new DOMPoint(clientX, clientY).matrixTransform(
              matrix.inverse(),
            );
            select(
              Math.max(
                0,
                Math.min(
                  samples.length - 1,
                  Math.round(
                    ((local.x - pad) / (width - pad * 2)) *
                      (samples.length - 1),
                  ),
                ),
              ),
            );
          });
        }}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onBlur={hide}
        onFocus={() => {
          if (samples.length) select(index);
        }}
        onKeyDown={(event) => {
          if (
            !samples.length ||
            !["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          if (event.key === "Escape") {
            hide();
            return;
          }
          select(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? samples.length - 1
                : Math.max(
                    0,
                    Math.min(
                      samples.length - 1,
                      index + (event.key === "ArrowRight" ? 1 : -1),
                    ),
                  ),
          );
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={pad}
              y1={plot.y((plot.rounded * i) / 4)}
              x2={width - pad}
              y2={plot.y((plot.rounded * i) / 4)}
              className="grid-line"
            />
            <text
              x={pad - 9}
              y={plot.y((plot.rounded * i) / 4) + 4}
              textAnchor="end"
            >
              {Math.round((plot.rounded * i) / 4)}
            </text>
          </g>
        ))}
        {samples.map((sample, i) => (
          <g key={i}>
            {(i % Math.max(1, Math.ceil(samples.length / (expanded ? Math.max(2, Math.floor((width - pad * 2) / 60)) : 12))) === 0 ||
              i === samples.length - 1) && (
              <text x={plot.points[i].x} y={height - 8} textAnchor="middle">
                {Number(sample.second.toFixed(2))}
              </text>
            )}
            {sample.errors > 0 && (
              <text
                className="error-point"
                x={plot.points[i].x}
                y={height - pad - 5}
                textAnchor="middle"
              >
                ×
              </text>
            )}
          </g>
        ))}
        <path d={plot.raw} className="raw-line" />
        <path d={plot.wpm} className="wpm-line" />
        {samples.length === 1 && point && (
          <>
            <circle
              cx={point.x}
              cy={point.rawY}
              r={3}
              fill="var(--sub-color)"
            />
            <circle
              cx={point.x}
              cy={point.wpmY}
              r={3}
              fill="var(--main-color)"
            />
          </>
        )}
        {point && (
          <g
            className={`chart-hover ${hover.visible ? "visible" : ""}`}
            aria-hidden="true"
          >
            <line
              x1={0}
              x2={0}
              y1={pad}
              y2={height - pad}
              className="hover-line chart-marker"
              style={{ transform: `translateX(${point.x}px)` }}
            />
            <circle
              r={4}
              fill="var(--sub-color)"
              className="chart-marker"
              style={{ transform: `translate(${point.x}px, ${point.rawY}px)` }}
            />
            <circle
              r={4}
              fill="var(--main-color)"
              className="chart-marker"
              style={{ transform: `translate(${point.x}px, ${point.wpmY}px)` }}
            />
          </g>
        )}
      </svg>
      {sample && point && (
        <div
          className={`chart-tooltip ${hover.visible ? "visible" : ""}`}
          role="status"
          aria-hidden={!hover.visible}
          style={{
            left: `${(point.x / width) * 100}%`,
            transform: `translateX(-${(point.x / width) * 100}%)`,
          }}
        >
          <span>{Number(sample.second.toFixed(2))}s</span> ·{" "}
          <span className="tooltip-wpm">{Math.round(sample.wpm)} wpm</span> ·{" "}
          {Math.round(sample.raw)} raw
        </div>
      )}
    </div>
  );
}
