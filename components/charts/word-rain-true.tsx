"use client";

import { useMemo, useState, useCallback } from 'react';
import { scaleLinear } from '@visx/scale';
import { cn } from "@/lib/utils";

interface WordData {
  text: string;
  semanticX: number;  // 0-1 from t-SNE
  tfidf: number;
  sentiment?: number;
}

interface WordRainPanelProps {
  words: WordData[];
  year: number;
  width: number;
  height: number;
  maxTfidf: number;
  sentimentData?: Record<string, number>;
  onWordHover?: (word: string | null) => void;
  hoveredWord?: string | null;
  colorMode: 'sentiment' | 'semantic';
}

interface PlacedWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  tfidf: number;
  color: string;
  barHeight: number;
}

// Color functions
function getSentimentColor(sentiment: number | undefined): string {
  if (sentiment === undefined) return '#64748b';
  if (sentiment > 0.3) return '#22c55e';  // green
  if (sentiment < -0.3) return '#ef4444'; // red
  return '#64748b'; // slate
}

function getSemanticColor(x: number): string {
  // Cool colormap: blue (0) -> cyan (0.5) -> magenta (1)
  const hue = 240 - (x * 180); // 240 (blue) to 60 (yellow-ish via cyan)
  return `hsl(${hue}, 70%, 45%)`;
}

// Collision detection for word placement
function placeWords(
  words: WordData[],
  width: number,
  height: number,
  maxTfidf: number,
  sentimentData?: Record<string, number>,
  colorMode: 'sentiment' | 'semantic' = 'sentiment'
): PlacedWord[] {
  const padding = 20;
  const innerWidth = width - padding * 2;
  const barAreaHeight = height * 0.35;  // Top 35% for bars
  const textAreaHeight = height * 0.65; // Bottom 65% for text
  const baseline = barAreaHeight;

  // Sort by TF-IDF descending (place most important first)
  const sortedWords = [...words].sort((a, b) => b.tfidf - a.tfidf);

  const placedWords: PlacedWord[] = [];
  const occupiedRects: { x: number; y: number; w: number; h: number }[] = [];

  // Font size scale - larger for bigger panels
  const isLargePanel = width > 500;
  const minFontSize = isLargePanel ? 12 : 10;
  const maxFontSize = isLargePanel ? 32 : 24;

  for (const word of sortedWords) {
    // Calculate font size based on TF-IDF
    const normalizedTfidf = Math.sqrt(word.tfidf / maxTfidf);
    const fontSize = minFontSize + normalizedTfidf * (maxFontSize - minFontSize);

    // Estimate text dimensions
    const charWidth = fontSize * 0.55;
    const textWidth = word.text.length * charWidth;
    const textHeight = fontSize * 1.2;

    // X position from semantic axis
    const x = padding + word.semanticX * innerWidth;

    // Start at baseline and move down (into text area) until no collision
    let y = baseline;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const rect = {
        x: x - textWidth / 2,
        y: y,
        w: textWidth,
        h: textHeight
      };

      // Check for collisions
      const hasCollision = occupiedRects.some(occupied =>
        rect.x < occupied.x + occupied.w &&
        rect.x + rect.w > occupied.x &&
        rect.y < occupied.y + occupied.h &&
        rect.y + rect.h > occupied.y
      );

      if (!hasCollision) {
        break;
      }

      // Move down
      y += textHeight * 0.8;
      attempts++;
    }

    // Clamp y to stay within text area
    y = Math.min(y, baseline + textAreaHeight - textHeight);

    // Get color
    const sentiment = sentimentData?.[word.text];
    const color = colorMode === 'sentiment'
      ? getSentimentColor(sentiment)
      : getSemanticColor(word.semanticX);

    // Bar height proportional to TF-IDF
    const barHeight = (word.tfidf / maxTfidf) * barAreaHeight * 0.9;

    placedWords.push({
      text: word.text,
      x,
      y,
      width: textWidth,
      height: textHeight,
      fontSize,
      tfidf: word.tfidf,
      color,
      barHeight
    });

    // Add to occupied rects
    occupiedRects.push({
      x: x - textWidth / 2 - 2,
      y: y - 2,
      w: textWidth + 4,
      h: textHeight + 4
    });
  }

  return placedWords;
}

