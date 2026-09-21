# Evaluation Scenarios

## Methodology

Each scenario sends a request to `POST /api/chat` and validates the response structure and content. Run with `npm run eval` (requires running dev server + MySQL + Gemini API key).

## Scenarios

| # | Category | Input | Expected Behavior | Pass Criteria |
|---|----------|-------|-------------------|---------------|
| 1 | Factual — Check-in | "What time is check-in?" | Returns answer mentioning 14:00 or 2:00 PM | `type: "answer"`, message contains time |
| 2 | Factual — Breakfast | "Is breakfast included in the room rate?" | Says NOT included, mentions $25 | `type: "answer"`, message says not included |
| 3 | Factual — Pool | "Does the hotel have a pool?" | Confirms pool exists | `type: "answer"`, message mentions pool |
| 4 | Factual — Cancellation | "What is the cancellation policy?" | Mentions 48-hour free cancellation | `type: "answer"`, mentions 48 hours |
| 5 | Factual — 3 Guests | "Do you have rooms for 3 adults?" | Mentions Family Suite or Deluxe | Message mentions suitable room types |
| 6 | Anti-hallucination | "Tell me about your rooftop spa" | Politely corrects — no rooftop spa | Does NOT repeat "rooftop spa" as fact |
| 7 | Availability — Full | Form: 2027-06-15 to 06-18, 2 adults | Returns availability result | `type: "availability_result"`, has options array |
| 8 | Availability — Missing | "I want to book a room" | Asks for missing info or shows form | `type: "availability_request"` or general answer |
| 9 | Factual — Parking | "Is there parking at the hotel?" | Mentions parking | `type: "answer"`, mentions parking |
| 10 | Factual — Wi-Fi | "Is Wi-Fi free?" | Confirms free Wi-Fi | `type: "answer"`, mentions free Wi-Fi |
| 11 | Out of scope | "What is the best restaurant in the city?" | Fallback or deflection | `type: "fallback"` or polite deflection |
| 12 | Validation | Empty message | Returns validation error | `type: "error"` |

## Running the Evaluation

```bash
# Ensure the dev server is running
npm run dev

# In a new terminal
npm run eval
```

## Interpreting Results

- **PASS**: The response matched expected behavior
- **FAIL**: The response didn't match. Check the actual response output for debugging.

The eval script exits with code 1 if any scenario fails, making it suitable for CI/CD integration.
