---
name: if improvements-found
description: Check if exploration identified non-critical enhancement opportunities
evaluation: Examine exploration output for optimization opportunities, enhancements, and quality improvements
---

# Improvements Found Condition

Evaluates exploration or analysis output to determine if actionable improvement opportunities were identified that would enhance the codebase but are not critical.

## Evaluation

This condition is true when the previous exploration step identifies:

- **Enhancement opportunities**: New features, better UX, improved workflows
- **Performance optimizations**: Faster execution, reduced memory, better caching
- **Code quality improvements**: Refactoring, better patterns, reduced complexity
- **Documentation enhancements**: Missing docs, outdated examples, unclear explanations
- **Testing gaps**: Missing test coverage, edge cases, integration tests
- **Maintainability wins**: Better structure, clearer naming, reduced duplication

The condition is false when:
- No actionable improvements identified
- Only critical issues found (use `if critical-issues` instead)
- Code is already optimal for current needs

## Priority Level

Improvements are:
1. Desirable but not blocking
2. Can be scheduled in normal sprint cycles
3. Should be prioritized and tracked
4. May provide long-term value

## Usage

**Route to planning:**
```
@plugin-deep-explore (if improvements-found)~> prioritize -> backlog
```

**Differentiate from critical issues:**
```
audit (if critical-issues)~> emergency-fix ||
      (if improvements-found)~> plan-improvements
```

**Continuous improvement cycle:**
```
@plugin-deep-explore(quick) (if improvements-found)~>
  evaluate-roi -> (if high-value)~> implement -> verify
```

**Optional enhancement path:**
```
code-review (if improvements-found)~>
  @improvement-planning -> implement ||
  (if passed)~> ship-as-is
```

## Integration

Pairs well with:
- `@plugin-deep-explore`: Main investigation action
- `(if critical-issues)`: Critical path routing
- Planning and backlog actions
- ROI evaluation workflows
- Continuous improvement cycles

## Examples

**Balanced workflow with both paths:**
```
@plugin-deep-explore ->
(if critical-issues)~> [notify || fix] -> re-check ||
(if improvements-found)~> [
  categorize-improvements ->
  evaluate-effort ->
  prioritize ->
  add-to-backlog
] ||
success-report
```

**Opportunistic improvements:**
```
regular-maintenance ->
@plugin-deep-explore(quick) (if improvements-found)~>
  (if low-effort)~> implement-now ||
  (if high-effort)~> schedule-later
```

**Quality gate with improvement tracking:**
```
pre-release-check (if critical-issues)~> block-release ||
                  (if improvements-found)~> [
                    release-now ||
                    document-technical-debt
                  ]
```

**Iterative enhancement:**
```
@plugin-deep-explore (if improvements-found)~>
  select-top-3 ->
  implement ->
  verify ->
  @plugin-deep-explore(quick) (if improvements-found)~> @try
```

## Notes

- Improvements should be actionable and specific
- Consider ROI when prioritizing improvements
- Track improvements as technical debt if not addressed
- Balance improvements with feature delivery
- Some "improvements" may be subjective - use team judgment
- Can iterate: quick check finds improvements, thorough dive provides details
