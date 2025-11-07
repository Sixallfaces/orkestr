# Agent System Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement temp agents, defined agents, enhanced visualization with variable flow, and agent promotion system.

**Architecture:** Three agent types (built-in, temp, defined) all invoked via Task tool. Temp agents are ephemeral .md files in temp-agents/, defined agents are permanent .md files in agents/. Smart promotion flow after workflow execution. Enhanced ASCII visualization shows variable capture/usage.

**Tech Stack:** Node.js, JavaScript, Claude Code Task tool, Git

---

## Phase 1: Foundation

### Task 1: Create temp-agents Directory Structure

**Files:**
- Create: `temp-agents/.gitkeep`
- Modify: `.gitignore`

**Step 1: Create temp-agents directory with .gitkeep**

```bash
mkdir -p temp-agents
touch temp-agents/.gitkeep
```

**Step 2: Add temp-agents to .gitignore**

Add to `.gitignore`:
```
# Temporary agent files (ephemeral, not committed)
temp-agents/*.md
```

**Step 3: Verify .gitignore**

Run: `git status`
Expected: Only `.gitignore` and `temp-agents/.gitkeep` should appear

**Step 4: Commit**

```bash
git add .gitignore temp-agents/.gitkeep
git commit -m "feat: add temp-agents directory structure"
```

---

### Task 2: Create agents/registry.json

**Files:**
- Create: `agents/registry.json`

**Step 1: Create initial registry with existing agents**

Create `agents/registry.json`:
```json
{
  "workflow-socratic-designer": {
    "file": "workflow-socratic-designer.md",
    "description": "Guide users through Socratic questioning to refine workflow requirements",
    "created": "2025-01-08",
    "usageCount": 0
  },
  "workflow-syntax-designer": {
    "file": "workflow-syntax-designer.md",
    "description": "Design custom syntax elements with reuse-first approach",
    "created": "2025-01-08",
    "usageCount": 0
  }
}
```

**Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('agents/registry.json'))"`
Expected: No errors

**Step 3: Commit**

```bash
git add agents/registry.json
git commit -m "feat: add agent registry system"
```

---

### Task 3: Create agent-manager.js Module

**Files:**
- Create: `src/agent-manager.js`

**Step 1: Create agent-manager.js with basic functions**

Create `src/agent-manager.js`:
```javascript
const fs = require('fs');
const path = require('path');

// Built-in Claude Code agents
const BUILTIN_AGENTS = [
  'general-purpose',
  'Explore',
  'Plan',
  'code-reviewer',
  'expert-code-implementer',
  'implementation-architect',
  'code-optimizer',
  'react-native-component-reviewer',
  'jwt-keycloak-security-auditor',
  'statusline-setup'
];

/**
 * Load the agent registry from disk
 * @returns {Object} Registry object mapping agent names to metadata
 */
function loadRegistry() {
  const registryPath = path.join(__dirname, '../agents/registry.json');
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load agent registry:', error.message);
    return {};
  }
}

/**
 * Save the agent registry to disk
 * @param {Object} registry - Registry object to save
 */
function saveRegistry(registry) {
  const registryPath = path.join(__dirname, '../agents/registry.json');
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Find an agent by name and determine its source
 * @param {string} name - Agent name to find
 * @returns {Object|null} {source: 'builtin'|'defined'|'temp', path: string} or null if not found
 */
function findAgent(name) {
  // Check built-in agents
  if (BUILTIN_AGENTS.includes(name)) {
    return { source: 'builtin', path: null };
  }

  // Check defined agents
  const definedPath = path.join(__dirname, '../agents', `${name}.md`);
  if (fs.existsSync(definedPath)) {
    return { source: 'defined', path: definedPath };
  }

  // Check temp agents
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  if (fs.existsSync(tempPath)) {
    return { source: 'temp', path: tempPath };
  }

  return null;
}

/**
 * List all defined agents
 * @returns {Array<string>} Array of defined agent names
 */
function listDefinedAgents() {
  const registry = loadRegistry();
  return Object.keys(registry);
}

/**
 * List all temp agents
 * @returns {Array<string>} Array of temp agent names
 */
function listTempAgents() {
  const tempDir = path.join(__dirname, '../temp-agents');
  if (!fs.existsSync(tempDir)) {
    return [];
  }
  return fs.readdirSync(tempDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

/**
 * Check if an agent name exists (any source)
 * @param {string} name - Agent name to check
 * @returns {boolean} True if agent exists
 */
function agentExists(name) {
  return findAgent(name) !== null;
}

/**
 * Extract description from agent markdown frontmatter
 * @param {string} markdown - Agent markdown content
 * @returns {string} Description or empty string
 */
function extractDescription(markdown) {
  const match = markdown.match(/description:\s*(.+)/);
  return match ? match[1].trim() : '';
}

/**
 * Promote a temp agent to a defined agent
 * @param {string} name - Agent name to promote
 * @param {string} newName - Optional new name (defaults to original name)
 * @returns {boolean} True if successful
 */
function promoteAgent(name, newName = null) {
  const targetName = newName || name;
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  const definedPath = path.join(__dirname, '../agents', `${targetName}.md`);

  if (!fs.existsSync(tempPath)) {
    console.error(`Temp agent not found: ${name}`);
    return false;
  }

  // Move file
  fs.renameSync(tempPath, definedPath);

  // Update registry
  const registry = loadRegistry();
  const agentContent = fs.readFileSync(definedPath, 'utf8');
  const description = extractDescription(agentContent);

  registry[targetName] = {
    file: `${targetName}.md`,
    description: description,
    created: new Date().toISOString().split('T')[0],
    usageCount: 0
  };

  saveRegistry(registry);
  return true;
}

/**
 * Delete a temp agent
 * @param {string} name - Agent name to delete
 * @returns {boolean} True if successful
 */
function deleteTempAgent(name) {
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  if (!fs.existsSync(tempPath)) {
    return false;
  }
  fs.unlinkSync(tempPath);
  return true;
}

/**
 * Increment usage count for a defined agent
 * @param {string} name - Agent name
 */
function incrementUsageCount(name) {
  const registry = loadRegistry();
  if (registry[name]) {
    registry[name].usageCount = (registry[name].usageCount || 0) + 1;
    saveRegistry(registry);
  }
}

module.exports = {
  loadRegistry,
  saveRegistry,
  findAgent,
  listDefinedAgents,
  listTempAgents,
  agentExists,
  extractDescription,
  promoteAgent,
  deleteTempAgent,
  incrementUsageCount,
  BUILTIN_AGENTS
};
```

