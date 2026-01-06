import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

// Common English stopwords to exclude
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'also', 'into', 'over',
  'after', 'before', 'above', 'below', 'between', 'through', 'during', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'any', 'while', 'about',
  'against', 'up', 'down', 'out', 'off', 'if', 'because', 'until', 'although',
  'however', 'therefore', 'thus', 'hence', 'yet', 'still', 'already', 'even',
  'though', 'whether', 'since', 'unless', 'despite', 'rather', 'quite', 'per',
  'their', 'them', 'his', 'her', 'him', 'your', 'our', 'my', 'me', 'us', 'being',
  'having', 'doing', 'going', 'coming', 'getting', 'making', 'taking', 'seeing',
  'think', 'see', 'get', 'make', 'take', 'come', 'go', 'know', 'say', 'said',
  've', 'll', 're', 'd', 'm', 'o', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn',
  'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn',
  'wasn', 'weren', 'won', 'wouldn', 'well', 'one', 'two', 'like', 'much', 'many',
  'way', 'back', 'first', 'last', 'long', 'new', 'old', 'high', 'low', 'good',
  'bad', 'best', 'worst', 'next', 'part', 'likely', 'given', 'across', 'around'
]);

// Minimum word length to include
const MIN_WORD_LENGTH = 3;

// Maximum number of words to return
const MAX_WORDS = 150;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');

  // Parse year filter
  const year = yearParam ? parseInt(yearParam, 10) : null;

  // Build query filter
  const where = year ? { year } : {};

  // Fetch all callText for the specified year(s)
  const calls = await prisma.outlookCall.findMany({
    where,
    select: { callText: true },
  });

  // Count word frequencies
  const wordCounts = new Map<string, number>();

  calls.forEach(call => {
    if (!call.callText) return;

    // Tokenize: lowercase, remove punctuation, split by whitespace
    const words = call.callText
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word =>
        word.length >= MIN_WORD_LENGTH &&
        !STOPWORDS.has(word) &&
        !/^\d+$/.test(word) // Exclude pure numbers
      );

    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });

  // Sort by frequency and take top N
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_WORDS)
    .map(([text, value]) => ({ text, value }));

  // Get available years for the selector
  const yearsRaw = await prisma.outlookCall.groupBy({
    by: ['year'],
    orderBy: { year: 'desc' },
  });

  const availableYears = yearsRaw.map(y => y.year);

  return NextResponse.json({
    year: year || 'all',
    wordCount: sortedWords.length,
    totalDocuments: calls.length,
    words: sortedWords,
    availableYears,
  });
}
