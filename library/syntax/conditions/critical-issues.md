---
name: if critical-issues
description: Check if exploration found critical issues requiring immediate attention
evaluation: Examine exploration output for security vulnerabilities, breaking bugs, or structural problems
---

# Critical Issues Condition

Evaluates exploration or analysis output to determine if critical issues were discovered that require immediate attention before proceeding.

## Evaluation

This condition is true when the previous exploration step identifies:

- **Security vulnerabilities**: Auth bypass, data exposure, injection risks
- **Breaking bugs**: Crashes, data corruption, system failures
- **Structural problems**: Missing required files (plugin.json), invalid configuration
- **Critical deprecations**: Use of deprecated APIs about to be removed
- **Data integrity risks**: Potential for data loss or corruption

The condition is false for:
- Minor bugs or style issues
- Enhancement opportunities
- Performance optimizations
- Documentation gaps
- Code quality improvements

## Severity Threshold

Critical issues require:
1. Immediate remediation
2. Blocking further deployment
3. High-priority resource allocation
4. Stakeholder notification

## Usage

**Route to emergency fix:**
```
@plugin-deep-explore (if critical-issues)~> emergency-fix
```

**Choose path based on severity:**
```
analyze (if critical-issues)~> halt-and-fix ||
        (if improvements-found)~> plan-enhancements
```

**Block deployment on critical findings:**
```
security-scan (if critical-issues)~>
  notify-team -> emergency-patch -> re-scan
  (if passed)~> proceed-to-deploy
```

**Conditional thoroughness:**
```
@plugin-deep-explore(quick) (if critical-issues)~>
  @plugin-deep-explore(thorough) -> detailed-report
```

## Integration

Pairs well with:
- `@plugin-deep-explore`: Main investigation action
- `(if improvements-found)`: Non-critical enhancements path
- `@security-gate`: Manual review checkpoint
- Emergency response workflows
- Notification/alerting actions

## Examples

**Tiered response workflow:**
```
@plugin-deep-explore ->
(if critical-issues)~> [notify-team || emergency-fix] -> verify ||
(if improvements-found)~> backlog -> plan-next-sprint ||
success-report
```

**Pre-release validation:**
```
[
  @plugin-deep-explore(thorough) ||
  security-scan ||
  integration-tests
] (all success)~>
  (if critical-issues)~> block-release || proceed-to-staging
```

## Notes

- Severity classification should be consistent across projects
- Consider creating severity levels: critical, high, medium, low
- May require domain expertise to properly classify issues
- Should err on side of caution: false positives better than false negatives