**Step 2: Verify module loads without errors**

Run: `node -e "require('./src/agent-manager.js')"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/agent-manager.js
git commit -m "feat: add agent manager module for discovery and loading"
```

---

## Phase 2: Parser Updates

### Task 4: Remove Old Temp Agent Syntax Parser

**Files:**
- Modify: `src/temp-agents-parser.js`

**Step 1: Read current temp-agents-parser.js**

Understand current implementation with `$name := {base}` syntax

**Step 2: Create backup branch**

```bash
git branch backup-old-parser
```

**Step 3: Comment out old parsing functions**

Comment out these functions in `src/temp-agents-parser.js`:
- `extractTempAgentDefinitions()`
- `parseDefinitionContent()`
- `expandTempAgentInvocations()`

Add comment at top:
```javascript
// DEPRECATED: Old $name := {base: "agent"} syntax removed
// This file will be refactored to support new temp agent system
```

**Step 4: Commit**

```bash
git add src/temp-agents-parser.js
git commit -m "refactor: deprecate old temp agent syntax parser"
```

---

### Task 5: Update Parser with Agent Resolution

**Files:**
- Modify: `src/temp-agents-parser.js` (rename to `src/agent-resolver.js`)

**Step 1: Rename file**

```bash
git mv src/temp-agents-parser.js src/agent-resolver.js
```

**Step 2: Rewrite agent-resolver.js with new logic**

Replace content with:
```javascript
const agentManager = require('./agent-manager');

/**
 * Parse agent invocation from workflow syntax
 * @param {string} agentInvocation - e.g., "code-analyzer:\"Do something\":var"
 * @returns {Object} {agentType, instruction, capturesVariable}
 */
function parseAgentInvocation(agentInvocation) {
  // Pattern: agent-name:"instruction":var or agent-name:"instruction"
  const match = agentInvocation.match(/^([a-zA-Z0-9-_]+):"([^"]+)"(?::([a-zA-Z0-9_]+))?$/);

  if (!match) {
    throw new Error(`Invalid agent invocation syntax: ${agentInvocation}`);
  }

  const [, agentType, instruction, capturesVariable] = match;

  return {
    agentType,
    instruction,
    capturesVariable: capturesVariable || null
  };
}

/**
 * Resolve agent type to its source (builtin, defined, temp)
 * @param {string} agentType - Agent name
 * @returns {Object} {source: string, path: string|null}
 * @throws {Error} If agent not found
 */
function resolveAgent(agentType) {
  const agent = agentManager.findAgent(agentType);

  if (!agent) {
    throw new Error(`Unknown agent: ${agentType}. Agent not found in built-in, defined, or temp agents.`);
  }

  return agent;
}

/**
 * Extract variables used in instruction (e.g., "Fix {bugs}" -> ["bugs"])
 * @param {string} instruction - Agent instruction
 * @returns {Array<string>} Array of variable names
 */
function extractUsedVariables(instruction) {
  const matches = instruction.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
  return Array.from(matches, m => m[1]);
}

/**
 * Interpolate variables in instruction
 * @param {string} instruction - Instruction with {var} placeholders
 * @param {Object} variables - Map of variable values
 * @returns {string} Interpolated instruction
 */
function interpolateVariables(instruction, variables) {
  return instruction.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, varName) => {
    if (!(varName in variables)) {
      throw new Error(`Variable not found: ${varName}`);
    }
    return variables[varName];
  });
}

/**
 * Enhance graph nodes with agent metadata
 * @param {Array<Object>} nodes - Graph nodes
 * @returns {Array<Object>} Enhanced nodes with agentSource and usesVariables
 */
function enhanceNodesWithAgentMetadata(nodes) {
  return nodes.map(node => {
    const agent = resolveAgent(node.agentType);
    const usesVariables = extractUsedVariables(node.instruction);

    return {
      ...node,
      agentSource: agent.source,
      agentPath: agent.path,
      usesVariables
    };
  });
}

module.exports = {
  parseAgentInvocation,
  resolveAgent,
  extractUsedVariables,
  interpolateVariables,
  enhanceNodesWithAgentMetadata
};
```

