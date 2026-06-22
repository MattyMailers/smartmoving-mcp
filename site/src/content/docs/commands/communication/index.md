---
title: "communication commands"
description: "Generated SmartMoving communication command reference with safety levels and examples."
---

# communication commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving communication call` | WRITE | [Reference](/commands/communication/call/) | Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected. |
| `smartmoving communication note` | WRITE | [Reference](/commands/communication/note/) | Log a note on an opportunity. Premium tier endpoint. Use this to record any interaction, observation, or update that isn't a phone call. Notes appear in the opportunity's activity timeline. |
