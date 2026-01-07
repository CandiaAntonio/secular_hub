"use client";

import { useMemo, useState } from 'react';
import { cn } from "@/lib/utils";

interface WordData {
  text: string;
  semanticX: number;  // 0-1 from t-SNE
  tfidf: number;
}

interface PlacedWord {
  text: string;
  x: number;
  y: number;
  barHeight: number;
  fontSize: number;
  color: string;
}

// Get color based on semantic position (blue -> cyan -> magenta gradient)
function getSemanticColor(x: number): string {
  // Create a gradient from blue (left) to magenta (right)
  if (x < 0.5) {
    // Blue to cyan
    const t = x * 2;
    const r = Math.round(100 + t * 50);
    const g = Math.round(150 + t * 100);
    const b = Math.round(220 - t * 20);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Cyan to magenta
    const t = (x - 0.5) * 2;
    const r = Math.round(150 + t * 105);
    const g = Math.round(250 - t * 150);
    const b = Math.round(200 + t * 55);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Place words with collision detection
function placeWords(
  words: WordData[],
  width: number,
  height: number,
  maxTfidf: number
): PlacedWord[] {
  const padding = { left: 40, right: 40, top: 20, bottom: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Sort by TF-IDF descending
  const sortedWords = [...words].sort((a, b) => b.tfidf - a.tfidf);

  const placedWords: PlacedWord[] = [];
  const occupiedRects: { x: number; y: number; w: number; h: number }[] = [];

  // Font size scale
  const minFontSize = 8;
  const maxFontSize = Math.min(48, width / 20);

  for (const word of sortedWords) {
    // Calculate font size based on TF-IDF (use sqrt for better distribution)
    const normalizedTfidf = Math.sqrt(word.tfidf / maxTfidf);
    const fontSize = minFontSize + normalizedTfidf * (maxFontSize - minFontSize);

    // Estimate text dimensions
    const charWidth = fontSize * 0.55;
    const textWidth = word.text.length * charWidth;
    const textHeight = fontSize * 1.1;

    // X position from semantic axis
    const baseX = padding.left + word.semanticX * innerWidth;

    // Y position based on TF-IDF (higher TF-IDF = higher position = lower Y value)
    // Invert: high TF-IDF should be at top (low Y)
    const baseY = padding.top + (1 - normalizedTfidf) * innerHeight * 0.85;

    // Bar height proportional to TF-IDF
    const barHeight = normalizedTfidf * innerHeight * 0.4;

    // Collision detection - try to find a spot
    let finalX = baseX;
    let finalY = baseY;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const rect = {
        x: finalX - textWidth / 2 - 2,
        y: finalY - 2,
        w: textWidth + 4,
        h: textHeight + 4
      };

      const hasCollision = occupiedRects.some(occupied =>
        rect.x < occupied.x + occupied.w &&
        rect.x + rect.w > occupied.x &&
        rect.y < occupied.y + occupied.h &&
        rect.y + rect.h > occupied.y
      );

      if (!hasCollision) {
        break;
      }

      // Move down and slightly adjust X
      finalY += textHeight * 0.7;
      finalX += (Math.random() - 0.5) * 20;
      attempts++;
    }

    // Clamp to bounds
    finalX = Math.max(padding.left + textWidth / 2, Math.min(width - padding.right - textWidth / 2, finalX));
    finalY = Math.max(padding.top, Math.min(height - padding.bottom - textHeight, finalY));

    // Get color based on semantic position
    const color = getSemanticColor(word.semanticX);

    placedWords.push({
      text: word.text,
      x: finalX,
      y: finalY,
      barHeight,
      fontSize,
      color
    });

    // Add to occupied rects
    occupiedRects.push({
      x: finalX - textWidth / 2 - 2,
      y: finalY - 2,
      w: textWidth + 4,
      h: textHeight + 4
    });
  }

  return placedWords;
}

// Single Word Rain panel
function WordRainPanel({
  words,
  width,
  height,
  title
}: {
  words: WordData[];
  width: number;
  height: number;
  title?: string;
}) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const maxTfidf = useMemo(() => {
    return Math.max(...words.map(w => w.tfidf), 1);
  }, [words]);

  const placedWords = useMemo(() =>
    placeWords(words, width, height, maxTfidf),
    [words, width, height, maxTfidf]
  );

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="white" />

      {/* Title */}
      {title && (
        <text
          x={width / 2}
          y={24}
          textAnchor="middle"
          className="fill-foreground text-lg font-bold"
        >
          {title}
        </text>
      )}

      {/* Words with bars */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const opacity = hoveredWord && !isHovered ? 0.3 : 1;

        return (
          <g
            key={`${word.text}-${i}`}
            onMouseEnter={() => setHoveredWord(word.text)}
            onMouseLeave={() => setHoveredWord(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Vertical bar extending UPWARD from the word */}
            <line
              x1={word.x}
              x2={word.x}
              y1={word.y}
              y2={word.y - word.barHeight}
              stroke={word.color}
              strokeWidth={isHovered ? 2.5 : 1.5}
              strokeOpacity={opacity * 0.7}
            />

            {/* Small circle at top of bar */}
            <circle
              cx={word.x}
              cy={word.y - word.barHeight}
              r={isHovered ? 3 : 2}
              fill={word.color}
              fillOpacity={opacity}
            />

            {/* Word text */}
            <text
              x={word.x}
              y={word.y + word.fontSize * 0.35}
              textAnchor="middle"
              fontSize={word.fontSize}
              fontWeight={isHovered ? 700 : 400}
              fill={word.color}
              fillOpacity={opacity}
              className="select-none"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {word.text}
            </text>
          </g>
        );
      })}

      {/* Tooltip */}
      {hoveredWord && (
        <g>
          <rect
            x={width - 160}
            y={10}
            width={150}
            height={50}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={width - 85}
            y={30}
            textAnchor="middle"
            className="fill-foreground text-sm font-semibold"
          >
            {hoveredWord}
          </text>
          <text
            x={width - 85}
            y={48}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            TF-IDF: {words.find(w => w.text === hoveredWord)?.tfidf.toFixed(1)}
          </text>
        </g>
      )}
    </svg>
  );
}

