import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Cache for sentiment results to avoid repeated API calls
const sentimentCache = new Map<string, SentimentResult>();

interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  normalizedScore: number; // -1 to 1 scale
}

interface FinBERTOutput {
  label: string;
  score: number;
}

// Convert FinBERT output to normalized score
function normalizeScore(output: FinBERTOutput[]): SentimentResult {
  // FinBERT returns array of {label, score} sorted by confidence
  const result = output[0];

  let normalizedScore = 0;
  if (result.label === 'positive') {
    normalizedScore = result.score; // 0 to 1
  } else if (result.label === 'negative') {
    normalizedScore = -result.score; // -1 to 0
  } else {
    normalizedScore = 0; // neutral
  }

  return {
    label: result.label as 'positive' | 'negative' | 'neutral',
    score: result.score,
    normalizedScore,
  };
}

// Analyze sentiment for a single term/phrase
async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Check cache first
  const cached = sentimentCache.get(text.toLowerCase());
  if (cached) {
    return cached;
  }

  try {
    // Create a financial context for the term
    const contextualText = `The market outlook for ${text} is`;

    const result = await hf.textClassification({
      model: 'ProsusAI/finbert',
      inputs: contextualText,
    });

    const sentiment = normalizeScore(result as FinBERTOutput[]);

    // Cache the result
    sentimentCache.set(text.toLowerCase(), sentiment);

    return sentiment;
  } catch (error) {
    console.error(`Error analyzing sentiment for "${text}":`, error);
    // Return neutral on error
    return {
      label: 'neutral',
      score: 0.5,
      normalizedScore: 0,
    };
  }
}

// Batch analyze multiple terms
async function batchAnalyzeSentiment(terms: string[]): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  const delayBetweenBatches = 100; // ms

  for (let i = 0; i < terms.length; i += batchSize) {
    const batch = terms.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (term) => {
        const sentiment = await analyzeSentiment(term);
        return { term, sentiment };
      })
    );

    batchResults.forEach(({ term, sentiment }) => {
      results.set(term, sentiment);
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < terms.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { terms } = body as { terms: string[] };

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: terms array required' },
        { status: 400 }
      );
    }

    // Limit to 150 terms max
    const limitedTerms = terms.slice(0, 150);

    const sentimentResults = await batchAnalyzeSentiment(limitedTerms);

    // Convert Map to object for JSON response
    const results: Record<string, SentimentResult> = {};
    sentimentResults.forEach((value, key) => {
      results[key] = value;
    });

    return NextResponse.json({
      results,
      analyzed: limitedTerms.length,
      cached: Array.from(sentimentCache.keys()).length,
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

// GET endpoint to check a single term
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return NextResponse.json(
      { error: 'term parameter required' },
      { status: 400 }
    );
  }

  const sentiment = await analyzeSentiment(term);

  return NextResponse.json({
    term,
    sentiment,
  });
}
