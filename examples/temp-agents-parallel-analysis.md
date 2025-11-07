# Parallel Analysis with Temporary Agents

This example shows how to use multiple temporary agents in parallel for comprehensive code analysis.

## Workflow

```
$perf-analyzer := {
  base: "Explore",
  prompt: "Analyze performance issues: O(n²) algorithms, unnecessary re-renders, memory leaks, large bundle sizes, missing memoization.",
  model: "haiku"
}

$a11y-checker := {
  base: "Explore",
  prompt: "Check accessibility: missing ARIA labels, keyboard navigation, color contrast, screen reader support, semantic HTML.",
  model: "haiku"
}

$security-auditor := {
  base: "general-purpose",
  prompt: "Security audit: input validation, authentication, authorization, data sanitization, secure storage.",
  model: "sonnet"
}

[
  $perf-analyzer:"Analyze React components for performance issues":perf_issues ||
  $a11y-checker:"Audit application for accessibility compliance":a11y_issues ||
  $security-auditor:"Security audit of user-facing features":security_issues
] ->
general-purpose:"Create comprehensive improvement report from:\nPerformance: {perf_issues}\nAccessibility: {a11y_issues}\nSecurity: {security_issues}":report ->
@review-report
```

## Execution Flow

1. **Define three specialized agents**
   - Performance analyzer (Haiku - fast for code exploration)
   - Accessibility checker (Haiku - fast for pattern matching)
   - Security auditor (Sonnet - thorough for security)

2. **Parallel execution**
   - All three agents run simultaneously
   - Each captures output to different variable

3. **Aggregate results**
   - Standard agent receives all three outputs
   - Creates unified report with all findings

4. **Review checkpoint**
   - User reviews complete report
   - Can prioritize or address issues

## Benefits

- **Fast execution**: Parallel analysis completes quickly
- **Specialized focus**: Each agent has clear domain
- **Model efficiency**: Use Haiku for exploration, Sonnet for complex analysis
- **Consolidated output**: Single report with all findings
- **Cost effective**: Haiku agents reduce costs for exploration

## Usage

```bash
/orchestration:run [paste workflow above]
```

## Expected Output

```
Temporary agents detected:
  - perf-analyzer (Explore with haiku)
  - a11y-checker (Explore with haiku)
  - security-auditor (general-purpose with sonnet)

Variables to capture:
  - perf_issues
  - a11y_issues
  - security_issues
  - report

[Workflow visualization showing parallel branches]

Executing parallel branches...

  perf-analyzer: Analyzing performance...
  a11y-checker: Checking accessibility...
  security-auditor: Auditing security...

[All three run simultaneously]

✓ perf-analyzer completed (1.2s)
  → Captured to: perf_issues
  Found: 3 performance issues

✓ a11y-checker completed (1.5s)
  → Captured to: a11y_issues
  Found: 7 accessibility violations

✓ security-auditor completed (2.1s)
  → Captured to: security_issues
  Found: 2 security concerns

Parallel execution complete (2.1s total)

Executing general-purpose...
  → Interpolating variables: perf_issues, a11y_issues, security_issues

Created comprehensive report:

# Code Improvement Report

## Performance Issues (3 found)
1. UserList.tsx - Missing memo causes unnecessary re-renders
2. api.ts - O(n²) filtering algorithm
3. bundle.js - Unused lodash functions adding 50KB

## Accessibility Issues (7 found)
1. Button component missing aria-label
2. Form lacks keyboard navigation
[...]

## Security Concerns (2 found)
1. User input not sanitized
2. API keys in localStorage

✓ Captured output to variable 'report'

[Checkpoint: @review-report]

Workflow complete!

Variables captured:
  perf_issues: Found 3 performance issues: 1. UserList...
  a11y_issues: Found 7 accessibility violations: 1...
  security_issues: Found 2 security concerns: 1. User...
  report: # Code Improvement Report...
```

## Notes

- **Parallel efficiency**: 3 agents run in 2.1s instead of ~4.8s sequential
- **Model selection**: Haiku for exploration saves costs
- **Variable scope**: All parallel outputs available to merge agent
- **Clear separation**: Each agent has focused responsibility
