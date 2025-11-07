# Sprint Planning Template

**Copy this template for each sprint and fill in the details.**

---

## Sprint Information

**Sprint Number:** [N]
**Priority:** [P1/P2/P3/P4/P5]
**Sprint Name:** [Priority Name - Focus Area]
**Start Date:** YYYY-MM-DD
**End Date:** YYYY-MM-DD
**Duration:** [N] weeks

---

## Sprint Goal

[One sentence describing what this sprint aims to achieve]

**Example:** "Implement centralized PathResolver module and migrate all path resolution call sites"

---

## Team

| Role | Name | Availability | Responsibilities |
|------|------|--------------|------------------|
| Developer | [Name] | [100%/80%/etc] | Implementation, testing |
| Tech Lead | [Name] | [20%] | Reviews, architecture, unblocking |
| QA Lead | [Name] | [30%] | Test strategy, validation |
| Tech Writer | [Name] | [40%] | Documentation |
| Product Owner | [Name] | [10%] | Priorities, feedback |

---

## Sprint Backlog

### Must-Have (P0)

| Task ID | Task Description | Owner | Estimate | Status | Dependencies |
|---------|-----------------|-------|----------|--------|--------------|
| T-001 | [Task description] | [Name] | [2d] | Not Started | None |
| T-002 | [Task description] | [Name] | [1d] | Not Started | T-001 |

### Should-Have (P1)

| Task ID | Task Description | Owner | Estimate | Status | Dependencies |
|---------|-----------------|-------|----------|--------|--------------|
| T-003 | [Task description] | [Name] | [1d] | Not Started | None |

### Nice-to-Have (P2)

| Task ID | Task Description | Owner | Estimate | Status | Dependencies |
|---------|-----------------|-------|----------|--------|--------------|
| T-004 | [Task description] | [Name] | [0.5d] | Not Started | None |

**Total Estimated Effort:** [X]d
**Team Capacity:** [Y]d
**Buffer:** [Y-X]d ([Z]%)

---

## Sprint Schedule

### Week Structure

**Monday:**
- Sprint planning meeting (1h)
- Sprint kickoff
- Daily work begins

**Tuesday-Thursday:**
- Daily stand-up (15 min) - if needed
- Focus on development
- Code reviews as work completes

**Friday:**
- Testing and validation
- Code review wrap-up
- Sprint retrospective (30 min)
- Demo to stakeholders (if milestone)

### Daily Stand-up Questions (If Applicable)

1. What did I complete yesterday?
2. What will I work on today?
3. Are there any blockers or risks?

---

## Definition of Done

**For each task to be considered complete:**

- [ ] Implementation complete and follows coding standards
- [ ] Self-review performed
- [ ] Unit tests written and passing (≥80% coverage for new code)
- [ ] Integration tests written (if applicable)
- [ ] Code reviewed and approved by Tech Lead
- [ ] Documentation updated (inline comments + docs)
- [ ] No linter errors or warnings
- [ ] Manual testing performed and passed
- [ ] Acceptance criteria met
- [ ] Changes committed with clear commit messages

**For sprint to be considered complete:**

- [ ] All P0 (Must-Have) tasks complete
- [ ] At least 80% of P1 (Should-Have) tasks complete
- [ ] All tests passing in CI/CD
- [ ] Documentation reviewed and approved
- [ ] Sprint goal achieved
- [ ] Demo prepared (if applicable)
- [ ] Retrospective completed
- [ ] Metrics recorded

---

## Acceptance Criteria

**Overall Sprint Success Criteria:**

1. [Criterion 1 - specific and measurable]
2. [Criterion 2 - specific and measurable]
3. [Criterion 3 - specific and measurable]

**Example for P1 Sprint 1:**
1. PathResolver API specification complete and approved
2. Search order documented for all resource types
3. Architecture diagram created and reviewed

---

## Key Deliverables

| Deliverable | Description | Owner | Due Date | Status |
|-------------|-------------|-------|----------|--------|
| [Deliverable 1] | [Brief description] | [Name] | [Date] | Not Started |
| [Deliverable 2] | [Brief description] | [Name] | [Date] | Not Started |

---

## Risks & Mitigation

### Identified Risks

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-----------------|-------------|--------|---------------------|-------|
| SR-001 | [Risk description] | H/M/L | H/M/L | [Mitigation approach] | [Name] |
| SR-002 | [Risk description] | H/M/L | H/M/L | [Mitigation approach] | [Name] |

### Dependencies

**Upstream Dependencies (Blocking this sprint):**
- [Dependency 1] - Status: [Complete/In Progress/Blocked]
- [Dependency 2] - Status: [Complete/In Progress/Blocked]

**Downstream Dependencies (This sprint blocks):**
- [Dependency 1] - Impacts: [Team/Sprint]
- [Dependency 2] - Impacts: [Team/Sprint]

---

## Success Metrics

