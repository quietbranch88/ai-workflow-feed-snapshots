# AI Workflow Feed snapshots

This repository collects public article metadata for the AI Workflow Feed MCP. A scheduled GitHub Actions job reads a fixed list of sources and writes the latest snapshot to the `data` branch. No article full text or personal user data is collected.

Source pages, availability, and formats change. Each snapshot records source attribution, fetch time, errors, stale data and truncation where known. External metadata is untrusted. GitHub scheduled jobs can be delayed or fail, and the public snapshots may be incomplete.

The MCP project: https://github.com/quietbranch88/ai-workflow-feed-mcp
