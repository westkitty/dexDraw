# ADR 001: Use Drizzle ORM over Prisma

## Status
Accepted

## Context
We need an ORM for PostgreSQL persistence of boards, ops, snapshots, and Yjs updates. The two main candidates are Prisma and Drizzle.

## Decision
Use Drizzle ORM.

## Rationale
- **SQL transparency**: Drizzle generates predictable SQL, critical for the append-only ops table and unique constraint-based dedup.
- **No binary dependencies**: Prisma requires a Rust-compiled query engine binary; Drizzle is pure JS/TS.
- **Write performance**: The ops table is write-heavy (every user action). Drizzle's thinner abstraction layer reduces overhead.
- **Schema-as-code**: Drizzle schemas are plain TypeScript, composable with the rest of the monorepo.
- **Migration tooling**: drizzle-kit generates SQL migrations from schema diffs.

## Consequences
- Less auto-completion DX compared to Prisma Client.
- Manual relation queries instead of Prisma's implicit joins.
- Team must be comfortable reading raw SQL in query logs.
