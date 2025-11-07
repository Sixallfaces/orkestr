---
description: Multi-agent workflow orchestration with visual feedback
---

# Workflow Orchestration System Router

You are the Workflow Orchestrator for Claude Code. This command routes to specialized subcommands based on the mode.

## Quick Start

```
/orchestration:orchestrate                    Interactive menu
/orchestration:orchestrate help               Quick reference
/orchestration:orchestrate explain [topic]    Detailed docs
/orchestration:orchestrate examples           Gallery
/orchestration:orchestrate <template-name>    Execute template
/orchestration:orchestrate <workflow-syntax>  Execute inline workflow
```

## Arguments: {{ARGS}}

## Mode Detection

Analyze {{ARGS}} to determine the mode and route accordingly:

1. **Empty or Menu** → Route to `/orchestration:menu`
   - No arguments provided
   - User explicitly requested menu

2. **Help Mode** → Route to `/orchestration:help`
   - Arguments are "help"

3. **Documentation Mode** → Route to `/orchestration:explain [topic]`
   - Arguments start with "explain"
   - Pass topic if specified

4. **Examples Mode** → Route to `/orchestration:examples`
   - Arguments are "examples"

5. **Template Mode** → Route to `/orchestration:template <name>`
   - Template file exists at `~/.claude/plugins/repos/orchestration/examples/{{ARGS}}.flow`
   - Check with: Glob `~/.claude/plugins/repos/orchestration/examples/{{ARGS}}.flow`

6. **Inline Mode** → Route to `/orchestration:run <syntax>`
   - Arguments contain workflow syntax (operators like `->`, `||`, `~>`, `@`, `[]`)
   - This is the default if no other mode matches

## Routing Logic

```javascript
// Pseudocode for routing
const args = {{ARGS}}.trim();

if (!args || args === 'menu') {
  execute('/orchestration:menu');
}
else if (args === 'help') {
  execute('/orchestration:help');
}
else if (args.startsWith('explain')) {
  const topic = args.replace('explain', '').trim();
  execute(`/orchestration:explain ${topic}`);
}
else if (args === 'examples') {
  execute('/orchestration:examples');
}
else if (templateExists(`~/.claude/plugins/repos/orchestration/examples/${args}.flow`)) {
  execute(`/orchestration:template ${args}`);
}
else {
  // Contains workflow syntax
  execute(`/orchestration:run ${args}`);
}
```

## Implementation

1. Parse {{ARGS}}
2. Detect mode using logic above
3. Execute appropriate subcommand with SlashCommand tool
4. Let subcommand handle all logic

## Subcommand Overview

- **orchestration:menu** - Interactive menu system
- **orchestration:help** - Quick reference guide
- **orchestration:explain** - Topic documentation
- **orchestration:examples** - Examples gallery
- **orchestration:template** - Template execution with parameters
- **orchestration:run** - Parse and execute workflow syntax

---

## Execute Router

**Detected mode:** [Analyze {{ARGS}} and state mode, then route to appropriate subcommand]
