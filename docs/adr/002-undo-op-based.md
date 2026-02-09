# ADR 002: Op-based Undo/Redo

## Status
Accepted

## Context
In a collaborative whiteboard, undo/redo must work correctly when multiple users are editing simultaneously.

## Decision
Use op-based undo. Each user action produces a forward op and its computed inverse op. Undo dispatches the inverse op as a new durable op to the server.

## Rationale
- **Collaboration-safe**: Inverse ops go through the same server-authoritative pipeline as regular ops. No state rewinding needed.
- **Simple server**: Server doesn't need to understand undo semantics; it just sequences ops.
- **Per-user undo**: Each client maintains its own undo stack. Undoing one user's action doesn't affect another's.

## Consequences
- Some ops may not have clean inverses (e.g., undo a delete when the object state was already modified).
- We store the previous state snapshot in the undo entry to reconstruct inverse ops accurately.
- Undo stack is client-local (not persisted).
