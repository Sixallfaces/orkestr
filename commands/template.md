---
description: Load and execute saved workflow templates
---

# Orchestration Template Execution

Load and execute a saved workflow template with parameter substitution.

## Arguments: {{ARGS}}

## Template Location

Templates are stored at: `~/.claude/plugins/repos/orchestration/examples/{{ARGS}}.flow`

## Template Format

```yaml
---
name: template-name
description: What this template does
params:
  param1: Description (default: value)
  param2: Another parameter (default: another value)
---

Workflow:
step1:"{{param1}}" -> step2:"{{param2}}"
```

## Execution Flow

### 1. Check Template Exists

Read template file:
```javascript
Read(`~/.claude/plugins/repos/orchestration/examples/${templateName}.flow`)
```

If file doesn't exist:
- Display friendly error message
- List available templates from `~/.claude/plugins/repos/orchestration/examples/*.flow`
- Offer to:
  - Select another template
  - Create new workflow from scratch
  - Return to menu

### 2. Parse Template

Extract from template:
1. **YAML frontmatter** (between `---` delimiters):
   - name
   - description
   - params (with descriptions and defaults)

2. **Workflow syntax** (after frontmatter):
   - The actual workflow definition

### 3. Prompt for Parameters

If template has parameters, use AskUserQuestion to collect values:

For each parameter, show:
- Parameter name
- Description from template
- Default value

Example:
```javascript
AskUserQuestion({
  questions: [{
    question: "Enter value for 'feature' parameter",
    header: "Parameters",
    multiSelect: false,
    options: [
      {label: "Use default", description: `Default value: ${defaultValue}`},
      {label: "Custom value", description: "Enter a custom value"}
    ]
  }]
})
```

If user selects "Custom value", prompt for the actual value.

### 4. Substitute Parameters

Replace all `{{param}}` placeholders in workflow syntax with provided values.

Example:
- Template: `implement:"{{feature}}" -> test:"{{feature}}"`
- Values: `{feature: "authentication"}`
- Result: `implement:"authentication" -> test:"authentication"`

### 5. Execute Workflow

Pass the substituted workflow syntax to `/orchestration:run`:

```
/orchestration:run <substituted-workflow-syntax>
```

This will trigger the full parse → visualize → execute flow.

## After Execution

When workflow completes, ask if user wants to:
- Run template again with different parameters
- Save current workflow as new template
- Return to menu

## Error Handling

### Invalid Template Format
- Display clear error message explaining what's wrong
- Show example of correct format
- Offer to fix template or choose another

### Missing Parameters
- Detect any unsubstituted `{{...}}` in workflow
- Show which parameters are missing
- Re-prompt for those specific values

### Workflow Execution Errors
- Let `/orchestration:run` handle execution errors
- Its error recovery system will take over

## Implementation Notes

**Parameter Defaults:**
- Always show default values to user
- Allow empty input to use default
- Validate parameter values before substitution

**Template Discovery:**
- Use Glob to find all `*.flow` files
- Parse frontmatter to get names and descriptions
- Cache for quick listing

**Parameter Types:**
- All parameters are strings
- No type validation needed at template level
- Let workflow execution validate usage

**Nested Placeholders:**
- Support `{{param}}` anywhere in workflow
- Including in agent instructions, conditions, etc.
- Multiple occurrences of same parameter are all replaced
