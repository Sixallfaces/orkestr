---
name: @plugin-deep-explore
type: action
description: Deep investigation of Claude Code plugin structure, patterns, and improvements
params: [thoroughness]
---

# Plugin Deep Explore Action

Comprehensive investigation of Claude Code plugin architecture, analyzing structure, code patterns, and identifying potential improvements.

## Behavior

This action performs a structured deep-dive into a plugin's codebase:

1. **Structure Analysis**: Examines plugin.json, directory layout, commands/, skills/, hooks/
2. **Documentation Review**: Reads and analyzes README, documentation files
3. **Code Pattern Analysis**: Identifies patterns, conventions, architectural decisions
4. **Improvement Identification**: Suggests enhancements, missing features, optimization opportunities

## Parameters

- `thoroughness`: Controls investigation depth
  - `quick`: High-level structure and main files (5-10 min)
  - `medium`: Detailed analysis with pattern recognition (15-20 min)
  - `thorough`: Exhaustive investigation including edge cases (30+ min)
  - Default: `medium`

## Expansion

The action expands to a multi-phase exploration workflow:

```
explore:"analyze plugin.json structure and metadata" ->
explore:"examine commands/ directory for command patterns" ->
explore:"review skills/ for skill definitions" ->
[
  explore:"analyze hooks/ for lifecycle integration" ||
  explore:"review README and documentation quality"
] ->
explore:"identify code patterns and architectural decisions" ->
explore:"suggest improvements and missing features"
```

For `thoroughness: quick`, the parallel branch is skipped.
For `thoroughness: thorough`, additional deep-dive analyses are added for error handling, testing patterns, and integration points.

## Usage

**Basic usage (medium thoroughness):**
```
@plugin-deep-explore -> report
```

**With thoroughness control:**
```
@plugin-deep-explore(quick) -> implement-fixes
```

**In validation workflow:**
```
@plugin-deep-explore(thorough) ->
[validate-structure || validate-docs] ->
generate-recommendations
```

**With checkpoint:**
```
@plugin-deep-explore -> @review-findings -> implement
```

## Output

The action produces a structured investigation report including:

- Plugin structure overview
- Command and skill inventory
- Identified patterns and conventions
- Areas for improvement
- Specific recommendations
- Potential issues or risks

## Integration

Works seamlessly with:
- **Built-in explore agent**: Leverages existing investigation capabilities
- **Parallel execution**: Combine with validation or testing
- **Checkpoints**: Add review gates after exploration
- **Conditional flow**: Route based on findings severity

## Examples

**Plugin audit workflow:**
```
@plugin-deep-explore(thorough) ->
(if critical-issues)~> emergency-fix ||
(if improvements-found)~> prioritize-changes ->
implement -> verify
```

**Quick check before testing:**
```
@plugin-deep-explore(quick) -> run-tests (all success)~> deploy
```

**Comprehensive improvement cycle:**
```
@plugin-deep-explore ->
@review-findings ->
[implement-structure || implement-docs || implement-tests] ->
verify -> @plugin-deep-explore(quick) -> validate-improvements
```

## Notes

- Designed specifically for Claude Code plugin analysis
- Focuses on plugin.json, commands/, skills/, hooks/ structure
- Provides actionable insights, not just descriptions
- Thoroughness affects breadth and depth, not quality
- Can be used iteratively: quick check, then thorough dive if needed
