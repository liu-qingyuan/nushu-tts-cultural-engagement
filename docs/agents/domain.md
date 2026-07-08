# Domain docs

How engineering skills should use domain documentation in this repository.

## Read before exploring

- **`CONTEXT.md`** at the repository root, if present.
- **`docs/adr/`** for architecture decisions relevant to the area being changed, if present.

If these files do not exist, continue quietly. Do not treat their absence as a problem and do not create them preemptively. Create or update them only when domain language or architectural decisions become clear enough to record.

## Layout

This repository uses a single-context domain docs layout:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Vocabulary

When naming domain concepts in issue titles, implementation plans, refactoring proposals, hypotheses, or test names, use the terms defined in `CONTEXT.md` if it exists.

If a needed concept is missing from `CONTEXT.md`, either avoid inventing new terminology or note that `/domain-modeling-lqy` should update the domain model.

## ADR conflicts

If your output contradicts an existing ADR, call that out explicitly instead of silently overriding it.

