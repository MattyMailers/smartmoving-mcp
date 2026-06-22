---
title: "jobs commands"
description: "Generated SmartMoving jobs command reference with safety levels and examples."
---

# jobs commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving jobs by-opportunity` | READ | [Reference](/commands/jobs/by-opportunity/) | List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days). |
| `smartmoving jobs get` | READ | [Reference](/commands/jobs/get/) | Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs. |
| `smartmoving jobs create-job` | WRITE | [Reference](/commands/jobs/create-job/) | Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly. |
| `smartmoving jobs delete` | DESTRUCTIVE | [Reference](/commands/jobs/delete/) | Delete a job from an opportunity. Premium tier endpoint. This permanently removes the job and its associated stops, materials, and crew assignments. Use with caution. |
| `smartmoving jobs confirm` | WRITE | [Reference](/commands/jobs/confirm/) | Confirm a job on an opportunity. Premium tier endpoint. Marks the job as confirmed, indicating the customer has agreed to the scheduled date and services. |
| `smartmoving jobs notes` | READ | [Reference](/commands/jobs/notes/) | Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text. |
| `smartmoving jobs notes update` | WRITE | [Reference](/commands/jobs/notes-update/) | Update one or more note fields on a specific job. Premium tier endpoint. SmartMoving PATCH updates the provided note properties only, but each provided field value replaces that field. To add text below existing notes, use append_job_note instead. |
| `smartmoving jobs notes append` | WRITE | [Reference](/commands/jobs/notes-append/) | Append text below an existing job note field without erasing the prior content. This reads the current notes, adds a blank line plus the new text, then PATCHes only the selected note field. Fails if the job is closed or SmartMoving rejects note updates. |
| `smartmoving jobs stops update` | WRITE | [Reference](/commands/jobs/stops-update/) | Replace all stops on a job. Premium tier endpoint. This is a PUT operation that replaces the entire list of stops. Each stop has a type (PickUp=0 or DropOff=1) and an address. Use sortOrder to control the route sequence. |
| `smartmoving jobs materials add` | WRITE | [Reference](/commands/jobs/materials-add/) | Add estimated materials to a job. Premium tier endpoint. Materials are items like boxes, tape, wrapping paper, etc. that will be used during the job. Use get_tariff_materials to find valid material IDs for the opportunity's tariff. |
