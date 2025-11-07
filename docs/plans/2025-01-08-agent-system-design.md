# Agent System Enhancement Design

**Date:** 2025-01-08
**Status:** Validated Design
**Author:** Claude + User Collaboration

## Overview

This design document outlines enhancements to the orchestration plugin's agent system, introducing three key improvements:

1. **Enhanced ASCII visualization** - Show variable capture/usage flow between agents
2. **Detailed temp agent generation** - Natural language workflow creation generates comprehensive temp agents automatically
3. **Defined agents system** - Reusable custom agents saved in `agents/` folder

## Goals

- Make data flow between agents explicit and visible in ASCII visualization
- Enable workflow designer to create reliable, detailed temp agents without user intervention
- Allow users to build a library of reusable custom agents
- Maintain consistency with Claude Code's subagent architecture
- Simplify agent architecture (remove base agent wrapping concept)

## Core Concepts

### Three Types of Agents

1. **Built-in agents** - Claude Code's native subagents (`general-purpose`, `Explore`, `code-reviewer`, etc.)
2. **Temp agents** - Ephemeral custom agents created in `temp-agents/` folder, deleted after workflow unless promoted
3. **Defined agents** - Permanent custom agents saved in `agents/` folder, reusable across workflows

All three types are full standalone agents invoked via the Task tool with `subagent_type` parameter.

### Key Differences

| Feature | Built-in | Temp | Defined |
|---------|----------|------|---------|
| Location | Claude Code core | `temp-agents/` | `agents/` |
| Persistence | Permanent | Ephemeral | Permanent |
| Created by | Anthropic | Workflow designer | User/promotion |
| Reusable | Yes | No (one workflow) | Yes |
| Invocation | Task tool | Task tool | Task tool |

## Feature 1: Enhanced ASCII Visualization

### Current State
The visualizer shows nodes and connections but doesn't explicitly show variable capture/usage:
```
○ code-analyzer:"Scan for bugs":bugs
    ↓
● bug-fixer:"Fix {bugs}":fixed
```

### Enhanced State
Show data flow with explicit capture/usage annotations:
```
○ code-analyzer:"Scan for bugs":bugs
    ↓ [captures bugs]
[uses bugs] ↓
● bug-fixer:"Fix {bugs}":fixed
    ↓ [captures fixed]
[uses fixed] ↓
○ code-reviewer:"Review {fixed}":status
```

### Implementation

#### Graph Enhancement (Phase 0)
During pre-parse, track variable metadata for each node:
```javascript
{
  agentType: "code-analyzer",
  agentSource: "temp" | "defined" | "builtin",
  instruction: "Scan for bugs",
  capturesVariable: "bugs",       // NEW
  usesVariables: [],               // NEW
  status: "pending"
}
```

#### Visualizer Updates
Modify rendering functions to inject flow annotations:

**renderSequence():**
```javascript
function renderSequence(nodes) {
  let output = '';
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    output += renderNode(node);

    if (i < nodes.length - 1) {
      // Show what this node captures
      if (node.capturesVariable) {
        output += `\n    ↓ [captures ${node.capturesVariable}]`;
      }

      // Show what next node uses
      const nextNode = nodes[i + 1];
      if (nextNode.usesVariables.length > 0) {
        output += `\n[uses ${nextNode.usesVariables.join(', ')}] ↓`;
      } else {
        output += `\n    ↓`;
      }
    }
  }
  return output;
}
```

**renderParallel():**
Show variable usage after parallel branches merge:
```
                 ┌─────────────────────────┐
                 │                         │
○ security-scanner:"Check":sec             │
                 │                         │
                 │        ○ performance-analyzer:"Check":perf
                 │                         │
                 └────────────┬────────────┘
                              ↓
                    [uses sec, perf] ↓
○ report-generator:"Generate {sec} {perf}":report
```

#### Width Management
- Truncate long variable names to fit 80-character limit
- Multiple variables: `[uses var1, var2, +3 more]`
- Compact mode (>20 nodes): `↓[→bugs]` and `[bugs→]↓`

## Feature 2: Natural Language Workflow Creation with Detailed Temp Agents

### Current State
The `workflow-socratic-designer` creates workflows with standard built-in agents.

### Enhanced State
The designer automatically generates detailed temp agent definitions when needed, with comprehensive prompts that ensure reliable execution.