**Step 3: Verify module loads**

Run: `node -e "require('./src/agent-resolver.js')"`
Expected: No errors

**Step 4: Commit**

```bash
git add src/agent-resolver.js
git commit -m "refactor: replace temp agent parser with agent resolver"
```

---

### Task 6: Update Executor to Use Agent Resolver

**Files:**
- Modify: `src/temp-agents-executor.js`

**Step 1: Update imports in temp-agents-executor.js**

Replace:
```javascript
const tempAgentsParser = require('./temp-agents-parser');
```

With:
```javascript
const agentResolver = require('./agent-resolver');
const agentManager = require('./agent-manager');
```

**Step 2: Update interpolateVariables function**

Replace the function with:
```javascript
function interpolateVariables(instruction, variables) {
  return agentResolver.interpolateVariables(instruction, variables);
}
```

**Step 3: Update prepareNodeInstruction function**

Update to use new resolver:
```javascript
function prepareNodeInstruction(node, variables) {
  const usesVariables = agentResolver.extractUsedVariables(node.instruction);

  // Check all required variables exist
  for (const varName of usesVariables) {
    if (!(varName in variables)) {
      throw new Error(`Variable not found: ${varName}`);
    }
  }

  return agentResolver.interpolateVariables(node.instruction, variables);
}
```

**Step 4: Update node execution to increment usage count**

Add after successful agent execution:
```javascript
// Increment usage count for defined agents
if (node.agentSource === 'defined') {
  agentManager.incrementUsageCount(node.agentType);
}
```

**Step 5: Verify no syntax errors**

Run: `node -e "require('./src/temp-agents-executor.js')"`
Expected: No errors

**Step 6: Commit**

```bash
git add src/temp-agents-executor.js
git commit -m "refactor: update executor to use agent resolver"
```

---

## Phase 3: Visualizer Enhancement

### Task 7: Add Variable Flow Rendering

**Files:**
- Modify: `src/visualizer.js` (or appropriate visualizer file)

**Step 1: Add helper function for variable flow annotations**

Add to visualizer module:
```javascript
/**
 * Render variable capture annotation
 * @param {string} variableName - Variable being captured
 * @returns {string} Formatted annotation
 */
function renderCaptureAnnotation(variableName) {
  return `    ↓ [captures ${variableName}]`;
}

/**
 * Render variable usage annotation
 * @param {Array<string>} variables - Variables being used
 * @returns {string} Formatted annotation
 */
function renderUsageAnnotation(variables) {
  if (variables.length === 0) return '';

  if (variables.length <= 3) {
    return `[uses ${variables.join(', ')}] ↓`;
  } else {
    const shown = variables.slice(0, 2);
    const remaining = variables.length - 2;
    return `[uses ${shown.join(', ')}, +${remaining} more] ↓`;
  }
}
```

**Step 2: Update renderSequence function**

Modify the function to inject annotations:
```javascript
function renderSequence(nodes) {
  let output = '';

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    output += renderNode(node);

    if (i < nodes.length - 1) {
      // Show what this node captures
      if (node.capturesVariable) {
        output += '\n' + renderCaptureAnnotation(node.capturesVariable);
      }

      // Show what next node uses
      const nextNode = nodes[i + 1];
      if (nextNode.usesVariables && nextNode.usesVariables.length > 0) {
        const usageAnnotation = renderUsageAnnotation(nextNode.usesVariables);
        output += '\n' + usageAnnotation;
      } else {
        output += '\n    ↓';
      }
    }
  }

  return output;
}
```

**Step 3: Update renderParallel function**

Add variable flow after merge point:
```javascript
function renderParallel(branches, nextNode) {
  let output = renderParallelBranches(branches);

  // After merge point, show what variables are being used
  if (nextNode && nextNode.usesVariables && nextNode.usesVariables.length > 0) {
    output += '\n                   ↓';
    output += '\n         ' + renderUsageAnnotation(nextNode.usesVariables);
  }

  output += '\n' + renderNode(nextNode);

  return output;
}
```

