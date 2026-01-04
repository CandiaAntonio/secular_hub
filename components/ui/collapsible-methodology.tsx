"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MethodologySection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-muted/30 border-muted-foreground/20">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between space-y-0 pb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-base font-semibold">Data Source & Methodology</CardTitle>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CardHeader>
      <CardContent>
        {isOpen ? (
          <div className="space-y-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-300">
            <p>
              This dashboard analyzes Bloomberg's annual &apos;(Almost) Everything Wall Street Expects&apos; 
              compilation — a journalism-driven synthesis of year-ahead forecasts from major 
              financial institutions.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-primary">Key characteristics:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>700+ calls per year from 60+ institutions, curated by Bloomberg News</li>
                <li>Editorial ranking by apparent conviction (not quantitative scores)</li>
                <li>Thematic categorization by editorial relevance</li>
                <li>Base cases identified by Bloomberg's editorial judgment</li>
              </ul>
            </div>

            <div className="rounded-md bg-yellow-500/10 p-3 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              <p className="font-semibold flex items-center gap-2">
                <span>⚠️</span> Conviction rankings reflect editorial interpretation.
              </p>
              <p className="mt-1">
                Source content originated as marketing material. This is not investment advice.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bloomberg Investment Outlooks methodology...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
