"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WordCloud, WordData } from "@/components/charts/word-cloud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Cloud, FileText, Calendar, TrendingUp, Building2 } from "lucide-react";

interface WordCloudResponse {
  year: number | 'all';
  wordCount: number;
  totalDocuments: number;
  uniqueInstitutions: number;
  words: WordData[];
  availableYears: number[];
}

export default function WordCloudPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [wordLimit, setWordLimit] = useState<string>("100");
  const [data, setData] = useState<WordCloudResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Fetch data when year or limit changes
  const fetchData = useCallback(async (year: string, limit: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (year !== "all") params.set("year", year);
      params.set("limit", limit);
      const query = params.toString() ? `?${params.toString()}` : "";
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
    fetchData(selectedYear, wordLimit);
  }, [selectedYear, wordLimit, fetchData]);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width - 48, 400),
          height: Math.max(Math.min(rect.width * 0.6, 600), 400),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleWordClick = (word: string) => {
    console.log("Clicked word:", word);
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
            Visualize the most frequent terms in Wall Street&apos;s consensus narratives.
            <span className="hidden sm:inline"> Word size indicates frequency.</span>
          </p>
        </div>

        {/* Year Selector */}
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[150px]">
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
        {/* Unique Words - con selector */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{data?.wordCount || 0}</div>
              )}
              <Select value={wordLimit} onValueChange={setWordLimit}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 words</SelectItem>
                  <SelectItem value="100">100 words</SelectItem>
                  <SelectItem value="150">150 words</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">distinct terms analyzed</p>
          </CardContent>
        </Card>

        {/* Outlooks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outlooks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.uniqueInstitutions || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.totalDocuments || 0} views processed
            </p>
          </CardContent>
        </Card>

        {/* Top Term */}
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

      {/* Word Cloud - sin card header, directo */}
      <Card className="relative">
        <CardContent className="flex justify-center items-center min-h-[500px] pt-6">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 20 Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {data.words.slice(0, 20).map((word) => (
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