**Step 4: Verify no syntax errors**

Run: `node -e "require('./src/visualizer.js')"`
Expected: No errors

**Step 5: Commit**

```bash
git add src/visualizer.js
git commit -m "feat: add variable flow annotations to visualizer"
```

---

## Phase 4: Natural Language Enhancement

### Task 8: Update workflow-socratic-designer for Detailed Temp Agents

**Files:**
- Modify: `agents/workflow-socratic-designer.md`

**Step 1: Add temp agent generation guidelines to designer prompt**

Add section after the Socratic questioning section:
```markdown
## Temp Agent Generation

When you identify the need for a custom agent during workflow design, you MUST create a detailed temp agent file.

### Guidelines for Creating Temp Agents

Each temp agent needs a comprehensive prompt that ensures reliable execution:

1. **Specific role definition** - Clear identity and expertise area
2. **Explicit input/output formats** - What data to expect and return
3. **Tool recommendations** - Which Claude Code tools to use (Read, Grep, Edit, Write, Bash, etc.)
4. **Quality criteria** - Standards for completeness and thoroughness
5. **Edge case handling** - Common failure modes to avoid
6. **Context awareness** - Reference the workflow's overall goal

### Temp Agent File Structure

Create temp agent files in `temp-agents/{agent-name}.md` with this structure:

```markdown
---
name: agent-name
description: One-line description of what this agent does
created: YYYY-MM-DD
---

You are a [role] specializing in [expertise area].

Your responsibilities:
1. [Specific task 1]
2. [Specific task 2]
3. [Specific task 3]

Output format:
[Describe expected output structure - JSON, markdown, plain text, etc.]

Use these tools:
- Read: [When to use]
- Grep: [When to use]
- Edit: [When to use]

[Additional detailed instructions...]
```

### Example Temp Agent

For a security scanning workflow, create `temp-agents/security-scanner.md`:

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
- Grep: Search for vulnerable patterns (e.g., grep "eval\(" to find eval usage)
- Read: Examine suspicious files in detail
- Glob: Find all files of specific types (e.g., "**/*.js")
- WebSearch: Check for CVE information on dependencies

Be thorough but focus on actionable findings. Prioritize by severity.
```

### When to Create Temp Agents

Create temp agents when:
- The workflow needs specialized expertise (security, performance, etc.)
- The task requires specific output formats
- Multiple workflows might benefit from similar agents (suggest defined agent instead)
- The agent needs to use specific tools in specific ways

Do NOT create temp agents for:
- Simple tasks that built-in agents handle well
- One-line instructions (just use general-purpose)
```

**Step 2: Add temp agent creation workflow**

Add section on how to create the files:
```markdown
## Creating Temp Agent Files

Use the Write tool to create temp agent files:

```javascript
Write({
  file_path: `/path/to/orchestration/temp-agents/${agentName}.md`,
  content: `---
name: ${agentName}
description: ${description}
created: ${new Date().toISOString().split('T')[0]}
---

${detailedPrompt}`
})
```

After creating temp agents, reference them in the workflow syntax:

```
security-scanner:"Scan the codebase":vulnerabilities ->
vulnerability-fixer:"Fix {vulnerabilities}":fixed ->
code-reviewer:"Review {fixed}":status
```
```

**Step 3: Commit**

```bash
git add agents/workflow-socratic-designer.md
git commit -m "feat: enhance workflow designer with temp agent generation"
```

---

## Phase 5: Agent Promotion Flow

### Task 9: Create Agent Promotion Module

**Files:**
- Create: `src/agent-promotion.js`

**Step 1: Create agent-promotion.js**

Create `src/agent-promotion.js`:
```javascript
const agentManager = require('./agent-manager');
const fs = require('fs');
const path = require('path');

/**
 * Analyze if a temp agent is reusable (generic vs workflow-specific)
 * @param {string} agentName - Temp agent name
 * @returns {Object} {isReusable: boolean, reason: string}
 */