### Designer Intelligence

When the designer identifies the need for a custom agent:

1. **Analyze workflow context** - Understand what the agent needs to accomplish
2. **Generate comprehensive prompt** - Create detailed agent definition
3. **Write temp agent file** - Save to `temp-agents/{agent-name}.md`
4. **Reference in workflow** - Use agent name in workflow syntax

### Example Generation

**User request:** "I want to scan my codebase for security issues and fix them"

**Designer creates:** `temp-agents/security-scanner.md`

```markdown
---
name: security-scanner
description: Scans codebase for security vulnerabilities
created: 2025-01-08
---

You are a security-focused code analyzer specializing in identifying vulnerabilities in codebases.

Your responsibilities:
1. Scan all source files for common security issues (OWASP Top 10)
2. Check for: SQL injection, XSS, CSRF, authentication flaws, sensitive data exposure
3. Analyze dependencies for known CVEs
4. Review authentication and authorization implementations

Output format:
Provide a structured JSON report with:
- file: path to vulnerable file
- line: line number
- severity: critical|high|medium|low
- type: vulnerability type
- description: what the issue is
- recommendation: how to fix it

Use these tools:
- Grep: Search for vulnerable patterns
- Read: Examine suspicious files in detail
- WebSearch: Check for CVE information

Be thorough but focus on actionable findings. Prioritize by severity.
```

**Designer creates workflow:**
```
security-scanner:"Scan the codebase":vulnerabilities ->
vulnerability-fixer:"Fix {vulnerabilities}":fixed ->
code-reviewer:"Review {fixed}":status
```

### Prompt Quality Guidelines

The designer follows these principles when generating temp agent prompts:

- **Specific role definition** - Clear identity and expertise area
- **Explicit input/output formats** - What data to expect and return
- **Tool recommendations** - Which Claude Code tools to use (Read, Grep, Edit, etc.)
- **Quality criteria** - Standards for completeness and thoroughness
- **Edge case handling** - Common failure modes to avoid
- **Context awareness** - Reference the workflow's overall goal

### No User Intervention

The user never writes agent descriptions. The designer is responsible for:
- Understanding the workflow requirements through Socratic questioning
- Generating detailed, comprehensive agent prompts
- Ensuring agents have enough context to work reliably
- Creating workflow syntax that connects agents properly

## Feature 3: Defined Agents System

### Architecture

Defined agents are permanent, reusable custom subagent types stored in `agents/` folder.

### File Structure

Each defined agent is a `.md` file:

```markdown
---
name: code-analyzer
description: Analyzes code for bugs, security issues, and code smells
created: 2025-01-08
---

You are a comprehensive code analyzer specializing in identifying issues across codebases.

Your responsibilities:
1. Scan for bugs, security vulnerabilities, and performance issues
2. Identify code smells and maintainability concerns
3. Check for best practice violations
4. Analyze code complexity and suggest refactoring

Output format:
Return a structured analysis with:
- Summary: High-level findings
- Issues: Detailed list of problems found
- Recommendations: Actionable next steps

[... detailed instructions continue ...]
```

### Registry System

Track defined agents for quick lookup:

**agents/registry.json:**
```json
{
  "code-analyzer": {
    "file": "code-analyzer.md",
    "description": "Analyzes code for bugs and issues",
    "created": "2025-01-08",
    "usageCount": 15
  },
  "bug-fixer": {
    "file": "bug-fixer.md",
    "description": "Fixes identified bugs",
    "created": "2025-01-08",
    "usageCount": 12
  }
}
```

Benefits:
- Fast agent lookup without reading all `.md` files
- Usage tracking for statistics
- Agent list for autocomplete/suggestions

### Agent Discovery

**During workflow creation:**
1. Designer checks: Does `agents/{agent-name}.md` exist?
   - YES → Use defined agent in workflow
   - NO → Ask user if they want to create defined agent or use temp agent

**During workflow execution:**
1. Parser encounters `code-analyzer:"instruction":var`
2. Agent manager resolves: Is this builtin/defined/temp?
3. Executor calls: `Task(subagent_type="code-analyzer", prompt="instruction")`
4. Claude Code loads `agents/code-analyzer.md` and executes

## Feature 4: Agent Promotion Flow

### Overview

