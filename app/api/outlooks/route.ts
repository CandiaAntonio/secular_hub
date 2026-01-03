import { NextRequest, NextResponse } from 'next/server';
import { getOutlooks } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const institution = searchParams.get('institution') || undefined;
    const theme = searchParams.get('theme') || undefined;
    const themeCategory = searchParams.get('theme_category') || undefined;
    const conviction = searchParams.get('conviction') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const search = searchParams.get('search') || undefined;

    const result = await getOutlooks({
      year,
      institution,
      theme,
      themeCategory,
      conviction,
      limit,
      page,
      search,
    });

    return NextResponse.json({
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      filters_applied: { year, institution, theme, themeCategory, conviction, search },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