function analyzeReusability(agentName) {
  const agentPath = path.join(__dirname, '../temp-agents', `${agentName}.md`);

  if (!fs.existsSync(agentPath)) {
    return { isReusable: false, reason: 'Agent not found' };
  }

  const content = fs.readFileSync(agentPath, 'utf8');

  // Indicators of workflow-specific agents
  const specificIndicators = [
    /src\/[a-zA-Z0-9\/-]+\.(js|ts|py)/,  // Specific file paths
    /line \d+/i,                          // Line numbers
    /fix.*bug.*in/i,                      // Bug fix references
    /(this project|our codebase)/i        // Project-specific language
  ];

  // Indicators of generic agents
  const genericIndicators = [
    /analyze|scan|check|review|test/i,    // Generic action verbs
    /responsibilities:/i,                  // Structured format
    /output format:/i                      // Formal output spec
  ];

  const hasSpecificIndicators = specificIndicators.some(pattern => pattern.test(content));
  const hasGenericIndicators = genericIndicators.some(pattern => pattern.test(content));

  if (hasSpecificIndicators) {
    return {
      isReusable: false,
      reason: 'Contains workflow-specific references (file paths, line numbers, or project-specific context)'
    };
  }

  if (hasGenericIndicators) {
    return {
      isReusable: true,
      reason: 'Generic capability with structured format - likely useful for other workflows'
    };
  }

  // Default: if unclear, suggest based on agent name
  const genericNamePattern = /^(analyzer|scanner|checker|reviewer|tester|fixer|validator|formatter)/i;
  if (genericNamePattern.test(agentName)) {
    return {
      isReusable: true,
      reason: 'Generic agent name suggests reusable pattern'
    };
  }

  return {
    isReusable: false,
    reason: 'Insufficient indicators of reusability'
  };
}

/**
 * Generate agent promotion suggestions
 * @param {Array<string>} tempAgentNames - Names of temp agents used
 * @returns {Array<Object>} Array of {name, isRecommended, reason}
 */
function generatePromotionSuggestions(tempAgentNames) {
  return tempAgentNames.map(name => {
    const analysis = analyzeReusability(name);
    return {
      name,
      isRecommended: analysis.isReusable,
      reason: analysis.reason
    };
  });
}

/**
 * Format promotion prompt for user
 * @param {Array<Object>} suggestions - Promotion suggestions
 * @returns {string} Formatted prompt text
 */
function formatPromotionPrompt(suggestions) {
  let prompt = 'Temp agents used in this workflow:\n\n';

  for (const suggestion of suggestions) {
    const icon = suggestion.isRecommended ? '✓ [Recommended]' : '✗ [Not recommended]';
    prompt += `${icon} ${suggestion.name}\n`;
    prompt += `  ${suggestion.reason}\n\n`;
  }

  prompt += 'Select which agents to save as permanent defined agents:';

  return prompt;
}

/**
 * Process agent promotions
 * @param {Array<string>} selectedNames - Names of agents to promote
 * @returns {Object} {promoted: Array, failed: Array}
 */
function processPromotions(selectedNames) {
  const results = {
    promoted: [],
    failed: []
  };

  for (const name of selectedNames) {
    // Check for name conflicts
    if (agentManager.agentExists(name) &&
        agentManager.findAgent(name).source === 'defined') {
      results.failed.push({
        name,
        reason: 'Agent already exists in defined agents'
      });
      continue;
    }

    // Promote agent
    const success = agentManager.promoteAgent(name);
    if (success) {
      results.promoted.push(name);
    } else {
      results.failed.push({
        name,
        reason: 'Failed to promote agent'
      });
    }
  }

  return results;
}

/**
 * Clean up unselected temp agents
 * @param {Array<string>} allTempAgents - All temp agent names
 * @param {Array<string>} selectedNames - Names of agents to keep
 */
function cleanupTempAgents(allTempAgents, selectedNames) {
  const toDelete = allTempAgents.filter(name => !selectedNames.includes(name));

  for (const name of toDelete) {
    agentManager.deleteTempAgent(name);
  }

  return toDelete;
}

module.exports = {
  analyzeReusability,
  generatePromotionSuggestions,
  formatPromotionPrompt,
  processPromotions,
  cleanupTempAgents
};
```

**Step 2: Verify module loads**

Run: `node -e "require('./src/agent-promotion.js')"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/agent-promotion.js
git commit -m "feat: add agent promotion analysis and processing"
```

---

### Task 10: Integrate Promotion Flow into Run Command

**Files:**
- Modify: `commands/run.md`

**Step 1: Add Phase 7 to run.md (after Phase 6: Completion)**

Add after Phase 6:
```markdown
## Phase 7: Agent Promotion (if temp agents used)

If the workflow used temp agents and completed successfully, offer to promote them to defined agents.

### Step 1: Detect Temp Agent Usage

Check if any nodes used temp agents:
```javascript
const tempAgentsUsed = nodes.filter(n => n.agentSource === 'temp');
if (tempAgentsUsed.length === 0) {
  // Skip promotion flow
  continue to phase 6;
}
```

### Step 2: Generate Smart Suggestions

Use agent-promotion module:
```javascript
const agentPromotion = require('../src/agent-promotion');
const tempAgentNames = tempAgentsUsed.map(n => n.agentType);
const suggestions = agentPromotion.generatePromotionSuggestions(tempAgentNames);
```

### Step 3: Present Batch Selection

Use AskUserQuestion tool:
```javascript
const options = suggestions.map(s => ({
  label: s.name,
  description: s.reason
}));

AskUserQuestion({
  questions: [{
    question: "Select which temp agents to save as permanent defined agents:",
    header: "Agent Promotion",
    multiSelect: true,
    options: options
  }]
});
```

