# Testing Protocol for Natural Language Workflow Creation

## Overview

Manual testing protocol to verify natural language workflow creation functionality.

## Prerequisites

- Plugin installed and loaded
- Global syntax library created: `library/syntax/`
- Example syntax files in place

## Test Suite

### Test 1: Command Entry Point

**Objective:** Verify `/orchestration:create` command works

**Steps:**
1. Run `/orchestration:create`
2. Verify workflow-socratic-designer agent launches
3. Verify first question appears
4. Answer question
5. Verify follow-up questions appear
6. Complete workflow creation
7. Verify syntax generated
8. Verify template save option appears

**Expected Results:**
- ✅ Command recognized
- ✅ Agent launches successfully
- ✅ Questions use AskUserQuestion
- ✅ Questions are strategic and relevant
- ✅ Generated syntax is valid
- ✅ Template can be saved

### Test 2: Command with Description

**Objective:** Verify `/orchestration:create <description>` works

**Steps:**
1. Run `/orchestration:create deploy with tests and security`
2. Verify description is processed
3. Verify questions are contextual (not starting from scratch)
4. Complete workflow creation
5. Verify generated syntax includes tests and security elements

**Expected Results:**
- ✅ Description parsed correctly
- ✅ Questions skip basic intent gathering
- ✅ Questions focus on customization
- ✅ Generated syntax matches description

### Test 3: Menu Entry Point

**Objective:** Verify menu integration works

**Steps:**
1. Run `/orchestrate`
2. Verify "Create from description" option appears
3. Select "Create from description"
4. Verify redirects to `/orchestration:create`
5. Complete workflow creation

**Expected Results:**
- ✅ Menu option present
- ✅ Selection triggers create command
- ✅ Workflow creation proceeds normally

### Test 4: Proactive Skill Trigger

**Objective:** Verify skill suggests orchestration appropriately

**Steps:**
1. Say: "I need to run tests, then if they pass, deploy to production"
2. Verify Claude suggests orchestration
3. Verify suggestion includes identified steps
4. Accept suggestion
5. Verify `/orchestration:create` triggered with description

**Expected Results:**
- ✅ Skill detects multi-step task
- ✅ Suggestion explains workflow benefits
- ✅ Accepting triggers create command
- ✅ Description passed to command

### Test 5: Variable Binding Generation

**Objective:** Verify workflows use variable binding

**Steps:**
1. Create workflow with conditional logic
2. Example: `/orchestration:create run tests then deploy if passed`
3. Verify generated syntax includes variable binding
4. Check format: `operation (condition):variable~>`
5. Check references: `(if variable)~>` and `(if !variable)~>`

**Expected Results:**
- ✅ Variable binding syntax present
- ✅ Variables have descriptive names
- ✅ Variables defined before use
- ✅ Both positive and negative conditions used appropriately

### Test 6: Negative Condition Generation

**Objective:** Verify negative conditions with `!` work

**Steps:**
1. Create workflow with failure path
2. Verify both success and failure paths generated
3. Check `(if !variable)~>` syntax used
4. Verify negation makes semantic sense

**Expected Results:**
- ✅ Negative conditions present where appropriate
- ✅ `!` operator used correctly
- ✅ Both branches handled (positive and negative)
- ✅ Logic is correct

### Test 7: Custom Syntax Creation

**Objective:** Verify custom syntax created when needed

**Steps:**
1. Create workflow needing custom checkpoint
2. Example: `/orchestration:create deploy with security approval gate`
3. Verify system recognizes need for custom syntax
4. Verify workflow-syntax-designer called
5. Verify custom syntax definition created
6. Check definition format
7. Verify custom syntax included in template Definitions section

**Expected Results:**
- ✅ Custom syntax need identified
- ✅ Syntax designer agent called
- ✅ Definition file well-formed
- ✅ Definition included in template
- ✅ Syntax used correctly in workflow

### Test 8: Reuse-First Syntax Check

**Objective:** Verify system reuses existing syntax

**Setup:**
1. Ensure `@security-gate` checkpoint exists in library/syntax/checkpoints/
2. Then create workflow needing security gate

**Steps:**
1. Run `/orchestration:create deploy with security gate`
2. Verify system searches existing syntax
3. Verify system finds and reuses `@security-gate`
4. Verify no duplicate created

**Expected Results:**
- ✅ System searches global library
- ✅ Existing syntax found
- ✅ Existing syntax reused
- ✅ No duplicate created
- ✅ Workflow uses global syntax

### Test 9: Template Creation Flow

**Objective:** Verify template creation works end-to-end

**Steps:**
1. Create workflow
2. Generate syntax
3. Choose to save as template
4. Verify name suggestion appears
5. Provide/accept name
6. Verify description prompt
7. Verify parameters identified
8. Confirm parameters
9. Verify file written to `examples/`
10. Check file format
11. Verify frontmatter correct
12. Verify Workflow section correct
13. Verify Definitions section if custom syntax used

