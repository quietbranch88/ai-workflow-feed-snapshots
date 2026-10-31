# AI Workflow Feed snapshots

This repository stores public article metadata for the AI Workflow Feed MCP. A scheduled GitHub Actions job checks out a pinned commit of the MCP repository, runs its collector, and writes the latest snapshot to this repository's `data` branch. The MCP repository is the single source of collector and reader code. No article full text or personal user data is collected.

Source pages, availability, and formats change. Each snapshot records source attribution, fetch time, errors, stale data and truncation where known. External metadata is untrusted. GitHub scheduled jobs can be delayed or fail, and the public snapshots may be incomplete.

The MCP project: https://github.com/quietbranch88/ai-workflow-feed-mcp
