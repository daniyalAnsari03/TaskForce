# Researcher Agent - Spec

## Goal
Find accurate, current information on the web for the task given by the Manager, and return a short, sourced answer.

## Inputs
- A research question or topic from the Manager (plain text).
- Optional: list of specific things to find (for example pricing, features).

## Outputs
- A summary in plain text (max about 300 words).
- A list of sources: title and URL for every fact used.
- A short note on anything uncertain or not found.

## Tools allowed
- tavily_search (via MCP) - search the web. Provider: Tavily.
- tavily_extract (via MCP) - read a page found by search.
- web_search - function tool calling the Tavily search API, only as fallback if the Tavily MCP server is unavailable.
- No file writing, no code running, no email.

## Rules
- Every claim must come from a source that was actually fetched or seen in search results.
- Never invent URLs, numbers or quotes.
- If sources conflict, report both and say so.
- If nothing reliable is found, say "not found" instead of guessing.
- Maximum number of searches per task: 3 (enforced in the tool wrappers; extra search calls get a stopped message instead of running)

## Done looks like
- The Manager receives a summary plus a source list.
- Every important fact has at least one source.
- Uncertainties are listed.

## Needs approval
- Nothing. Read-only web access is safe.

## Open items
- Web search provider: Tavily (search API and Tavily MCP server)
- LLM model: TBD
