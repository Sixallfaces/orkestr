---
description: Create workflow from natural language description
---

# Create Workflow from Description

Launch the Socratic workflow designer to create workflows from natural language.

## Usage

- `/orchestration:create` - Start with no context, ask what to build
- `/orchestration:create <description>` - Start with initial description

## Examples

```
/orchestration:create
/orchestration:create deploy with security validation
/orchestration:create implement auth feature with TDD
```

## Action

Parse arguments:
```javascript
const description = args.trim() || null;
```

Launch the workflow-socratic-designer agent:

```javascript
Task({
  subagent_type: "workflow-socratic-designer",
  description: "Create workflow from description",
  prompt: `Create an orchestration workflow from natural language description.

Initial description: ${description || "Ask user what they want to build"}

Follow this process:

1. **Understand Request**
   ${description ?
     "- Assess specificity of provided description\n   - Identify workflow pattern hints" :
     "- Ask user what they want to build\n   - Gather initial context"}
   - Read existing templates for pattern matching: examples/*.flow
   - Read examples: docs/reference/examples.md

2. **Socratic Questioning**
   Use AskUserQuestion with single-select or multi-select based on question type.

   For vague requests:
   - Problem identification (single-select)
   - Scope clarification (multi-select)
   - Constraints (multi-select)
   - Pattern suggestion (single-select)

   For specific requests:
   - Pattern recognition
   - Customization (multi-select)
   - Validation (single-select)

   For medium requests:
   - Scope first (multi-select)
   - Details drilling
   - Connection logic

3. **Build WorkflowRequirements**
   Create structured object:
   {
     intent: "user's goal",
     pattern: "identified-pattern",
     agents: ["list", "of", "agents"],
     structure: "sequential|parallel|conditional|hybrid",
     errorHandling: ["retry", "rollback"],
     checkpoints: ["@review"],
     conditions: ["if passed"],
     guards: ["require-clean-working-tree"],
     tools: ["npm:test"],
     mcps: [],
     customSyntaxNeeded: []
   }

4. **Custom Syntax (if needed)**
   If customSyntaxNeeded has elements:
   - Call workflow-syntax-designer for each
   - Use Task tool with subagent_type: "workflow-syntax-designer"

5. **Generate Workflow**
   - Map requirements to orchestration syntax
   - Add variable bindings: operation (condition):var~>
   - Use negative conditions: (if !var)~>
   - Format for readability

6. **Explain to User**
   - Plain language explanation of workflow
   - Show generated syntax with highlighting
   - Explain any custom syntax created

7. **Save as Template**
   Use AskUserQuestion to:
   - Ask if user wants to save as template
   - Collect template name (suggest based on pattern)
   - Confirm description
   - Confirm parameters
   - Save to examples/<name>.flow
   - Ask which custom syntax to promote to global library
   - Copy promoted syntax to library/syntax/<type>/<name>.md

Context files:
- Templates: examples/
- Examples: docs/reference/examples.md
- Global syntax: library/syntax/
- Best practices: docs/reference/best-practices.md

Remember:
- Use variable binding for explicit conditions
- Support negative conditions with !
- Follow reuse-first for custom syntax
- Make workflow self-documenting with clear variable names
`
})
```

## Notes

This command is the primary entry point for natural language workflow creation. It delegates all the work to the workflow-socratic-designer agent.