// Main component
export interface TrueWordRainProps {
  words: {
    text: string;
    semanticX: number;
    avgTfidf: number;
    yearData: Record<number, { frequency: number; tfidf: number; sentiment?: number }>;
  }[];
  years: number[];
  sentimentData?: Record<string, number>;
  panelWidth?: number;
  panelHeight?: number;
  colorMode?: 'sentiment' | 'semantic';
  columns?: number;
}

export function TrueWordRain({
  words,
  years,
  panelWidth = 800,
  panelHeight = 600,
}: TrueWordRainProps) {
  // If single year, show that year's data
  // If multiple years (all), aggregate all data
  const isAllYears = years.length > 1;

  // Prepare word data
  const wordData = useMemo(() => {
    if (isAllYears) {
      // Aggregate: use average TF-IDF across all years
      return words
        .map(word => ({
          text: word.text,
          semanticX: word.semanticX,
          tfidf: word.avgTfidf
        }))
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 100); // Top 100 words for all years
    } else {
      // Single year
      const year = years[0];
      return words
        .map(word => {
          const yearInfo = word.yearData[year];
          return {
            text: word.text,
            semanticX: word.semanticX,
            tfidf: yearInfo?.tfidf || 0
          };
        })
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 80); // Top 80 words for single year
    }
  }, [words, years, isAllYears]);

  const title = isAllYears
    ? `Wall Street Narratives (${years[0]}-${years[years.length - 1]})`
    : `Wall Street Narratives ${years[0]}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-20 h-3 rounded" style={{
            background: 'linear-gradient(to right, rgb(100, 150, 220), rgb(150, 250, 200), rgb(255, 100, 255))'
          }} />
          <span>Semantic axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
          <span>Bar height = TF-IDF</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-600">A</span>
          <span className="text-sm text-slate-400">a</span>
          <span>Font size = prominence</span>
        </div>
      </div>

      {/* Word Rain Panel */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <WordRainPanel
          words={wordData}
          width={panelWidth}
          height={panelHeight}
          title={title}
        />
      </div>

      {/* Word count info */}
      <div className="text-xs text-muted-foreground">
        Showing {wordData.length} terms • Hover for details
      </div>
    </div>
  );
}
