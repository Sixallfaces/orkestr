---
description: Detailed topic documentation for orchestration features
---

# Orchestration Topic Documentation

Provide detailed documentation on specific orchestration topics.

## Arguments: {{ARGS}}

## Available Topics

- **syntax** - Operators and grammar
- **agents** - Agent invocation
- **parallel** - Parallel execution
- **conditionals** - Conditional flow
- **loops** - Retry patterns
- **checkpoints** - Pause points
- **subgraphs** - Nested flows
- **templates** - Template system
- **custom** - Custom definitions
- **error-handling** - Recovery strategies

## Handle Topic Selection

### No Topic Specified

If {{ARGS}} is empty, present topic selection menu:

```javascript
AskUserQuestion({
  questions: [{
    question: "Which topic would you like to learn about?",
    header: "Topic",
    multiSelect: false,
    options: [
      {label: "syntax", description: "Operators and grammar"},
      {label: "agents", description: "Agent invocation"},
      {label: "parallel", description: "Parallel execution"},
      {label: "conditionals", description: "Conditional flow"},
      {label: "loops", description: "Retry patterns"},
      {label: "checkpoints", description: "Pause points"},
      {label: "subgraphs", description: "Nested flows"},
      {label: "templates", description: "Template system"},
      {label: "custom", description: "Custom definitions"},
      {label: "error-handling", description: "Recovery strategies"}
    ]
  }]
})
```

### Topic Specified

If {{ARGS}} contains a topic name, load the corresponding documentation:

```javascript
Read(`~/.claude/plugins/repos/orchestration/docs/topics/${topic}.md`)
```

Display the full content to the user.

### File Not Found

If the topic file doesn't exist:
1. Display friendly message: "Documentation for '{topic}' is not available yet."
2. Show list of available topics above
3. Offer to explain what we know about the topic based on general knowledge
4. Prompt to select another topic

## After Displaying Topic

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do next?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "Learn another topic", description: "View different topic documentation"},
      {label: "See examples", description: "View example workflows"},
      {label: "Try it out", description: "Create a workflow using this concept"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Learn another topic** → Execute `/orchestration:explain` (without args to show menu)
- **See examples** → Execute `/orchestration:examples`
- **Try it out** → Prompt for syntax and execute `/orchestration:run <syntax>`
- **Return to menu** → Execute `/orchestration:menu`

## Implementation Notes

- Parse {{ARGS}} to extract topic name (handle variations like "explain syntax", "syntax", etc.)
- Be flexible with topic names (case-insensitive, handle plurals)
- If multiple topics match, ask for clarification
- Keep documentation display clean and well-formatted
