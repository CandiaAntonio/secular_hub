"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WordCloud, WordData } from "@/components/charts/word-cloud";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Cloud, FileText, Calendar, TrendingUp } from "lucide-react";

interface WordCloudResponse {
  year: number | 'all';
  wordCount: number;
  totalDocuments: number;
  words: WordData[];
  availableYears: number[];
}

export default function WordCloudPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [data, setData] = useState<WordCloudResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Fetch data when year changes
  const fetchData = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = year === "all" ? "" : `?year=${year}`;
      const res = await fetch(`/api/stats/wordcloud${query}`);
      if (!res.ok) throw new Error("Failed to fetch word cloud data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width - 48, 400), // padding offset
          height: Math.max(Math.min(rect.width * 0.6, 600), 400),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleWordClick = (word: string) => {
    // Could navigate to explorer with this word as search
    console.log("Clicked word:", word);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            Word Cloud Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize the most frequent terms in Wall Street&apos;s consensus narratives
          </p>
        </div>

        {/* Year Selector */}
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {data?.availableYears?.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.wordCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">distinct terms analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.totalDocuments || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">outlook calls processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Term</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold capitalize">
                {data?.words?.[0]?.text || "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.words?.[0]?.value || 0} mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Consensus Vocabulary
            {selectedYear !== "all" && (
              <Badge variant="secondary">{selectedYear}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Word size indicates frequency. Click a word to explore related calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-[400px] w-full max-w-[700px] rounded-lg" />
              <p className="text-sm text-muted-foreground">Generating word cloud...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : data?.words && data.words.length > 0 ? (
            <WordCloud
              words={data.words}
              width={dimensions.width}
              height={dimensions.height}
              onWordClick={handleWordClick}
            />
          ) : (
            <p className="text-muted-foreground">No data available for this year</p>
          )}
        </CardContent>
      </Card>

      {/* Top Words Table */}
      {!loading && data?.words && data.words.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Terms</CardTitle>
            <CardDescription>
              Most frequent words in {selectedYear === "all" ? "all years" : selectedYear} outlook calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {data.words.slice(0, 20).map((word, i) => (
                <div
                  key={word.text}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleWordClick(word.text)}
                >
                  <span className="font-medium capitalize truncate">{word.text}</span>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {word.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
