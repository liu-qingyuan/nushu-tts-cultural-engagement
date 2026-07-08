# Issue tracker: GitHub

Issues and PRDs for this repository live as GitHub Issues. Use the `gh` CLI for all issue tracker operations.

## Conventions

- **Create issues**: `gh issue create --title "..." --body "..."`. Use heredocs for multi-line bodies.
- **Read issues**: `gh issue view <number> --comments`, filtering comments and labels with `jq` when useful.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`, with appropriate `--label` and `--state` filters.
- **Comment on issues**: `gh issue comment <number> --body "..."`
- **Apply/remove labels**: `gh issue edit <number> --add-label "..."` / `gh issue edit <number> --remove-label "..."`
- **Close issues**: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` handles this automatically when run inside the clone.

## Language

Issue titles, bodies, comments, and completion summaries should default to Chinese. Labels, commands, paths, code identifiers, config keys, and original error text should keep their literal tokens.

## Requests as a triage surface

**PRs as request surface: no.**

External PRs are not treated as incoming feature requests for `/triage-lqy`. Use the issue tracker for work intake. Collaborator PRs can still be reviewed normally outside this triage queue.

## When a skill says "publish to the issue tracker"

Create a GitHub Issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