**Expected Results:**
- ✅ Name suggestion is sensible
- ✅ Description is clear
- ✅ Parameters correctly identified
- ✅ File written successfully
- ✅ File format is valid YAML
- ✅ All sections present and correct
- ✅ Template is loadable and executable

### Test 10: Global Syntax Promotion

**Objective:** Verify promoting custom syntax to global library

**Steps:**
1. Create workflow with custom syntax (template-local)
2. Save as template
3. Verify promotion prompt appears
4. Verify custom syntax listed
5. Select syntax to promote
6. Confirm promotion
7. Verify files created in `library/syntax/<type>/`
8. Check file format
9. Create new workflow that could use promoted syntax
10. Verify system reuses promoted syntax

**Expected Results:**
- ✅ Promotion prompt appears
- ✅ Multi-select allows choosing which to promote
- ✅ Files created in correct directories
- ✅ File format matches type requirements
- ✅ Promoted syntax is reusable
- ✅ System finds and reuses in new workflows

### Test 11: Syntax Library Management

**Objective:** Verify syntax library management via menu

**Steps:**
1. Run `/orchestrate`
2. Select "Manage syntax"
3. Verify submenu appears
4. Test "List all syntax"
   - Verify all syntax shown with type, name, description
5. Test "View by type"
   - Select a type (e.g., checkpoints)
   - Verify only that type shown
6. Test "Search syntax"
   - Enter search term
   - Verify matching syntax shown

**Expected Results:**
- ✅ Manage syntax menu option works
- ✅ List all shows complete table
- ✅ View by type filters correctly
- ✅ Search finds matching syntax
- ✅ Can view full syntax definitions

### Test 12: Question Type Variety

**Objective:** Verify different question types work

**Steps:**
1. Create various workflows triggering different question types
2. Test single-select questions
3. Test multi-select questions
4. Test questions with "Other" option for custom input
5. Verify answers processed correctly

**Expected Results:**
- ✅ Single-select works
- ✅ Multi-select works
- ✅ "Other" option allows custom input
- ✅ All answer types processed correctly
- ✅ Generated workflows reflect answers

### Test 13: Hybrid Questioning Strategy

**Objective:** Verify questioning adapts to request specificity

**Test Vague:**
1. Run `/orchestration:create help with deployment`
2. Verify questions start with problem identification
3. Verify scope and constraints asked

**Test Specific:**
1. Run `/orchestration:create TDD workflow for auth feature`
2. Verify pattern immediately identified
3. Verify questions focus on customization

**Test Medium:**
1. Run `/orchestration:create review and deploy`
2. Verify questions drill into both parts
3. Verify connection between parts explored

**Expected Results:**
- ✅ Vague requests get fundamental questions
- ✅ Specific requests get customization questions
- ✅ Medium requests get targeted questions
- ✅ Strategy adapts appropriately

### Test 14: Pattern Recognition

**Objective:** Verify system recognizes common patterns

**Patterns to Test:**
- TDD: "implement with test-driven development"
- Deployment: "deploy with validation"
- Security audit: "security check for module"
- Bug fix: "find and fix issue"
- Refactoring: "refactor with validation"

**Steps:**
1. For each pattern, create workflow
2. Verify pattern identified
3. Verify appropriate questions asked
4. Verify generated syntax matches pattern

**Expected Results:**
- ✅ TDD pattern generates test-first loop
- ✅ Deployment generates build-test-deploy pipeline
- ✅ Security generates audit workflow
- ✅ Bug fix generates investigate-fix-verify
- ✅ Refactor generates safe refactor with tests

### Test 15: Complete Integration

**Objective:** Full end-to-end test

**Scenario:** Create a complete deployment pipeline from scratch

**Steps:**
1. Run `/orchestration:create`
2. Describe: "deployment pipeline with tests, security, and rollback"
3. Answer all questions
4. Review generated workflow
5. Verify includes:
   - Build step
   - Parallel tests and security
   - Quality gate (all must pass)
   - Deployment
   - Smoke test
   - Conditional rollback
   - Variable binding throughout
6. Save as template named "deploy-secure"
7. Verify template created
8. Promote custom syntax if any
9. Load and execute template
10. Verify workflow executes correctly

**Expected Results:**
- ✅ Complete workflow generated
- ✅ All requested features present
- ✅ Syntax is valid
- ✅ Variable binding used appropriately
- ✅ Template saved successfully
- ✅ Template is executable
- ✅ Workflow completes successfully

## Regression Tests

After any changes, re-run:
- Test 1 (Basic command)
- Test 5 (Variable binding)
- Test 8 (Reuse-first)
- Test 9 (Template creation)

## Known Issues

Document any known issues here as they're discovered during testing.

## Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
Version: [Plugin version]

Test 1: [PASS/FAIL] - Notes: ...
Test 2: [PASS/FAIL] - Notes: ...
...
Test 15: [PASS/FAIL] - Notes: ...

Overall: [PASS/FAIL]
Issues: [List any issues found]
```
