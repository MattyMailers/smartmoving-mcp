---
title: "followups commands"
description: "Generated SmartMoving followups command reference with safety levels and examples."
---

# followups commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving followups list` | READ | [Reference](/commands/followups/list/) | List all follow-ups for an opportunity. Premium tier endpoint. Follow-ups are scheduled tasks like callbacks, emails to send, or in-home estimates. Returns both pending and completed follow-ups. |
| `smartmoving followups get` | READ | [Reference](/commands/followups/get/) | Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes. |
| `smartmoving followups create` | WRITE | [Reference](/commands/followups/create/) | Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime. |
| `smartmoving followups update` | WRITE | [Reference](/commands/followups/update/) | Update an existing follow-up. Premium tier endpoint. Use this to reschedule, reassign, change type, or update notes on a follow-up task. |
| `smartmoving followups delete` | DESTRUCTIVE | [Reference](/commands/followups/delete/) | Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed. |
| `smartmoving followups complete-followup` | WRITE | [Reference](/commands/followups/complete-followup/) | Mark a follow-up as complete. Premium tier endpoint. Use this when the scheduled callback, email, or task has been performed. The follow-up remains in the history but is flagged as completed. |
