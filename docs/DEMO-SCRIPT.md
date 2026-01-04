# Secular Forum Demo Script

**Presenter**: [Your Name]  
**Duration**: 15 mins  
**Goal**: Demonstrate AI-enhanced investment outlook analysis.

---

## Pre-Show Prep
1. Open Chrome/Edge to full screen.
2. ensure local server is running (`npm run dev`).
3. Press `Ctrl + .` to reveal Demo Controller if hidden.
4. Verify "Live Stats" on Home Page are populated.

---

## ACT 1: The Consensus (Home) - 2 Mins
**"Good morning. Every year, we read 1,200 PDF outlooks. This year, we built a machine to read them for us."**

- **Action**: Gesture to "Quick Stats".
- **Point**: "We ingested 970 calls from 89 institutions. This isn't a sample; it's the universe."
- **Action**: Click **Snapshot** card or `Next` on Controller.

## ACT 2: What Wall Street Thinks (Snapshot) - 5 Mins
**"Here is the 2026 consensus map."**

- **Action**: Allow AI Summary to load (shows spinner, then text).
- **Read**: The first bold sentence of the narrative.
- **Action**: Interact with the **Treemap**. Click "Artificial Intelligence".
  - *Observe how the side panel updates.*
- **Point**: "AI is still #1, but 'Execution Risk' has entered the top 5."

## ACT 3: The Delta (Delta) - 5 Mins
**"The real alpha is in what changed since 2025."**

- **Action**: Click `Next` (navigates to Delta).
- **Vis**: Sankey Diagram showing flow from 2025 -> 2026.
- **Point**: "Notice the flow from 'Hard Landing' (2025) to 'Soft Landing' (2026). The recession fear has evaporated."
- **Action**: Scroll to **Institutional Pivots**.
- **Example**: "Look at JP Morgan. Last year: Bearish. This year: Cautiously Optimistic."

## ACT 4: Q&A (Explorer/AI) - 3 Mins
**"The system is live. What do you want to ask it?"**

- **Action**: Click `Next` (Explorer).
- **Demo**: Type "What is the view on Nuclear Energy?".
- **Result**: Show semantic search results.

---

## Contingency Plan
- **If AI fails**: "The AI agent is currently rate-limited, but here is the pre-cached consensus..." (The system handles this).
- **If App freezes**: Refresh page. State persists.
