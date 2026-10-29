"""Researcher agent: instructions loaded from SKILL.md, web search via Tavily MCP."""

import json
import os
from pathlib import Path

from agents import Agent, function_tool
from agents.mcp import MCPServerStreamableHttp, create_static_tool_filter
from mcp.types import CallToolResult, TextContent

from app.config import ConfigError, describe_missing_agent_vars, missing_agent_vars

SKILL_PATH = Path(__file__).resolve().parents[1] / "skills" / "researcher" / "SKILL.md"

TAVILY_MCP_URL = "https://mcp.tavily.com/mcp/"
MCP_TOOL_NAMES = ("tavily_search", "tavily_extract")
SEARCH_MAX_RESULTS = 5
SEARCH_LIMIT = 3
SEARCH_LIMIT_MESSAGE = (
    "Search limit reached. You may run at most 3 searches per task. "
    "Do not search again. Write the final summary now with the sources you already have."
)


def _read_skill_body() -> str:
    text = SKILL_PATH.read_text(encoding="utf-8").strip()
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4 :].lstrip()
    return text


# Loaded once at startup (module import), per spec.
_skill_instructions = _read_skill_body()

INSTRUCTIONS = _skill_instructions + (
    "\n## Tool names on this system"
    "\n- Search: tavily_search (Tavily MCP); web_search (direct Tavily API) only if MCP is unavailable."
    "\n- Read a page: tavily_extract (Tavily MCP)."
    "\n- Search limit: at most 3 searches per task. The tools stop you after that."
)


def validate_agent_config() -> None:
    """Raise a clear ConfigError if any required variable is missing."""
    if missing_agent_vars():
        raise ConfigError(describe_missing_agent_vars())


def _tavily_results_to_text(response: object) -> str:
    if isinstance(response, dict):
        results = response.get("results") or []
    else:
        results = getattr(response, "results", None) or []
    compact = []
    for result in results:
        if isinstance(result, dict):
            compact.append(
                {
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                }
            )
        else:
            compact.append(
                {
                    "title": getattr(result, "title", None),
                    "url": getattr(result, "url", None),
                    "content": getattr(result, "content", None),
                }
            )
    return json.dumps({"results": compact}, ensure_ascii=False)


# Fallback only (used when the Tavily MCP server cannot be reached). Built with
# its own per-run counter so the 3-search limit is enforced from inside the tool.
def build_web_search_tool() -> object:
    searches = {"count": 0}

    @function_tool
    def web_search(query: str) -> str:
        """Search the web for current, relevant sources. Returns search results as
        JSON: a list of objects with title, url and content for each result."""

        if searches["count"] >= SEARCH_LIMIT:
            return json.dumps({"error": SEARCH_LIMIT_MESSAGE})
        searches["count"] += 1

        from tavily import TavilyClient

        client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
        response = client.search(query, max_results=SEARCH_MAX_RESULTS)
        return _tavily_results_to_text(response)

    return web_search


def _build_agent(**kwargs) -> Agent:
    return Agent(
        name="Researcher",
        instructions=INSTRUCTIONS,
        model=os.environ["OPENAI_MODEL"],
        **kwargs,
    )


class SearchLimitedTavilyMCPServer(MCPServerStreamableHttp):
    """Tavily MCP server that returns a limit message after SEARCH_LIMIT searches."""

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self.searches = 0

    async def call_tool(
        self,
        tool_name: str,
        arguments: dict | None,
        meta: dict | None = None,
    ) -> CallToolResult:
        if tool_name == "tavily_search":
            if self.searches >= SEARCH_LIMIT:
                return CallToolResult(
                    content=[TextContent(type="text", text=SEARCH_LIMIT_MESSAGE)],
                    is_error=False,
                )
            self.searches += 1
        return await super().call_tool(tool_name, arguments, meta)


def build_mcp_research_agent() -> tuple[Agent, MCPServerStreamableHttp]:
    """Build the Researcher with the Tavily remote MCP server attached.

    The returned server is NOT connected; connect it with `async with server:`
    exactly once per run.
    """

    tavily_api_key = os.environ["TAVILY_API_KEY"]
    server = SearchLimitedTavilyMCPServer(
        name="tavily",
        params={
            "url": f"{TAVILY_MCP_URL}?tavilyApiKey={tavily_api_key}",
            "timeout": 15,
        },
        cache_tools_list=True,
        tool_filter=create_static_tool_filter(allowed_tool_names=list(MCP_TOOL_NAMES)),
        require_approval="never",
    )
    return _build_agent(mcp_servers=[server]), server


def build_fallback_research_agent() -> Agent:
    """Researcher with a plain function tool calling the Tavily search API."""

    return _build_agent(tools=[build_web_search_tool()])
