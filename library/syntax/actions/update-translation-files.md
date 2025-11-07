---
name: update-translation-files
type: action
description: Update translation JSON/YAML files with new keys
tags: [i18n, translations, file-management, json]
complexity: medium
use_cases: [i18n-migration, translation-management, file-updates]
---

# Update Translation Files Action

Adds new i18n translation keys to language files while preserving structure, formatting, and existing translations.

## Purpose

Safely updates translation files (JSON, YAML) with new keys generated during i18n migration. Maintains hierarchical structure, preserves existing keys, and handles multiple language files consistently.

## Expansion

```
expert-code-implementer:"Add new i18n keys to translation files (e.g., en.json, es.json, fr.json). Maintain hierarchical structure, preserve existing keys and their order, format JSON properly with 2-space indentation. For each new key, use original string as value in primary language file. Add TODO/TRANSLATE comments in other language files. Handle nested objects correctly and validate JSON syntax."
```

## Behavior

1. **Locate Translation Files**: Finds language files in common locations
   - `src/i18n/*.json`
   - `public/locales/*/translation.json`
   - `locales/*.yml`
   - `lang/*.json`

2. **Parse Existing Translations**: Loads and parses current translations
   - Preserve existing key-value pairs
   - Maintain hierarchical object structure
   - Remember formatting preferences (indentation, quotes)

3. **Insert New Keys**: Adds generated keys to structure
   - Maintain or create hierarchy (e.g., `auth.loginButton.submit`)
   - Use alphabetical ordering within each level
   - Preserve comments if present

4. **Set Default Values**:
   - **Primary language** (usually en.json): Use original string as value
   - **Other languages**: Use `TODO: Translate` or copy English value
   - Mark untranslated keys for translator attention

5. **Format and Save**: Write files with consistent formatting
   - 2-space indentation (JSON)
   - Proper line breaks
   - Sorted keys (optional)
   - Validate syntax before saving

## File Handling

### JSON Files

**Before:**
```json
{
  "auth": {
    "login": "Log In",
    "logout": "Log Out"
  }
}
```

**After Adding** `auth.loginButton.submit`:
```json
{
  "auth": {
    "login": "Log In",
    "loginButton": {
      "submit": "Click to login"
    },
    "logout": "Log Out"
  }
}
```

### YAML Files

**Before:**
```yaml
auth:
  login: Log In
  logout: Log Out
```

**After Adding** `auth.loginButton.submit`:
```yaml
auth:
  login: Log In
  loginButton:
    submit: Click to login
  logout: Log Out
```

## Multi-Language Handling

### Primary Language (en.json)
```json
{
  "auth": {
    "loginButton": {
      "submit": "Click to login"
    }
  }
}
```

### Secondary Languages (es.json, fr.json, etc.)

**Option 1: TODO Marker**
```json
{
  "auth": {
    "loginButton": {
      "submit": "TODO: Translate 'Click to login'"
    }
  }
}
```

**Option 2: English Fallback**
```json
{
  "auth": {
    "loginButton": {
      "submit": "[EN] Click to login"
    }
  }
}
```

## Output Format

Returns update summary:

```
Translation files updated:

✓ en.json - 15 keys added
  - auth.loginButton.submit: "Click to login"
  - auth.loginButton.cancel: "Cancel"
  - dashboard.header.greeting: "Welcome back!"
  ... (12 more)

✓ es.json - 15 keys added (marked TODO)
✓ fr.json - 15 keys added (marked TODO)

Files modified:
  - src/i18n/en.json
  - src/i18n/es.json
  - src/i18n/fr.json

Action required:
  → 30 translations needed (es.json: 15, fr.json: 15)
```

## Common Use Cases

### i18n Migration Pipeline
```
generate-i18n-key -> update-translation-files -> git:commit
```

### Translation Workflow
```
update-translation-files:updated ->
export-for-translation ->
send-to-translators ->
@await-translations ->
import-translations ->
validate-completeness
```

### Continuous i18n
```
@on-pr-merge~>
  find-jsx-strings (if strings-found)~>
    generate-i18n-key ->
    update-translation-files ->
    create-translation-ticket
```

## Parameters

- **primaryLang**: Primary language code (default: 'en')
- **languages**: Array of language codes to update (default: all found)
- **todoMarker**: Marker for untranslated keys (default: 'TODO: Translate')
- **sortKeys**: Sort keys alphabetically (default: true)
- **indentation**: Spaces for indentation (default: 2)

## Structure Preservation

### Maintains Existing Order
```json
// Original order preserved
{
  "common": { ... },
  "auth": {
    "login": "...",
    "loginButton": { // New key inserted here
      "submit": "..."
    },
    "logout": "..."
  },
  "dashboard": { ... }
}
```

### Handles Nested Objects
```json
{
  "deeply": {
    "nested": {
      "structure": {
        "works": "Correctly"
      }
    }
  }
}
```

### Preserves Comments (JSON5)
```json5
{
  "auth": {
    // Authentication related translations
    "login": "Log In",
    "loginButton": {
      "submit": "Click to login" // New key with comment
    }
  }
}
```

## Validation

Before saving, validates:
- ✅ JSON/YAML syntax is valid
- ✅ All keys are strings
- ✅ No duplicate keys at same level
- ✅ Hierarchical structure is correct
- ✅ File is writable

If validation fails:
- Shows specific error
- Does not modify files
- Suggests fixes

## Integration

Works seamlessly with:
- `generate-i18n-key` - Source of keys to add
- `find-jsx-strings` - Context for default values
- `expert-code-implementer` - Code updates with new keys
- Git tools - Commit translation file changes

## Error Handling

### File Not Found
```
⚠ Warning: Translation file not found: src/i18n/es.json
→ Create file? (Y/n)
```

### Invalid JSON
```
✗ Error: Invalid JSON in src/i18n/en.json
  Line 42: Unexpected token ','
→ Fix syntax before updating
```

### Permission Denied
```
✗ Error: Cannot write to src/i18n/en.json (permission denied)
→ Check file permissions
```

## Best Practices

1. **Backup files**: Create backup before bulk updates
2. **Review changes**: Use git diff to review updates
3. **Consistent structure**: Maintain same hierarchy across all language files
4. **Translation notes**: Add context comments for translators
5. **Incremental updates**: Update small batches, test frequently

## Example Workflow

```
# Complete translation file update workflow
generate-i18n-key:keys ->
@preview-changes:approved ->
(if approved)~>
  [
    update-translation-files:updated ||
    git:add:staged
  ] ->
  @verify-formatting:valid ->
  (if valid)~>
    git:commit:"feat(i18n): add new translation keys"
```

## Rollback

If updates cause issues:
```bash
# Git rollback
git checkout -- src/i18n/*.json

# Or use workflow
@rollback-changes -> git:reset:hard -> git:clean
```

## See Also

- `generate-i18n-key` - Generate keys for insertion
- `find-jsx-strings` - Find strings needing keys
- Translation management tools: Lokalise, Crowdin, POEditor
- i18n libraries: react-i18next, vue-i18n, ngx-translate
