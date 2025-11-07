---
name: find-jsx-strings
type: action
description: Find hardcoded strings in JSX text content
tags: [i18n, jsx, strings, refactoring]
complexity: medium
use_cases: [i18n-migration, code-quality, refactoring]
---

# Find JSX Strings Action

Searches codebase for hardcoded text content between JSX tags that should be internationalized.

## Purpose

Identifies all hardcoded strings in JSX components that need to be replaced with i18n translation function calls. Specifically targets text between `<Text>`, `<div>`, and other JSX element tags.

## Expansion

```
explore:"Search entire codebase for text between <Text></Text> and <div></div> tags using grep. Identify all hardcoded strings that should be internationalized. Exclude strings already using t() or other translation functions. Return structured list with file paths, line numbers, and string content."
```

## Behavior

1. **Search Patterns**: Looks for text content between JSX tags
   - `<Text>Hardcoded text</Text>`
   - `<div>User facing string</div>`
   - Other common JSX elements with text content

2. **Filter Existing i18n**: Excludes strings already internationalized
   - Skips `t('key')` calls
   - Skips `i18n.t('key')` patterns
   - Skips template literals with translation functions

3. **Context Extraction**: Captures surrounding code for context
   - File path and name
   - Line number
   - Component name (if detectable)
   - Parent element structure

4. **Output Structure**: Returns organized findings
   ```javascript
   {
     file: "src/components/LoginButton.tsx",
     line: 42,
     string: "Click to login",
     context: "LoginButton component, inside <button>",
     component: "LoginButton"
   }
   ```

## Output Format

Returns a structured list of findings:

```
Found 15 hardcoded strings:

1. src/components/auth/LoginButton.tsx:42
   String: "Click to login"
   Context: <button><Text>Click to login</Text></button>
   Component: LoginButton

2. src/pages/Dashboard.tsx:78
   String: "Welcome back!"
   Context: <div className="header">Welcome back!</div>
   Component: Dashboard
```

## Common Use Cases

### i18n Migration
```
find-jsx-strings -> generate-i18n-key -> update-translation-files
```

### Code Quality Audit
```
find-jsx-strings -> report-findings -> create-tickets
```

### Pre-deployment Check
```
@security-gate -> find-jsx-strings (if strings-found)~> block-deployment
```

## Parameters

- **scope**: `codebase` | `directory` | `files` (default: codebase)
- **patterns**: Array of JSX tags to search (default: ['Text', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'button'])
- **exclude**: Patterns to exclude (default: node_modules, dist, build)

## Integration

Works seamlessly with:
- `generate-i18n-key` - Generate translation keys for found strings
- `update-translation-files` - Update i18n JSON/YAML files
- `expert-code-implementer` - Apply fixes to code

## Notes

- Designed for React/JSX codebases
- Can be adapted for Vue, Angular templates
- Respects .gitignore patterns
- Handles nested JSX structures
- Detects both single and multiline strings

## Example Workflow

```
# Complete i18n migration workflow
find-jsx-strings:found ->
(if found)~>
  generate-i18n-key ->
  @preview-changes ->
  apply-fixes ->
  update-translation-files ->
  @review
```

## See Also

- `generate-i18n-key` - Generate semantic i18n keys
- `update-translation-files` - Update translation files
- `@plugin-deep-explore` - Deep codebase analysis
