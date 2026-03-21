# Hearth

## Project

Web app helping families navigate conversations before a crisis. See `.claude/skills/design-brief/SKILL.md` for the full design brief.

## Design rules

- Always read the design brief skill before any UI work
- Always read the design inspiration skill before any UI work
- Use Playwright to visually inspect pages after any UI change
- No emoji in UI copy or as UI elements — icons only, from Lucide or Phosphor
- Use `.claude/skills/design-inspiration/SKILL.md` for any design related tasks

## Visual QA

After every major UI change, use Playwright to open the affected page and take a screenshot. Check that it matches the design brief before marking the task done.

## Stack

React, TypeScript, Tailwind

## Database rules

- Every new Supabase table must have RLS policies for SELECT, INSERT, and UPDATE
- Always use `auth.uid() = user_id` pattern
- Never create a table without corresponding policies
