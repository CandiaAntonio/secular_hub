
import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchJson(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

describe('API Integration Tests', async () => {
    
    it('GET /api/stats returns valid aggregation', async () => {
        const data = await fetchJson('/api/stats');
        assert.ok(data.totalCalls > 0, 'Total calls should be greater than 0');
        assert.ok(data.years.length > 0, 'Should have year stats');
        assert.ok(data.institutions.length > 0, 'Should have institution stats');
    });

    it('GET /api/outlooks returns paginated results', async () => {
        const data = await fetchJson('/api/outlooks?page=1&limit=10');
        assert.ok(Array.isArray(data.data), 'Data should be an array');
        assert.strictEqual(data.data.length, 10, 'Should return 10 items');
        assert.ok(data.pagination.total > 0, 'Total count should be positive');
    });

    it('GET /api/compare returns valid delta', async () => {
        // Assuming we have data for 2025 and 2026, or let's pick two years dynamically if possible,
        // but for now hardcoding reasonably expected years.
        const stats = await fetchJson('/api/stats');
        const availableYears = stats.years.map((y: any) => y.year).sort();
        
        if (availableYears.length < 2) {
             console.warn('Skipping compare test: not enough years of data');
             return;
        }
        const year1 = availableYears[availableYears.length - 2];
        const year2 = availableYears[availableYears.length - 1];

        const data = await fetchJson(`/api/compare?year1=${year1}&year2=${year2}`);
        assert.ok(data.emergingThemes, 'Should have emerging themes');
        assert.ok(data.decliningThemes, 'Should have declining themes');
    });
});