### Quantitative Metrics

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| [Metric 1] | [Value] | [Value] | - | 🔄 |
| [Metric 2] | [Value] | [Value] | - | 🔄 |
| [Metric 3] | [Value] | [Value] | - | 🔄 |

### Qualitative Goals

- [Goal 1]
- [Goal 2]
- [Goal 3]

---

## Technical Decisions

**Decisions to be made during this sprint:**

| Decision | Options | Recommendation | Made By | Status |
|----------|---------|----------------|---------|--------|
| [Decision 1] | [Option A/B/C] | [Recommendation] | [Role] | Pending |
| [Decision 2] | [Option A/B/C] | [Recommendation] | [Role] | Pending |

**Document all decisions in [Decision Log](./decision-log.md)**

---

## Testing Strategy

### Unit Tests
- [Component 1]: [Number] tests covering [functionality]
- [Component 2]: [Number] tests covering [functionality]

### Integration Tests
- [Integration point 1]: [Number] tests
- [Integration point 2]: [Number] tests

### Manual Testing Scenarios
1. [Scenario 1]: [Expected outcome]
2. [Scenario 2]: [Expected outcome]

**Test Coverage Target:** [X]% for new code

---

## Documentation

### Documentation Updates Required

| Document | Changes Needed | Owner | Status |
|----------|----------------|-------|--------|
| [Doc 1] | [Brief description] | [Name] | Not Started |
| [Doc 2] | [Brief description] | [Name] | Not Started |

### New Documentation

| Document | Purpose | Owner | Status |
|----------|---------|-------|--------|
| [Doc 1] | [Brief description] | [Name] | Not Started |

---

## Communication Plan

### Status Updates

**Daily:** (If needed)
- Stand-up summary posted to [channel]

**Weekly:**
- Status update to [channel/stakeholders]
- Template: [See Quick Ref](./IMPROVEMENT-PLAN-QUICK-REF.md#communication-templates)

**End of Sprint:**
- Sprint review/demo to stakeholders
- Sprint retrospective with team
- Metrics review and documentation

### Stakeholder Communication

**Kick-off Message:**
```
Starting Sprint [N]: [Priority] - [Focus]
Goal: [One sentence goal]
Duration: [Dates]
Expected outcomes: [Brief list]
```

**End-of-Sprint Message:**
```
Sprint [N] Complete: [Priority] - [Focus]
Completed: [Key achievements]
Metrics: [Key metrics with targets]
Next Sprint: [Brief preview]
```

---

## Sprint Retrospective

**To be filled out at end of sprint**

### What Went Well

- [Thing 1]
- [Thing 2]
- [Thing 3]

### What Could Be Improved

- [Thing 1]
- [Thing 2]
- [Thing 3]

### Action Items for Next Sprint

- [ ] [Action 1] - Owner: [Name]
- [ ] [Action 2] - Owner: [Name]
- [ ] [Action 3] - Owner: [Name]

### Key Learnings

[Document any key learnings or insights from this sprint]

### Metrics Review

| Metric | Target | Actual | Variance | Analysis |
|--------|--------|--------|----------|----------|
| [Metric 1] | [Value] | [Value] | +/-[%] | [Explanation] |
| [Metric 2] | [Value] | [Value] | +/-[%] | [Explanation] |

---

## Notes & References

### Related Documents
- [Full Implementation Plan](./IMPROVEMENT-IMPLEMENTATION-PLAN.md)
- [Quick Reference](./IMPROVEMENT-PLAN-QUICK-REF.md)
- [Technical Debt Documentation](../../TECHNICAL-DEBT.md)

### Useful Links
- [Link 1]
- [Link 2]

### Sprint-Specific Notes
[Any additional notes, context, or information relevant to this sprint]

---

## Checklist for Sprint Planning

**Before Sprint Starts:**
- [ ] Sprint goal defined and approved
- [ ] Team assigned and availability confirmed
- [ ] Backlog prioritized (P0/P1/P2)
- [ ] Estimates reviewed and realistic
- [ ] Risks identified and mitigation planned
- [ ] Acceptance criteria clear and measurable
- [ ] Dependencies identified and addressed
- [ ] Communication plan established

**During Sprint:**
- [ ] Daily progress tracking (stand-ups or async)
- [ ] Blockers addressed promptly
- [ ] Code reviews completed within 24h
- [ ] Documentation updated alongside code
- [ ] Tests written and passing
- [ ] Regular check-ins with Tech Lead

**End of Sprint:**
- [ ] All P0 tasks complete
- [ ] Definition of Done met
- [ ] Demo prepared (if applicable)
- [ ] Retrospective conducted
- [ ] Metrics recorded and analyzed
- [ ] Action items documented
- [ ] Next sprint planned

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial sprint plan | [Name] |

---

**Sprint Status:** Not Started | In Progress | Complete | Blocked
**Last Updated:** YYYY-MM-DD
**Next Review:** [Date]