Mark recommended agents as pre-selected in UI if possible.

### Step 4: Process Selections

```javascript
const selectedNames = // from user response
const results = agentPromotion.processPromotions(selectedNames);

// Show success message
if (results.promoted.length > 0) {
  console.log(`✓ Saved ${results.promoted.length} agents:`);
  results.promoted.forEach(name => {
    console.log(`  - ${name} → agents/${name}.md`);
  });
  console.log('These agents are now available for future workflows!');
}

// Show failures if any
if (results.failed.length > 0) {
  console.log('Failed to promote:');
  results.failed.forEach(f => {
    console.log(`  - ${f.name}: ${f.reason}`);
  });
}
```

### Step 5: Cleanup Unselected Agents

```javascript
const deleted = agentPromotion.cleanupTempAgents(tempAgentNames, selectedNames);
console.log(`Cleaned up ${deleted.length} temp agent(s)`);
```

### Edge Cases

- No temp agents: Skip this phase entirely
- All recommendations are "not recommended": Show message "No reusable agents detected. All temp agents deleted."
- User cancels: Delete all temp agents
- Name conflicts: Handle in processPromotions (offer rename or skip)
```

**Step 2: Commit**

```bash
git add commands/run.md
git commit -m "feat: add agent promotion flow to workflow execution"
```

---

## Phase 6: Integration and Testing

### Task 11: Update Example Workflows

**Files:**
- Create: `examples/agent-system-demo.flow`

**Step 1: Create demo workflow with temp agents**

Create `examples/agent-system-demo.flow`:
```yaml
---
name: agent-system-demo
description: Demo of new agent system with temp agents and variable flow
---

Workflow:

security-scanner:"Scan codebase for vulnerabilities":vulns ->
vulnerability-fixer:"Fix {vulns}":fixed ->
code-reviewer:"Review {fixed}":status

---

Note: This workflow uses temp agents that will be created by the workflow designer.
The temp agents will have detailed prompts generated automatically.
After execution, you'll be prompted to save useful agents as defined agents.
```

**Step 2: Commit**

```bash
git add examples/agent-system-demo.flow
git commit -m "docs: add agent system demo workflow"
```

---

### Task 12: Update Documentation

**Files:**
- Create: `docs/features/defined-agents.md`
- Create: `docs/features/agent-promotion.md`
- Modify: `docs/features/temporary-agents.md`

**Step 1: Create defined-agents.md**

Create `docs/features/defined-agents.md`:
```markdown
# Defined Agents

Defined agents are permanent, reusable custom agents stored in the `agents/` folder. They work exactly like Claude Code's built-in subagents but are scoped to the orchestration plugin.

## What Are Defined Agents?

Defined agents are:
- **Permanent** - Saved to disk and available across all workflows
- **Reusable** - Can be used in multiple workflows
- **Custom** - Tailored to specific tasks or domains
- **Full agents** - Complete agent definitions, not wrappers

## File Structure

Each defined agent is a `.md` file in `agents/`:

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

[... detailed instructions ...]
```

## Usage in Workflows

Use defined agents by name in workflow syntax:

```
code-analyzer:"Scan the auth module":issues ->
general-purpose:"Generate report from {issues}":report
```

## Creating Defined Agents

Two ways to create defined agents:

### 1. Promotion from Temp Agents

After a workflow executes successfully with temp agents, you'll be prompted to promote them:

```
✓ [Recommended] security-scanner
  Generic security analysis - likely useful for other workflows

Select which agents to save as permanent defined agents:
☑ security-scanner
```

### 2. Manual Creation

Create a new `.md` file in `agents/` and add to registry:

1. Create `agents/your-agent-name.md`
2. Update `agents/registry.json`
3. Use in workflows

## Registry System

The `agents/registry.json` file tracks all defined agents:

```json
{
  "code-analyzer": {
    "file": "code-analyzer.md",
    "description": "Analyzes code for bugs and issues",
    "created": "2025-01-08",
    "usageCount": 15
  }
}
```

## Best Practices

1. **Generic prompts** - Write agents for general use cases, not specific files
2. **Clear responsibilities** - Define exactly what the agent does
3. **Structured output** - Specify output format for consistency
4. **Tool guidance** - Recommend which Claude Code tools to use
5. **Good naming** - Use descriptive, generic names (e.g., "code-analyzer" not "fix-auth-bug")

## See Also

- [Temporary Agents](./temporary-agents.md) - Ephemeral agents for one-time use
- [Agent Promotion](./agent-promotion.md) - Converting temp agents to defined agents
```

**Step 2: Create agent-promotion.md**

