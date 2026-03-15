# Twee File Writing Rules

Rules learned from writing and debugging `.twee` files for Twine (Harlowe format).

---

## File Structure

Every twee file must have these three sections in order:

```
:: StoryTitle
Your Story Name


:: StoryData
{
  "ifid": "UNIQUE-GUID-HERE",
  "format": "Harlowe",
  "format-version": "3.3.9",
  "start": "NameOfStartPassage"
}


:: NameOfStartPassage
Passage body text here.
```

---

## Passage Headers

- Every passage starts with `:: PassageName`
- Optional metadata (position, size) can follow the name: `:: PassageName {"position":"700,300","size":"100,100"}`
- Passage names must be **unique**

---

## Passage Names

- **Never use underscores** in passage names. Harlowe treats `_word` as a temporary variable and will throw: `There isn't a temp variable named _word in this place.`
- Use **hyphens** instead: `family-plot`, `ash-vinyl`, `tree-burial`
- CamelCase is also safe: `FamilyPlot`, `AshVinyl`
- Passage names are case-sensitive

---

## Links

Links connect passages and render as clickable choices.

### Basic link (label = destination)
```
[[buried]]
```

### Link with custom label
```
[[Send me back to the earth->buried]]
```

### Rules
- **No space between the arrow and the destination**: `->destination` ✅ not `-> destination` ❌
- The destination must exactly match an existing `:: PassageName`
- Links can appear anywhere in the passage body

---

## Variables

Harlowe has two types of variables:

| Type | Prefix | Scope |
|------|--------|-------|
| Story variable | `$` | Global — accessible from any passage |
| Temp variable | `_` | Local — only exists in the passage/hook where it was created |

- **Never use `_` in plain passage text** unless you intentionally mean a temp variable
- For data that needs to persist across passages, always use `$varName`

---

## Text Formatting

| Syntax | Output |
|--------|--------|
| `//text//` | *italic* |
| `''text''` | **bold** |
| `~~text~~` | ~~strikethrough~~ |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `There isn't a temp variable named _x in this place` | Passage name or body text contains an underscore | Replace underscores with hyphens in all passage names and links |
| Story ends unexpectedly after a link | Link destination doesn't match any `:: PassageName` exactly | Check spelling, case, and that no spaces were added after `->` |

---

## Tested Format

These rules were validated against **Harlowe 3.3.9** in Twine 2.
