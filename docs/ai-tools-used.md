# AI Tools Used

## Development

| Tool | Usage |
|------|-------|
| **Google Gemini** (`gemini-2.5-flash`) | Runtime LLM for natural language understanding, intent classification, and response generation. Called via `@google/genai` SDK. |
| **Gemini Function Calling** | Used to let the model declare tool invocations (`checkAvailability`, `findRoomsForGuests`) without executing them directly. |
| **Gemini Structured Output** | `responseMimeType: 'application/json'` with a schema to ensure parseable responses with `answer`, `usedSourceIds`, and `confident` fields. |

## AI-Assisted Development

This project was developed with AI coding assistance for:
- Code generation and architecture design
- Test case creation
- Documentation writing
- Debugging and error resolution

## Model Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Model | `gemini-2.5-flash` (configurable via `GEMINI_MODEL` env var) | Good balance of speed, cost, and capability for structured tasks |
| Temperature | 0.2 | Low temperature for factual consistency — hotel info must be reliable |
| Response format | JSON with schema | Ensures structured, parseable responses |
| Timeout | 10 seconds | Prevents hanging requests |
| Retry | 1 retry with exponential backoff on 429/5xx | Handles transient failures gracefully |

## Anti-Hallucination Techniques

1. **System prompt grounding**: "Answer ONLY from the provided knowledge base"
2. **Source tracking**: Model must cite which KB entries it used
3. **Confidence self-reporting**: Model indicates if it's confident in its answer
4. **Empty source detection**: Factual answers with no source IDs → fallback
5. **JSON validation**: Malformed model output → fallback
6. **Deterministic computation**: Prices, dates, and availability never computed by the LLM
