# Mistakes Log - Calendly Clone Project

## Project: Calendly Clone
**Date:** 2026-02-22  
**Context:** Review of mistakes made during interaction with Calendly Clone project

---

## Mistake 1: Misunderstood Project Name
**What Happened:**
- User mentioned "calandy" with typos ("clanady", "calendy")
- I asked "What is Clandy?" instead of recognizing it as the Calendly Clone project
- Wasted time asking for clarification when the project was already in the workspace

**Root Cause:**
- Didn't search the filesystem first for existing projects
- Didn't recognize phonetic/typo similarity to "Calendly"

**Impact:**
- Delayed response
- User had to clarify multiple times

**Prevention:**
- Always check workspace for existing projects before asking questions
- Search filesystem when user mentions unfamiliar project names
- Consider typos/phonetic similarities

---

## Mistake 2: Didn't Understand Next.js Route Groups
**What Happened:**
- Dashboard page was at `(dashboard)/page.tsx`
- User reported 404 on `/dashboard`
- I didn't immediately understand that route groups `(folder)` don't add to URL
- `(dashboard)/page.tsx` creates `/` not `/dashboard`

**Root Cause:**
- Forgot that parentheses in Next.js app router are route groups
- Route groups only apply layout, don't affect URL path

**Fix Applied:**
- Moved page to `(dashboard)/dashboard/page.tsx`
- Now correctly serves `/dashboard`

**Prevention:**
- Remember: `(group)` = layout wrapper only, no URL segment
- To get `/dashboard`, need `dashboard/page.tsx` inside or outside the group

---

## Mistake 3: Assumed Session Data Persistence
**What Happened:**
- User asked to "check previous session" for context about the project
- I tried to list sessions but only found current session
- Session data is ephemeral (<24h retention)
- I should have explained this limitation immediately

**Root Cause:**
- Didn't know/remember session retention policy
- Didn't communicate the limitation clearly upfront

**Impact:**
- Wasted time trying to find non-existent session data
- User didn't get the historical context they needed

**Prevention:**
- Always check memory files first for project context
- Explain session retention limits upfront when asked for "previous sessions"
- Use git history and filesystem as primary context source

---

## Mistake 4: Incomplete OAuth Redirect Fix
**What Happened:**
- User reported "redirect URL mismatch" error
- I identified the issue but didn't ask what domain they were testing on
- Fixed code to use env variable but didn't set up comprehensive redirect URLs

**Root Cause:**
- Didn't gather complete information about deployment environment
- Assumed localhost vs production without confirming

**Better Approach:**
- Ask: "What domain are you testing on?"
- Ask: "Localhost or deployed?"
- Provide Google Console URL config checklist

---

## Mistake 5: Didn't Do Comprehensive Route Audit Initially
**What Happened:**
- Fixed dashboard 404
- Later discovered missing edit page, settings page, broken links
- Should have audited all routes and links upfront

**Root Cause:**
- Reactive rather than proactive testing
- Fixed one issue at a time instead of comprehensive review

**Better Approach:**
- Always grep for all `<Link href=` patterns
- Verify all route files exist
- Check middleware matchers match actual routes

---

## Mistake 6: Used alert() for Errors in Generated Code
**What Happened:**
- Created edit page and settings page with `alert()` for error handling
- This is poor UX - should use toast notifications or inline error messages
- The existing codebase already had this pattern (which is also wrong)

**Root Cause:**
- Matched existing bad pattern instead of improving it
- Rushed to fix 404s without considering UX quality

**Better Approach:**
- Add proper error state management
- Use toast component or inline error messages
- Don't propagate `alert()` anti-pattern

---

## Mistake 7: Didn't Check for Required Environment Variables
**What Happened:**
- Code references `NEXT_PUBLIC_APP_URL` in settings page
- Used `window.location.origin` as fallback
- Didn't verify all env vars are documented

**Root Cause:**
- Assumed env vars exist without checking
- Didn't create comprehensive env documentation

**Better Approach:**
- List all `process.env` references
- Create `.env.example` with all required vars
- Document which are required vs optional

---

## Summary of Fixes Applied

1. ✅ Moved dashboard page to correct route
2. ✅ Fixed OAuth redirect to use env variable
3. ✅ Created missing edit event type page
4. ✅ Created missing settings page
5. ✅ Fixed success page redirect to include username param
6. ✅ Updated PAT in memory after it expired

## Lessons Learned

1. **Always search filesystem first** - Don't ask "what is X?" when X exists in workspace
2. **Understand Next.js route groups** - `(folder)` ≠ `/folder` in URL
3. **Session data is ephemeral** - Explain retention limits upfront
4. **Gather complete context** - Ask about deployment environment
5. **Comprehensive audits** - Check all routes/links in one pass
6. **Don't copy bad patterns** - Improve UX even if existing code has issues
7. **Document env vars** - List all required configuration