Create `docs/features/agent-promotion.md`:
```markdown
# Agent Promotion Flow

After a workflow completes successfully using temp agents, the system offers to promote them to permanent defined agents.

## Overview

The promotion flow helps you build a library of reusable agents over time by:
1. Analyzing which temp agents are reusable
2. Providing smart recommendations
3. Allowing batch selection
4. Cleaning up unselected agents

## How It Works

### Step 1: Workflow Completion

When a workflow using temp agents completes successfully:

```
✓ Workflow completed successfully!

Execution summary:
- security-scanner: analyzed 87 files, found 12 issues
- vulnerability-fixer: fixed 10 vulnerabilities
- code-reviewer: reviewed all changes
```

### Step 2: Smart Analysis

The system analyzes each temp agent for reusability:

**Generic agents** (recommend saving):
- Describe general capabilities
- Use generic names
- No specific file paths or project references
- Structured output formats

**Workflow-specific agents** (don't recommend):
- Reference specific files or line numbers
- One-off task descriptions
- Project-specific context

### Step 3: Batch Selection

You'll see a prompt with recommendations:

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

### Step 4: Processing

Selected agents are:
1. Moved from `temp-agents/` to `agents/`
2. Added to `agents/registry.json`
3. Available for future workflows

Unselected agents are deleted.

### Step 5: Confirmation

```
✓ Saved 2 agents:
  - security-scanner → agents/security-scanner.md
  - code-reviewer → agents/code-reviewer.md

These agents are now available for future workflows!
Cleaned up 1 temp agent(s)
```

## Edge Cases

### No Temp Agents Used

If workflow only uses built-in or defined agents, promotion is skipped.

### All Workflow-Specific

```
No reusable agents detected.
All temp agents deleted.
```

### Name Conflicts

If an agent name already exists:
```
code-analyzer already exists in defined agents.
Options:
1. Rename new agent to code-analyzer-2
2. Overwrite existing agent
3. Skip this agent
```

### User Cancels

All temp agents are deleted.

## Best Practices

1. **Trust recommendations** - The AI analysis is usually accurate
2. **Don't over-save** - Only promote truly reusable agents
3. **Review before promoting** - Check the agent file if unsure
4. **Clean naming** - Rename generic if needed (e.g., "analyzer" → "security-analyzer")

## Manual Promotion

You can also manually promote agents outside the workflow:

```bash
# Move agent file
mv temp-agents/my-agent.md agents/my-agent.md

# Update registry (or use agent-manager.promoteAgent())
```

## See Also

- [Defined Agents](./defined-agents.md) - Learn about permanent agents
- [Temporary Agents](./temporary-agents.md) - Learn about temp agents
```

**Step 3: Update temporary-agents.md**

Update `docs/features/temporary-agents.md` to reflect new architecture:

Add section:
```markdown
## New Architecture (2025-01-08)

Temp agents are now full standalone agents, not wrappers:

- **Old**: `$analyzer := {base: "Explore", prompt: "..."}`
- **New**: Full `.md` files in `temp-agents/` folder

Temp agents are:
- Created automatically by workflow designer
- Full agent definitions with detailed prompts
- Ephemeral (deleted after workflow unless promoted)
- Identical to defined agents except for persistence

See [Agent Promotion](./agent-promotion.md) for converting temp to defined agents.
```

**Step 4: Commit**

```bash
git add docs/features/defined-agents.md docs/features/agent-promotion.md docs/features/temporary-agents.md
git commit -m "docs: add comprehensive agent system documentation"
```

---

## Phase 7: Testing and Verification

### Task 13: Manual Testing Protocol

**Files:**
- Create: `docs/testing/agent-system-manual-tests.md`

**Step 1: Create manual test document**

