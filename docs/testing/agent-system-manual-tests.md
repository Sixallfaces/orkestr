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
