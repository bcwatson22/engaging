# Taking a dependency to its next major

Read by two callers, which is why it lives here rather than inline in a
workflow:

- `.github/workflows/dependencyMajor.yml`, the on-demand run.
- `evals/dependencyMajor/`, a suite that scores this judgement against
  recorded upgrades.

A copy of these rules in either place would drift from the other. `pnpm
check:evals` fails if the suite's prompts no longer match this file.

**This is the agent with the most latitude in the repo.** It may change
application code, which the monthly routine may not, so it has no diff guard -
a guard would defeat the point. What stands in a guard's place is that a person
asks for it by name, the PR is the review, and the two rules in step 3 are not
negotiable.

## The task

Take the packages you were given to their latest major version, together.

This repo pins versions exactly, enforces 100% coverage, and runs lint, format,
type-aware lint, types, a script-strip check and the test suite through `pnpm
verify`. Read CLAUDE.md before you start.

1. Find the latest version of each package. Read its changelog or migration
   guide before changing anything - a major exists because something was
   removed or renamed, and guessing at that from a type error is slower than
   reading what the author wrote.

2. Write the new versions into package.json exactly, with no range prefix, and
   install. If a package in the list has peers that must match, say so and
   include them rather than fighting the resolver.

   Moving a peer the changelog says must match **is** part of the upgrade, not
   scope creep, and rule two in step 3 does not argue against it. Not having
   been asked for it by name is not a reason to stop: move it, and say you
   did. A peer you cannot move - because the version it needs does not exist,
   or is itself held back - is a reason to stop.

3. Run `pnpm verify` and make it pass. Here, unlike the monthly routine, you
   may change application code and tests - that is the point of this workflow.
   Two rules hold:

   - **Fix the cause, never the check.** Do not weaken a threshold, add a lint
     disable, skip a test or loosen a type to get to green. If the only way
     through is to weaken something, stop and explain why in the PR instead.
   - **Keep the change to what the upgrade needs.** A migration is not an
     invitation to refactor the surrounding code.

4. Commit on a branch named `chore/<package>-<major>` - for a set, name it
   after the one that leads, such as `chore/vitest-5` - and open a PR with
   `gh pr create --assignee bcwatson22`.

   The body is prose and should tell the reviewer what a changelog would not:
   what actually broke, what you changed to fix it, and anything you are unsure
   about. Quote the migration guide where it explains a change you made. If
   behaviour changed in a way tests cannot see, say so plainly and say where to
   look.

   No test-plan or checklist section. CI shows what ran, and a list of boxes
   ticked by the author is noise beside the prose PR bodies in this repo; the
   paragraph about what you are unsure of does that job better.

## Always write the report

Before you finish, write everything you would have said in a final message to
the report file you were told to write - what you did, what broke, what you
decided and what you are unsure of. A step after yours puts that file in the
run summary, and it is the only place your reasoning survives: this action
hides its own output, and a run that opens no PR otherwise leaves nothing to
read.

If a tool you need is refused, say which one in that report rather than working
around it - the list of tools this workflow allows is a guess, and a refusal is
how it gets corrected.

## If you cannot make verify pass

Open no PR. Revert everything, and use the report to say what the upgrade needs

- the file, the API that changed, and what a person would have to decide.

**A clear account of why it is hard is a good outcome for this workflow; a green
PR that quietly weakened a check is not.**