Create `docs/testing/agent-system-manual-tests.md`:
```markdown
# Agent System Manual Testing Protocol

## Test 1: Agent Discovery

**Objective**: Verify agent-manager correctly finds all agent types

**Steps**:
1. Run: `node -e "const am = require('./src/agent-manager'); console.log(am.findAgent('general-purpose'))"`
2. Expected: `{ source: 'builtin', path: null }`
3. Run: `node -e "const am = require('./src/agent-manager'); console.log(am.findAgent('workflow-socratic-designer'))"`
4. Expected: `{ source: 'defined', path: '.../agents/workflow-socratic-designer.md' }`
5. Create temp agent: `touch temp-agents/test-agent.md`
6. Run: `node -e "const am = require('./src/agent-manager'); console.log(am.findAgent('test-agent'))"`
7. Expected: `{ source: 'temp', path: '.../temp-agents/test-agent.md' }`
8. Cleanup: `rm temp-agents/test-agent.md`

**Status**: [ ] Pass [ ] Fail

---

## Test 2: Variable Flow Visualization

**Objective**: Verify visualizer shows variable capture/usage

**Steps**:
1. Create workflow: `analyzer:"Check":bugs -> fixer:"Fix {bugs}":fixed`
2. Run workflow
3. Check visualization shows:
   ```
   ○ analyzer:"Check":bugs
       ↓ [captures bugs]
   [uses bugs] ↓
   ○ fixer:"Fix {bugs}":fixed
   ```

**Status**: [ ] Pass [ ] Fail

---

## Test 3: Natural Language Workflow with Temp Agents

**Objective**: Verify workflow designer creates detailed temp agents

**Steps**:
1. Run: `/orchestration:create`
2. Describe workflow: "I want to scan code for security issues"
3. Verify designer creates `temp-agents/security-scanner.md`
4. Check file has:
   - Frontmatter with name, description, created date
   - Detailed responsibilities section
   - Output format specification
   - Tool recommendations
5. Verify generated workflow syntax uses the temp agent

**Status**: [ ] Pass [ ] Fail

---

## Test 4: Agent Promotion Flow

**Objective**: Verify promotion flow works correctly

**Steps**:
1. Create temp agent:
   ```bash
   cat > temp-agents/test-analyzer.md << 'EOF'
   ---
   name: test-analyzer
   description: Analyzes code for issues
   created: 2025-01-08
   ---

   You are a code analyzer...
   EOF
   ```
2. Run workflow using test-analyzer
3. After completion, verify promotion prompt appears
4. Verify test-analyzer is recommended (generic name/description)
5. Select test-analyzer for promotion
6. Verify file moved: `agents/test-analyzer.md` exists
7. Verify registry updated: `agents/registry.json` contains test-analyzer
8. Verify temp file deleted: `temp-agents/test-analyzer.md` does not exist

**Status**: [ ] Pass [ ] Fail

---

## Test 5: Agent Reusability Analysis

**Objective**: Verify smart analysis identifies workflow-specific vs generic agents

**Steps**:
1. Create generic temp agent (generic-analyzer):
   - Name: "code-analyzer"
   - Description: "Analyzes code for bugs"
   - No specific file paths
2. Create workflow-specific temp agent (specific-fixer):
   - Name: "fix-auth-bug-line-42"
   - Description: "Fix the auth bug in src/auth.ts line 42"
3. Run promotion analysis
4. Verify generic-analyzer is recommended
5. Verify specific-fixer is NOT recommended

**Status**: [ ] Pass [ ] Fail

---

## Test 6: Registry Usage Tracking

**Objective**: Verify usage counts increment correctly

**Steps**:
1. Check initial usage: `cat agents/registry.json | grep -A 3 workflow-socratic-designer`
2. Note usageCount value
3. Run workflow using workflow-socratic-designer
4. Check updated usage: `cat agents/registry.json | grep -A 3 workflow-socratic-designer`
5. Verify usageCount incremented by 1

**Status**: [ ] Pass [ ] Fail

---

## Test 7: Variable Interpolation

**Objective**: Verify variables are correctly interpolated in instructions

**Steps**:
1. Create workflow: `step1:"Get data":data -> step2:"Process {data}":result`
2. Set data = "test-value"
3. Verify step2 receives instruction: "Process test-value"
4. Verify no {data} placeholder remains

**Status**: [ ] Pass [ ] Fail

---

## Test 8: Agent Not Found Error

**Objective**: Verify clear error for unknown agents

**Steps**:
1. Create workflow: `nonexistent-agent:"Do something"`
2. Run workflow
3. Verify error message: "Unknown agent: nonexistent-agent. Agent not found in built-in, defined, or temp agents."

**Status**: [ ] Pass [ ] Fail

---

## Results Summary

Total tests: 8
Passed: [ ]
Failed: [ ]
```

**Step 2: Run manual tests**

Execute each test and mark results.

**Step 3: Commit test document**

```bash
git add docs/testing/agent-system-manual-tests.md
git commit -m "test: add manual testing protocol for agent system"
```

---

## Implementation Complete

After completing all tasks:

1. Run full workflow test:
   ```bash
   /orchestration:create
   # Create workflow with temp agents
   # Execute workflow
   # Verify promotion flow
   # Verify defined agents work in new workflow
   ```

2. Update main README if needed

3. Create final commit:
   ```bash
   git add .
   git commit -m "feat: complete agent system enhancement implementation"
   ```

4. Consider creating a PR or merge to main

---

## Rollback Plan

If issues arise:

```bash
# Return to backup branch
git checkout backup-old-parser

# Or revert specific commits
git log --oneline  # Find commit hashes
git revert <commit-hash>
```

---

## Success Criteria

- [ ] Temp agents folder created and gitignored
- [ ] Agent registry system working
- [ ] Agent manager discovers all agent types
- [ ] Parser resolves agents correctly
- [ ] Visualizer shows variable flow
- [ ] Workflow designer generates detailed temp agents
- [ ] Promotion flow with smart suggestions works
- [ ] Manual tests all pass
- [ ] Documentation complete
- [ ] Example workflows demonstrate features
