# Meeting-Ready Acceptance Suite

Scripted acceptance scenarios that must all pass before dexDraw can be used in a live meeting. **Any failure blocks meeting usage.**

---

## Prerequisites

- `docker compose up` running (server, client, postgres, nginx)
- Two browser windows open (Chromium/Brave + Firefox)
- Both connected to the same board

---

## Scenario 1: Board Creation from Template

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app, click "New Board" | Board creation dialog appears |
| 2 | Select "SWOT Analysis" template | Template preview shows 5 objects |
| 3 | Confirm creation | Board opens with 4 sticky-note zones + 1 title text |
| 4 | Verify objects are rendered on canvas | All 5 template objects visible in correct positions |

**Pass criteria:** Board loads with all template objects within 2 seconds.

---

## Scenario 2: Real-Time Ink Drawing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In Browser A, select pen tool | Pen tool active (toolbar indicator) |
| 2 | Draw a stroke on the canvas | Stroke appears immediately (<16ms pointer-to-pixel) |
| 3 | Observe Browser B | Same stroke appears within 200ms |
| 4 | In Browser B, draw a different stroke | Stroke appears in both browsers |

**Pass criteria:** Strokes render identically in both browsers (polygon point count within 5% tolerance).

---

## Scenario 3: Text Object Creation and Collaborative Editing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In Browser A, create a text object | Text editing overlay appears |
| 2 | Type "Meeting agenda item 1" | Text appears in real-time |
| 3 | Observe Browser B | Text object visible with content |
| 4 | In Browser B, click text object and append " - updated" | Both browsers show merged text (Yjs CRDT) |

**Pass criteria:** No text lost, no conflicts, both browsers converge to identical content.

---

## Scenario 4: Object Selection and Transform

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select a shape object | Selection handles appear (8 resize + 1 rotate) |
| 2 | Drag to move the object | Object moves smoothly, position updates in Browser B |
| 3 | Resize via corner handle | Object scales, bounding box updates in Browser B |
| 4 | Undo the resize (Ctrl+Z) | Object returns to pre-resize size in both browsers |
| 5 | Redo (Ctrl+Shift+Z) | Resize reapplied in both browsers |

**Pass criteria:** All transforms replicate within 300ms, undo/redo consistent.

---

## Scenario 5: Disconnect and Reconnect Recovery

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In Browser A, draw 3 strokes | All 3 visible in both browsers |
| 2 | Disconnect Browser A's network (DevTools offline) | Status bar shows "Reconnecting..." |
| 3 | While offline, draw 2 more strokes in Browser A | Strokes appear locally, queued in outbox |
| 4 | Re-enable Browser A's network | Status transitions: Reconnecting -> Connected |
| 5 | Verify Browser B | All 5 strokes visible (3 original + 2 offline) |
| 6 | Verify Browser A | All strokes from Browser B during disconnect also appear |

**Pass criteria:** Zero op loss after reconnect. Outbox drains completely. No duplicates.

---

## Scenario 6: Long-Poll Fallback

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Block WebSocket port in Browser A (or use proxy) | WS connection fails |
| 2 | Wait for 3 retry attempts | Status shows fallback transition |
| 3 | Observe transport mode in status bar | Shows "HTTP Polling" or "Fallback" |
| 4 | Draw a stroke in Browser A | Stroke eventually appears in Browser B (within 5s) |
| 5 | Draw a stroke in Browser B | Stroke appears in Browser A on next poll |

**Pass criteria:** App remains functional on HTTP fallback. All ops eventually delivered.

---

## Scenario 7: Presence and Follow Mode

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe both browsers | Remote cursor visible with name label |
| 2 | Move cursor in Browser A | Cursor updates in Browser B at ~20Hz, smooth interpolation |
| 3 | Activate laser pointer in Browser A | Laser trail visible in Browser B |
| 4 | Enable "Follow" mode in Browser B targeting Browser A | Browser B viewport snaps to Browser A's view |
| 5 | Pan/zoom in Browser A | Browser B viewport follows with spring animation |

**Pass criteria:** Cursor latency <100ms. Follow mode tracks within 1 frame.

---

## Scenario 8: Comments and Parking Lot

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click comment tool, place pin on canvas | Comment pin appears at click location |
| 2 | Type comment text and submit | Comment thread created, visible in panel |
| 3 | Observe Browser B | Comment pin and thread appear |
| 4 | In Browser B, reply to the comment | Reply visible in both browsers |
| 5 | Resolve the comment | Pin shows resolved state (dimmed/strikethrough) |
| 6 | Drag an object to Parking Lot | Object moves to parking lot sidebar |
| 7 | Verify object removed from main canvas | Object only visible in parking lot section |

**Pass criteria:** Comments thread correctly, parking lot isolates items from canvas.

---

## Scenario 9: Checkpoint and Time Travel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create several objects on the board | Objects visible |
| 2 | Create a named checkpoint "Before cleanup" | Checkpoint appears in timeline |
| 3 | Delete some objects | Objects removed |
| 4 | Open timeline scrubber | Scrubber shows op range |
| 5 | Scrub to checkpoint position | Board shows state at checkpoint (deleted objects restored) |
| 6 | Exit replay mode | Board returns to current state |
| 7 | Restore checkpoint "Before cleanup" | Board resets to checkpoint state for all users |

**Pass criteria:** Checkpoint restore is atomic, all clients see restored state.

---

## Scenario 10: Export and Meeting Summary

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add text objects and comments to board | Content exists |
| 2 | Export as PNG (viewport) | PNG downloads, contains visible canvas area |
| 3 | Export as PNG (full board) | PNG downloads, contains all objects regardless of viewport |
| 4 | Export as PDF | PDF downloads with board image + extracted text list |
| 5 | Export as Markdown | `.md` file downloads with structured meeting summary |
| 6 | Verify Markdown contains: board content, comments, parking lot | All sections present and correctly formatted |

**Pass criteria:** All 3 export formats produce valid output containing board content.

---

## Summary Checklist

| # | Scenario | Status |
|---|----------|--------|
| 1 | Board Creation from Template | [ ] |
| 2 | Real-Time Ink Drawing | [ ] |
| 3 | Text Object Collaborative Editing | [ ] |
| 4 | Object Selection and Transform | [ ] |
| 5 | Disconnect and Reconnect Recovery | [ ] |
| 6 | Long-Poll Fallback | [ ] |
| 7 | Presence and Follow Mode | [ ] |
| 8 | Comments and Parking Lot | [ ] |
| 9 | Checkpoint and Time Travel | [ ] |
| 10 | Export and Meeting Summary | [ ] |

**All 10 scenarios must pass to declare the app meeting-ready.**