After a workflow completes successfully with temp agents, offer to promote them to permanent defined agents using batch selection with smart AI suggestions.

### Flow Sequence

#### Step 1: Workflow Completion
```
✓ Workflow completed successfully!

Execution summary:
- security-scanner: analyzed 87 files, found 12 issues
- vulnerability-fixer: fixed 10 vulnerabilities, 2 need manual review
- code-reviewer: reviewed all changes, approved
```

#### Step 2: Smart Analysis

Analyze each temp agent to determine reusability:

**Generic agents (recommend saving):**
- Prompt describes general capability
- Agent name is generic (e.g., "analyzer" not "fix-auth-bug-line-42")
- No specific file paths or project-specific references

**Workflow-specific agents (don't recommend):**
- Prompt contains specific file paths/names
- One-off task descriptions
- Project-specific context

#### Step 3: Batch Prompt with Suggestions

Use AskUserQuestion with multiSelect:

```
Temp agents used in this workflow:

✓ [Recommended] security-scanner
  Generic security analysis - likely useful for other workflows

✓ [Recommended] code-reviewer
  General code review capability - reusable pattern

✗ [Not recommended] vulnerability-fixer
  Contains workflow-specific instructions for this codebase

Select which agents to save as permanent defined agents:
☐ security-scanner (recommended)
☐ vulnerability-fixer
☐ code-reviewer (recommended)
```

#### Step 4: Process Selections

For each selected agent:

1. **Check for conflicts:**
   - If `agents/{agent-name}.md` exists, prompt: "code-reviewer already exists. Overwrite or rename?"

2. **Move file:**
   - `mv temp-agents/security-scanner.md agents/security-scanner.md`

3. **Update registry:**
   ```javascript
   registry["security-scanner"] = {
     file: "security-scanner.md",
     description: extractDescription(agentFile),
     created: new Date().toISOString().split('T')[0],
     usageCount: 0
   };
   ```

4. **Delete unselected temp agents:**
   - `rm temp-agents/vulnerability-fixer.md`

#### Step 5: Confirmation

```
✓ Saved 2 agents:
  - security-scanner → agents/security-scanner.md
  - code-reviewer → agents/code-reviewer.md

These agents are now available for future workflows!
```

### Edge Cases

- **No temp agents used**: Skip promotion flow entirely
- **All workflow-specific**: Show message "No reusable agents detected. All temp agents deleted."
- **Name conflicts**: Offer rename (append `-2`, `-3`, etc.) or overwrite options
- **User cancels**: Delete all temp agent files with bash command

## Parser and Executor Changes

### Old Temp Agent Syntax (REMOVED)

```
$analyzer := {base: "Explore", prompt: "custom instructions"}
$analyzer:"Do analysis":result
```

This syntax is removed. Temp agents are now full agents, not wrappers.

### New Agent System

All agents (built-in, temp, defined) use the same invocation syntax:

```
code-analyzer:"Scan for bugs":bugs
```

### Agent Resolution Algorithm

When parser encounters `agent-name:"instruction"`:

1. **Check built-in agents** - Is it `general-purpose`, `Explore`, `code-reviewer`, etc.?
   - YES → Use built-in agent

2. **Check defined agents** - Does `agents/{agent-name}.md` exist?
   - YES → Mark as defined agent

3. **Check temp agents** - Does `temp-agents/{agent-name}.md` exist?
   - YES → Mark as temp agent

4. **Not found** → Parser error: "Unknown agent: {agent-name}"

### Phase 0 (Pre-Parse) Simplification

**OLD logic (removed):**
- Parse `$name := {base, prompt}` definitions
- Expand `$name:"instruction"` to standard agent with enhanced prompt

**NEW logic:**
- Keep variable interpolation and capture logic
- Add agent type detection (built-in | defined | temp)
- No inline agent definitions - all agents are `.md` files

### Graph Node Structure

Each node now has:

```javascript
{
  agentType: "security-scanner",           // Agent name
  agentSource: "temp" | "defined" | "builtin",  // Where agent comes from
  instruction: "Scan for vulnerabilities", // User instruction
  capturesVariable: "vulns",               // Variable to capture (or null)
  usesVariables: ["code", "context"],      // Variables to interpolate
  status: "pending",                       // Execution status
  model: "sonnet"                          // Model override (optional)
}
```

### Executor Changes

**Agent Invocation (simplified):**

```javascript
// All agents invoked via Task tool
const result = await Task({
  subagent_type: node.agentType,         // "security-scanner", "Explore", etc.
  prompt: interpolatedInstruction,       // Variables replaced
  description: `Execute ${node.agentType}`,
  model: node.model || "sonnet"
});

// Capture output if needed
if (node.capturesVariable) {
  variables[node.capturesVariable] = result;
}
```

**Variable System (unchanged):**
- Maintains variables map
- Interpolates `{varname}` before execution
- Captures output with `:varname` syntax
- Validates variable dependencies before execution

## File Organization

```
orchestration/
├── agents/
│   ├── registry.json                     # Registry of defined agents
│   ├── workflow-socratic-designer.md     # Existing agents
│   ├── workflow-syntax-designer.md
│   ├── code-analyzer.md                  # User-created defined agents
│   └── bug-fixer.md
├── temp-agents/                          # NEW: Temporary agents folder
│   ├── security-scanner.md               # Created during workflow design
│   └── vulnerability-fixer.md            # Deleted after workflow unless promoted
├── src/
│   ├── parser.js                         # Updated agent resolution
│   ├── executor.js                       # Simplified (no base wrapping)
│   ├── agent-manager.js                  # NEW: Agent discovery/loading
│   └── visualizer.js                     # Enhanced with variable flow
├── commands/
│   ├── orchestrate.md                    # Router command
│   ├── run.md                            # Updated 6-phase execution
│   └── create.md                         # Natural language workflow creation
└── docs/
    ├── features/
    │   ├── temp-agents.md                # Updated documentation
    │   ├── defined-agents.md             # NEW: Defined agents guide
    │   └── agent-promotion.md            # NEW: Promotion flow guide
    └── plans/
        └── 2025-01-08-agent-system-design.md  # This document
```

## New Module: agent-manager.js

Handles all agent-related operations:

```javascript
// Load registry from disk
function loadRegistry() {
  const path = './agents/registry.json';
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

// Find agent by name, return {source, path} or null
function findAgent(name) {
  // Check built-in
  const builtins = ['general-purpose', 'Explore', 'code-reviewer', ...];
  if (builtins.includes(name)) {
    return { source: 'builtin', path: null };
  }

  // Check defined
  const definedPath = `./agents/${name}.md`;
  if (fs.existsSync(definedPath)) {
    return { source: 'defined', path: definedPath };
  }

  // Check temp
  const tempPath = `./temp-agents/${name}.md`;
  if (fs.existsSync(tempPath)) {
    return { source: 'temp', path: tempPath };
  }

  return null;
}

// List all defined agents
function listDefinedAgents() {
  const registry = loadRegistry();
  return Object.keys(registry);
}

// List all temp agents
function listTempAgents() {
  return fs.readdirSync('./temp-agents')
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

// Promote temp agent to defined
function promoteAgent(name) {
  const tempPath = `./temp-agents/${name}.md`;
  const definedPath = `./agents/${name}.md`;

  // Move file
  fs.renameSync(tempPath, definedPath);

  // Update registry
  const registry = loadRegistry();
  const agentContent = fs.readFileSync(definedPath, 'utf8');
  const description = extractDescription(agentContent);

  registry[name] = {
    file: `${name}.md`,
    description: description,
    created: new Date().toISOString().split('T')[0],
    usageCount: 0
  };

  fs.writeFileSync('./agents/registry.json', JSON.stringify(registry, null, 2));
}

// Check if agent name conflicts
function agentExists(name) {
  return findAgent(name) !== null;
}

// Extract description from frontmatter
function extractDescription(markdown) {
  const match = markdown.match(/description:\s*(.+)/);
  return match ? match[1].trim() : '';
}
```

## Implementation Phases

### Phase 1: Foundation
- Create `temp-agents/` folder
- Create `agent-manager.js` module
- Update agent resolution in parser
- Remove old `$name := {base}` syntax parsing

### Phase 2: Visualization Enhancement
- Update `renderSequence()` to show variable flow
- Update `renderParallel()` and `renderConditional()`
- Add variable metadata to graph nodes

### Phase 3: Natural Language Enhancement
- Update `workflow-socratic-designer.md` to generate detailed temp agents
- Add temp agent file creation logic
- Test comprehensive prompt generation

### Phase 4: Agent Promotion Flow
- Implement smart analysis of temp agents
- Add batch selection with AskUserQuestion
- Implement promotion logic (move + registry update)
- Add cleanup for unselected temp agents

### Phase 5: Testing & Documentation
- Test all three agent types in workflows
- Test promotion flow
- Update user documentation
- Create example workflows

## Success Criteria

1. **Visualization**: Users can clearly see which variables are captured and used between agents
2. **Temp agents**: Workflow designer creates detailed, reliable temp agents without user writing prompts
3. **Defined agents**: Users can build and reuse a library of custom agents
4. **Promotion**: Smart suggestions help users identify reusable agents to save
5. **Consistency**: All agent types work identically from user perspective
6. **Backward compatibility**: Existing workflows with built-in agents continue to work

## Migration Path

### For Existing Workflows

Workflows using current temp agent syntax need updating:

**OLD:**
```
$analyzer := {base: "Explore", prompt: "Find bugs"}
$analyzer:"Analyze code":bugs
```

**NEW:**
```
bug-analyzer:"Analyze code":bugs
```

Where `bug-analyzer` is either:
- A temp agent file created by the workflow designer, or
- A defined agent already in `agents/` folder

### Migration Strategy

1. Identify workflows using old `$name :=` syntax
2. Convert to new syntax by creating equivalent temp or defined agents
3. Update example workflows in documentation
4. Add deprecation notice for old syntax
5. Remove old parsing logic after migration period

## Open Questions

None - design validated by user.

## Appendix: Example Workflows

### Example 1: Security Scan and Fix

**Natural language request:** "Scan for security issues and fix them"

**Designer creates:**

`temp-agents/security-scanner.md` - Detailed security analysis agent
`temp-agents/vulnerability-fixer.md` - Detailed fixing agent
`temp-agents/security-reviewer.md` - Detailed review agent

**Workflow:**
```
security-scanner:"Scan codebase for vulnerabilities":vulns ->
vulnerability-fixer:"Fix {vulns}":fixed ->
security-reviewer:"Review {fixed} for completeness":status
```

**After success:**
User promotes `security-scanner` and `security-reviewer` to defined agents, deletes `vulnerability-fixer` (too workflow-specific).

### Example 2: Using Defined Agents

**Natural language request:** "Use code-analyzer to check the auth module"

**Designer detects:** `code-analyzer` exists in `agents/`

**Workflow:**
```
code-analyzer:"Analyze src/auth module for issues":issues ->
general-purpose:"Generate report from {issues}":report
```

No temp agents needed - reuses existing defined agent.

### Example 3: Mixed Agent Types

**Workflow combining all three types:**
```
Explore:"Find all API endpoints":endpoints ->
security-scanner:"Check {endpoints} for vulnerabilities":vulns ->
general-purpose:"Create fix plan for {vulns}":plan
```

- `Explore` - Built-in agent
- `security-scanner` - Defined agent (previously promoted)
- `general-purpose` - Built-in agent

### Example 4: Visualization

**Workflow:**
```
code-analyzer:"Scan for bugs":bugs ->
(bug-fixer:"Fix {bugs}":fixed || test-runner:"Run tests":tests) ->
code-reviewer:"Review {fixed} and {tests}":status
```

**Visualization:**
```
○ code-analyzer:"Scan for bugs":bugs
    ↓ [captures bugs]
[uses bugs] ↓
    ┌─────────────────────────────┬─────────────────────────┐
    │                             │                         │
    ● bug-fixer:"Fix {bugs}":fixed    ○ test-runner:"Run tests":tests
    │  [captures fixed]           │  [captures tests]       │
    └──────────────┬──────────────┴─────────────────────────┘
                   ↓
         [uses fixed, tests] ↓
    ○ code-reviewer:"Review {fixed} and {tests}":status
```

## Conclusion

This design maintains the orchestration plugin's core strengths while adding powerful new capabilities:

- **Temp agents** enable dynamic, workflow-specific agents without cluttering the permanent agent library
- **Defined agents** allow users to build reusable agent libraries over time
- **Smart promotion** helps users identify and save valuable agents
- **Enhanced visualization** makes data flow explicit and debuggable
- **Consistent architecture** - all agents work the same way via Task tool

The system grows naturally with user needs while keeping complexity manageable.