// Single year panel component
function WordRainPanel({
  words,
  year,
  width,
  height,
  maxTfidf,
  sentimentData,
  onWordHover,
  hoveredWord,
  colorMode
}: WordRainPanelProps) {
  const placedWords = useMemo(() =>
    placeWords(words, width, height, maxTfidf, sentimentData, colorMode),
    [words, width, height, maxTfidf, sentimentData, colorMode]
  );

  const barAreaHeight = height * 0.4;
  const baseline = barAreaHeight;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Year label */}
      <text
        x={width / 2}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-sm font-bold"
      >
        {year}
      </text>

      {/* Baseline */}
      <line
        x1={10}
        x2={width - 10}
        y1={baseline}
        y2={baseline}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
      />

      {/* Words with bars */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const opacity = hoveredWord && !isHovered ? 0.2 : 1;

        return (
          <g
            key={`${word.text}-${i}`}
            onMouseEnter={() => onWordHover?.(word.text)}
            onMouseLeave={() => onWordHover?.(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Upward bar (from baseline up) */}
            <line
              x1={word.x}
              x2={word.x}
              y1={baseline}
              y2={baseline - word.barHeight}
              stroke={word.color}
              strokeWidth={isHovered ? 3 : 2}
              strokeOpacity={opacity * 0.8}
            />

            {/* Bar cap (small circle at top) */}
            <circle
              cx={word.x}
              cy={baseline - word.barHeight}
              r={isHovered ? 4 : 3}
              fill={word.color}
              fillOpacity={opacity}
            />

            {/* Downward connection line (from baseline to word) */}
            <line
              x1={word.x}
              x2={word.x}
              y1={baseline}
              y2={word.y}
              stroke={word.color}
              strokeWidth={1}
              strokeOpacity={opacity * 0.4}
              strokeDasharray="2,2"
            />

            {/* Word text */}
            <text
              x={word.x}
              y={word.y + word.fontSize * 0.8}
              textAnchor="middle"
              fontSize={word.fontSize}
              fontWeight={isHovered ? 700 : 500}
              fill={word.color}
              fillOpacity={opacity}
              className="select-none transition-all duration-150"
            >
              {word.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Main component with multiple year panels
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
  sentimentData,
  panelWidth = 280,
  panelHeight = 350,
  colorMode = 'sentiment',
  columns = 4
}: TrueWordRainProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  // Calculate max TF-IDF across all years for consistent scaling
  const maxTfidf = useMemo(() => {
    let max = 0;
    words.forEach(word => {
      Object.values(word.yearData).forEach(data => {
        if (data.tfidf > max) max = data.tfidf;
      });
    });
    return max || 1;
  }, [words]);

  // Prepare words for each year
  const yearWordData = useMemo(() => {
    const result: Record<number, WordData[]> = {};
    // Show more words for larger panels (single year view)
    const isLargePanel = panelWidth > 500;
    const maxWordsPerYear = isLargePanel ? 60 : 40;

    years.forEach(year => {
      const yearWords: WordData[] = [];

      words.forEach(word => {
        const data = word.yearData[year];
        if (data && data.tfidf > 0) {
          yearWords.push({
            text: word.text,
            semanticX: word.semanticX,
            tfidf: data.tfidf,
            sentiment: sentimentData?.[word.text]
          });
        }
      });

      // Sort by TF-IDF and take top words
      result[year] = yearWords
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, maxWordsPerYear);
    });

    return result;
  }, [words, years, sentimentData, panelWidth]);

  const handleWordHover = useCallback((word: string | null) => {
    setHoveredWord(word);
  }, []);

  // Calculate grid layout
  const rows = Math.ceil(years.length / columns);
  const totalWidth = columns * panelWidth;
  const totalHeight = rows * panelHeight;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Semantic Axis:</span> Similar terms cluster together horizontally
        </div>
        <div className="flex items-center gap-4 text-xs">
          {colorMode === 'sentiment' ? (
            <>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Bullish
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-500"></span> Neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Bearish
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Color = Semantic position</span>
          )}
          <span className="border-l pl-4 ml-2">
            <span className="font-medium">Bar height</span> = TF-IDF score
          </span>
        </div>
      </div>

      {/* Grid of year panels */}
      <div
        className={cn(
          "bg-muted/30 p-4 rounded-lg overflow-x-auto",
          years.length === 1 ? "flex justify-center" : "grid gap-2"
        )}
        style={years.length > 1 ? {
          gridTemplateColumns: `repeat(${columns}, ${panelWidth}px)`,
          maxWidth: '100%'
        } : undefined}
      >
        {years.map(year => (
          <div
            key={year}
            className="bg-background rounded-md border shadow-sm"
          >
            <WordRainPanel
              words={yearWordData[year] || []}
              year={year}
              width={panelWidth}
              height={panelHeight}
              maxTfidf={maxTfidf}
              sentimentData={sentimentData}
              onWordHover={handleWordHover}
              hoveredWord={hoveredWord}
              colorMode={colorMode}
            />
          </div>
        ))}
      </div>

      {/* Hovered word info */}
      {hoveredWord && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-6 py-3 rounded-lg shadow-lg border z-50">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-lg">{hoveredWord}</span>
            <div className="flex gap-4 text-sm">
              {years.map(year => {
                const word = words.find(w => w.text === hoveredWord);
                const data = word?.yearData[year];
                if (!data || data.tfidf <= 0) return null;

                return (
                  <span key={year} className="text-muted-foreground">
                    <span className="font-medium text-foreground">{year}:</span> {data.tfidf.toFixed(0)}
                  </span>
                );
              })}
            </div>
            {sentimentData && sentimentData[hoveredWord] !== undefined && (
              <span className={cn(
                "text-sm font-medium px-2 py-0.5 rounded",
                sentimentData[hoveredWord] > 0.3 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                sentimentData[hoveredWord] < -0.3 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                Math.abs(sentimentData[hoveredWord]) <= 0.3 && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {sentimentData[hoveredWord] > 0.3 ? 'Bullish' :
                  sentimentData[hoveredWord] < -0.3 ? 'Bearish' : 'Neutral'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
