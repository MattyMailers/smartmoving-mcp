---
title: "inventory commands"
description: "Generated SmartMoving inventory command reference with safety levels and examples."
---

# inventory commands

Generated from [schema.json](/schema.json). Start agents with `smartmoving doctor --json` and `smartmoving schema --json`; prefer read-only operations before any write.

| Command | Safety | Docs | Description |
| --- | --- | --- | --- |
| `smartmoving inventory opportunity` | READ | [Reference](/commands/inventory/opportunity/) | Get the full inventory for an opportunity. Premium tier endpoint. Returns all rooms and their inventory items with quantities, weights, and volumes. This gives a complete picture of what the customer is moving. |
| `smartmoving inventory add-inventory-items` | WRITE | [Reference](/commands/inventory/add-inventory-items/) | Add inventory items to a specific room in an opportunity. Premium tier endpoint. Items reference the master inventory catalog (use get_master_inventory to find valid item IDs). Each item needs a masterInventoryItemId and a quantity. |
| `smartmoving inventory update-inventory-item` | WRITE | [Reference](/commands/inventory/update-inventory-item/) | Update an existing inventory item in a room. Premium tier endpoint. Use this to change the quantity or notes for an item already in the inventory. |
| `smartmoving inventory remove-item` | DESTRUCTIVE | [Reference](/commands/inventory/remove-item/) | Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory. |
| `smartmoving inventory submit-review` | WRITE | [Reference](/commands/inventory/submit-review/) | Submit the inventory for review / finalization. Premium tier endpoint. Call this after all inventory items have been added and the inventory is complete. This typically triggers weight/volume calculations and may affect pricing. |
| `smartmoving inventory master` | READ | [Reference](/commands/inventory/master/) | Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items. |
| `smartmoving inventory room-types` | READ | [Reference](/commands/inventory/room-types/) | Get all available room types. Premium tier endpoint. Returns the catalog of room types (e.g. 'Living Room', 'Master Bedroom', 'Kitchen', 'Garage') that can be used when creating rooms for an opportunity's inventory. |
