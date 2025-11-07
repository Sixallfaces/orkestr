---
description: Display examples gallery for orchestration workflows
---

# Orchestration Examples Gallery

Display the examples gallery for the Workflow Orchestration System.

## Arguments: {{ARGS}}

## Load and Display Examples

Use the Glob tool to list available example workflows:

```
Glob('~/.claude/plugins/repos/orchestration/examples/*.flow')
```

For each example found, read the file to extract its name and description from the YAML frontmatter, then display a formatted list to the user.

## After Displaying Examples

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do with these examples?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "Try an example", description: "Execute one of these workflows"},
      {label: "Learn more", description: "Get detailed docs on a topic"},
      {label: "Create custom", description: "Build your own workflow"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Try an example** → Prompt user to paste/specify which example syntax, then execute `/orchestration:run <syntax>`
- **Learn more** → Execute `/orchestration:explain`
- **Create custom** → Prompt for syntax and execute `/orchestration:run <syntax>`
- **Return to menu** → Execute `/orchestration:menu`

## Implementation Note

If the examples.md file doesn't exist yet, display a friendly message and offer to:
1. Show inline examples (from help reference)
2. Create the examples.md file
3. Return to menu
