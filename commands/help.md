---
description: Quick reference guide for orchestration syntax
---

# Orchestration Help

Display the quick reference guide for the Workflow Orchestration System.

## Arguments: {{ARGS}}

## Display Quick Reference

```
╔══════════════════════════════════════════════════════════════╗
║                Orchestration Quick Reference                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  OPERATORS                                                   ║
║  step1 -> step2           Sequential                         ║
║  step1 || step2           Parallel                           ║
║  step (if cond)~> next    Conditional                        ║
║  @label                   Checkpoint                         ║
║  [...]                    Subgraph                           ║
║                                                              ║
║  AGENTS                                                      ║
║  explore:"task"           Investigation                      ║
║  general-purpose:"task"   Implementation                     ║
║  code-reviewer:"task"     Quality check                      ║
║                                                              ║
║  EXAMPLES                                                    ║
║  explore:"find bugs" -> review -> implement                  ║
║  [test || lint] (all success)~> deploy                      ║
║  @try -> fix -> test (if failed)~> @try                     ║
║                                                              ║
║  COMMANDS                                                    ║
║  /orchestration:create            Natural language creation  ║
║  /orchestration:orchestrate       Main orchestration menu    ║
║  /orchestration:help              Quick reference            ║
║  /orchestration:explain <topic>   Detailed docs              ║
║  /orchestration:examples          Gallery                    ║
║  /orchestration:run <syntax>      Execute workflow           ║
║  /orchestration:template <name>   Load and run template      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Next Steps

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do next?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "View examples", description: "See example workflows"},
      {label: "Explain topic", description: "Learn about specific features"},
      {label: "Create workflow", description: "Start building a workflow"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **View examples** → Execute `/orchestration:examples`
- **Explain topic** → Execute `/orchestration:explain`
- **Create workflow** → Prompt for syntax and execute `/orchestration:run <syntax>`
- **Return to menu** → Execute `/orchestration:menu`
