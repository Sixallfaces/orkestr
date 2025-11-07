---
name: generate-i18n-key
type: action
description: Generate contextual i18n translation keys from strings
tags: [i18n, key-generation, naming, automation]
complexity: medium
use_cases: [i18n-migration, translation-management, key-naming]
---

# Generate i18n Key Action

Creates semantic, hierarchical i18n translation keys based on string content, file context, and component structure.

## Purpose

Automatically generates meaningful i18n keys that follow best practices and naming conventions. Analyzes the codebase context to create keys like `auth.loginButton.submit` instead of generic keys like `string1`.

## Expansion

```
expert-code-implementer:"For each hardcoded string, generate a semantic i18n key following convention: module.component.purpose (e.g., 'auth.loginButton.submit', 'profile.settings.saveChanges'). Consider file path, component name, and string meaning to create meaningful, hierarchical keys. Ensure uniqueness across all keys. Follow camelCase for leaf nodes."
```

## Behavior

1. **Context Analysis**: Examines file and component structure
   - File path: `src/components/auth/LoginButton.tsx` → `auth.loginButton`
   - Component name: `LoginButton` → `loginButton`
   - Parent directories: `features/profile/` → `profile`

2. **Semantic Extraction**: Derives purpose from string content
   - "Click to login" → `.submit` or `.action`
   - "Welcome back!" → `.greeting` or `.title`
   - "Are you sure?" → `.confirmPrompt` or `.warning`

3. **Key Structure**: Creates hierarchical keys (3 levels recommended)
   - **Top level**: Module/feature name (`auth`, `profile`, `settings`)
   - **Mid level**: Component/section name (`loginButton`, `userCard`, `navbar`)
   - **Leaf level**: Purpose/usage (`submit`, `cancel`, `title`, `description`)

4. **Uniqueness Guarantee**: Ensures no key collisions
   - Checks existing translation files
   - Adds numerical suffix if needed (`loginButton.submit2`)
   - Warns about potential duplicates

## Key Format Rules

### Naming Conventions
- Use camelCase for all levels
- Top level: lowercase feature names
- Mid level: camelCase component names
- Leaf level: camelCase descriptive purpose

### Hierarchical Structure
```
auth                      # Feature/module
  loginButton             # Component
    submit                # Purpose
    cancel                # Purpose
  loginForm
    title
    emailLabel
    passwordLabel
```

### Examples

| String | Context | Generated Key |
|--------|---------|---------------|
| "Log In" | LoginButton component, button text | `auth.loginButton.submit` |
| "Welcome back!" | Dashboard page header | `dashboard.header.greeting` |
| "Save Changes" | Settings form button | `settings.form.saveButton` |
| "Are you sure?" | Delete confirmation dialog | `common.dialog.confirmPrompt` |
| "Profile Settings" | Page title | `profile.settings.pageTitle` |

## Output Format

Returns mapping of strings to generated keys:

```javascript
{
  findings: [
    {
      string: "Click to login",
      file: "src/components/auth/LoginButton.tsx",
      generatedKey: "auth.loginButton.submit",
      reasoning: "File in auth/, component LoginButton, action button"
    },
    {
      string: "Welcome back!",
      file: "src/pages/Dashboard.tsx",
      generatedKey: "dashboard.header.greeting",
      reasoning: "Dashboard page, header section, greeting message"
    }
  ],
  stats: {
    totalKeys: 15,
    uniqueKeys: 15,
    conflicts: 0
  }
}
```

## Common Use Cases

### i18n Migration Pipeline
```
find-jsx-strings -> generate-i18n-key -> @preview-keys -> update-translation-files
```

### Key Validation
```
generate-i18n-key:keys -> validate-key-conventions:valid (if !valid)~> @fix-naming
```

### Bulk Key Generation
```
[
  find-jsx-strings:jsx ||
  find-placeholder-text:placeholders ||
  find-aria-labels:aria
] -> generate-i18n-key -> consolidate-keys
```

## Parameters

- **convention**: `module.component.purpose` | `feature_component_action` (default: module.component.purpose)
- **caseStyle**: `camelCase` | `snake_case` | `kebab-case` (default: camelCase)
- **maxDepth**: Maximum key nesting levels (default: 3)
- **fallback**: What to do if context unclear (default: use `common.` prefix)

## Smart Context Detection

### File Path Analysis
```
src/features/authentication/components/LoginForm.tsx
→ Module: auth, Component: loginForm
```

### Component Name Extraction
```jsx
export const LoginButton: React.FC = () => {
  return <button>Click to login</button>
}
→ Component: loginButton
```

### Semantic Purpose Detection
- Button text → `.action`, `.submit`, `.cancel`
- Headings → `.title`, `.heading`, `.label`
- Descriptions → `.description`, `.hint`, `.help`
- Errors → `.error`, `.warning`, `.info`
- Confirmations → `.confirm`, `.prompt`

## Conflict Resolution

When key already exists:
1. Check if string is identical (potential duplicate)
2. Add context-based suffix if different meaning
3. Suggest manual review for ambiguous cases

```
auth.loginButton.submit      # Original
auth.loginButton.submit2     # Conflict, different context
auth.loginButton.submitAlt   # Semantic suffix
```

## Integration

Works seamlessly with:
- `find-jsx-strings` - Source of strings to generate keys for
- `update-translation-files` - Applies generated keys to i18n files
- `expert-code-implementer` - Replaces strings with t() calls

## Best Practices

1. **Keep keys semantic**: Use descriptive names, not generic
2. **Maintain hierarchy**: Consistent structure across features
3. **Avoid deep nesting**: Max 3-4 levels for readability
4. **Use common namespace**: Shared strings go in `common.*`
5. **Document conventions**: Keep naming guide for team

## Example Workflow

```
# Complete key generation with validation
find-jsx-strings:strings ->
generate-i18n-key:keys ->
@review-naming:approved ->
(if approved)~>
  update-translation-files ->
  apply-code-changes
```

## See Also

- `find-jsx-strings` - Find strings needing translation
- `update-translation-files` - Apply keys to translation files
- Best practices: docs/reference/i18n-conventions.md
