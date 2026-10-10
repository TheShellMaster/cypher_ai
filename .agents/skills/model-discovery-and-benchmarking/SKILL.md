---
name: model-discovery-and-benchmarking
description: >-
  Discover, validate, benchmark, and route AI models for Cypher AI via Hugging Face Inference Providers.
  Enforces real endpoint probing (/v1/models), free-tier quota verification, streaming, and tool-calling validation.
---

# Model Discovery and Benchmarking Skill

Use this skill whenever you need to discover available models on Hugging Face Inference Providers, test their function-calling / tool-use capabilities, benchmark their response times, and register them into Cypher AI's model catalog.

## Rules & Standards
1. **Never invent model IDs**: Every model configured in Cypher AI must be discovered through live HTTP API requests (e.g. Hugging Face Inference Providers `/v1/models`).
2. **Mandatory Tool Calling Verification**: Tool calling is a blocking prerequisite. Never mark a model as ready without testing an actual function call payload.
3. **Free Tier Strict Validation**: Ensure the candidate models work under the free tier without requiring paid subscriptions or credit cards.
4. **Clean Catalog for `/model`**: The model router must format identifiers cleanly so that the `/model` interactive picker displays readable, fully functional selections.

## Workflow

### 1. Discover Active Models
Query Hugging Face Inference Providers API or Hugging Face Hub:
```bash
curl -s -H "Authorization: Bearer $HF_TOKEN" \
  https://router.huggingface.co/hf-inference/v1/models
```
Filter for candidates known for tool calling (e.g., `Qwen/Qwen2.5-72B-Instruct`, `meta-llama/Llama-3.3-70B-Instruct`, `mistralai/Mistral-Small-24B-Instruct-2501`).

### 2. Validate Tool Calling and Streaming
Execute a minimal tool-calling test with a simple schema (e.g. `read_file` or `get_current_weather`):
- Verify the provider returns a proper `tool_calls` object.
- Verify streaming chunks parse cleanly.
- Verify response latency and cold start on free tier.

### 3. Generate the Routing Table
Record the findings in `config/models.json` with fallback order:
```json
{
  "models": [
    {
      "id": "Qwen/Qwen2.5-72B-Instruct",
      "provider": "hf-inference",
      "displayName": "Qwen 2.5 72B (Tool-calling)",
      "contextWindow": 32768,
      "supportsToolCalling": true,
      "freeTier": true
    }
  ],
  "fallbackOrder": ["Qwen/Qwen2.5-72B-Instruct", "meta-llama/Llama-3.3-70B-Instruct"]
}
```
