# Vendored preference AI modules

These files were copied from `@khabiteq/preference-shared` so this app builds as a **standalone repository** with no monorepo or `file:../packages/...` dependency.

When you change location or conversation logic here, apply the same edits to the other client app if you want behaviour to stay aligned.

## Files

| File | Purpose |
|------|---------|
| `location-intelligence.ts` | Area typo correction, smart location extraction, sanitize |
| `location-resolver.ts` | Injectable state/LGA/area dataset (wired in `utils/preference-ai-conversation.ts`) |
| `preference-ai-conversation.ts` | AI conversation field order, merges, prompts |
| `suggest-input.ts` | Wrap user text for suggest-preference API |
| `build-payload.ts` | POST /preferences/submit payload builder |
| `phone.ts`, `tts.ts`, `schema.ts` | Supporting types and helpers |
| `off-plan-options.ts` | Off-plan enums (Frontend only) |

## App wiring

- `src/utils/preference-ai-conversation.ts` — injects location resolver, re-exports public API
- `src/utils/wrapAiSuggestUserInput.ts` — suggest-input re-exports
