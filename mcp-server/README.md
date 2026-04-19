# SmartMoving MCP Server

An MCP (Model Context Protocol) server that exposes the SmartMoving External API v1 as tools for AI assistants. This allows Claude and other MCP-compatible AI assistants to interact with a SmartMoving moving company CRM -- managing customers, leads, opportunities, jobs, inventory, follow-ups, and more.

## Prerequisites

- **Node.js 18+** (uses native `fetch`)
- **SmartMoving API key** (obtain from your SmartMoving account settings)
- **npm** or another Node.js package manager

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SMARTMOVING_API_KEY` | Yes | Your SmartMoving External API key |
| `SMARTMOVING_BASE_URL` | No | Override the base URL (default: `https://api-public.smartmoving.com/v1`) |

## Running

```bash
# Set your API key
export SMARTMOVING_API_KEY=your-api-key-here

# Production (compiled)
npm start

# Development (ts-node)
npm run dev
```

## Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "smartmoving": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SMARTMOVING_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

On macOS, the config file is at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

On Windows:
`%APPDATA%\Claude\claude_desktop_config.json`

## Available Tools (55 total)

### Customer Tools (8)

| Tool | Tier | Description |
|---|---|---|
| `list_customers` | Basic | List customers with pagination and optional date filters |
| `get_customer` | Basic | Get a single customer by ID |
| `search_customers` | Premium | Search customers by name, phone, or email (min 3 chars) |
| `create_customer` | Premium | Create a new customer record |
| `update_customer` | Premium | Update an existing customer |
| `get_customer_opportunities` | Basic | List all opportunities for a customer |
| `get_customer_storage_accounts` | Basic | List storage accounts for a customer |
| `get_customer_service_tickets` | Premium | List service tickets for a customer |

### Lead Tools (8)

| Tool | Tier | Description |
|---|---|---|
| `list_leads` | Basic | List leads with pagination |
| `get_lead` | Basic | Get a single lead by ID |
| `create_lead` | Premium | Create a new lead (requires referralSourceId) |
| `update_lead` | Premium | Full update of a lead (PUT) |
| `patch_lead` | Premium | Partial update of a lead (PATCH) |
| `get_leads_by_salesperson` | Premium | List leads assigned to a salesperson |
| `convert_lead_to_opportunity` | Premium | Convert a lead into an opportunity |
| `get_lead_statuses` | Basic | Get all possible lead status values |

### Opportunity Tools (9)

| Tool | Tier | Description |
|---|---|---|
| `get_opportunity` | Basic | Get opportunity details with optional includes |
| `get_opportunity_by_quote` | Basic | Look up opportunity by quote number |
| `create_opportunity` | Premium | Create a new opportunity directly |
| `update_opportunity` | Premium | Partial update of an opportunity (PATCH) |
| `get_opportunity_audit` | Basic | Get audit trail / activity log |
| `get_opportunity_documents` | Premium | List attached documents |
| `get_opportunity_payments` | Basic | List payment records |
| `add_attachment` | Premium | Upload a file attachment |
| `create_rooms` | Premium | Create rooms for inventory |

### Job Tools (8)

| Tool | Tier | Description |
|---|---|---|
| `get_jobs_by_opportunity` | Basic | List all jobs for an opportunity |
| `get_job` | Premium | Get detailed job information |
| `create_job` | Premium | Add a new job to an opportunity |
| `delete_job` | Premium | Remove a job |
| `confirm_job` | Premium | Confirm a scheduled job |
| `update_job_notes` | Premium | Update job notes |
| `update_job_stops` | Premium | Replace all stops on a job |
| `add_job_materials` | Premium | Add estimated materials to a job |

### Inventory Tools (7)

| Tool | Tier | Description |
|---|---|---|
| `get_opportunity_inventory` | Premium | Get full inventory for an opportunity |
| `add_inventory_items` | Premium | Add items to a room |
| `update_inventory_item` | Premium | Update item quantity/notes |
| `remove_inventory_item` | Premium | Remove an item from a room |
| `submit_inventory_review` | Premium | Submit inventory for review |
| `get_master_inventory` | Premium | Get the master inventory catalog |
| `get_room_types` | Premium | Get all available room types |

### Follow-Up Tools (6)

| Tool | Tier | Description |
|---|---|---|
| `list_followups` | Premium | List follow-ups for an opportunity |
| `get_followup` | Premium | Get a specific follow-up |
| `create_followup` | Premium | Schedule a new follow-up |
| `update_followup` | Premium | Update an existing follow-up |
| `delete_followup` | Premium | Delete a follow-up |
| `complete_followup` | Premium | Mark a follow-up as complete |

### Communication Tools (2)

| Tool | Tier | Description |
|---|---|---|
| `log_call` | Premium | Log a phone call on an opportunity |
| `log_note` | Premium | Log a note on an opportunity |

### Reference Data Tools (12)

| Tool | Tier | Description |
|---|---|---|
| `get_branches` | Basic | Get all branch locations |
| `get_move_sizes` | Basic | Get move size options |
| `get_referral_sources` | Basic | Get referral source options (needed for creating leads/opportunities) |
| `get_service_types` | Basic | Get service type options |
| `get_tariffs` | Basic | Get tariff/rate sheet options |
| `get_tariff_materials` | Premium | Get materials for a tariff |
| `get_users` | Basic | Get all users (salespeople, etc.) |
| `get_arrival_windows` | Basic | Get arrival window options |
| `get_bad_lead_reasons` | Basic | Get bad lead reason options |
| `get_cancellation_reasons` | Basic | Get cancellation reason options |
| `get_lost_reasons` | Basic | Get lost reason options |
| `ping` | Basic | Health check / verify API key |

## Usage Examples

### Verify API connection
> "Ping the SmartMoving API to make sure my key works."

### Look up a customer
> "Search SmartMoving for a customer named 'Johnson'."

### Create a new lead
> "Create a new lead in SmartMoving for John Smith, phone 555-123-4567, moving from 123 Main St, Austin TX to 456 Oak Ave, Dallas TX on March 15, 2025. They found us on Google."

### Check an opportunity
> "Get me the details for SmartMoving quote Q-10042, including all jobs and payments."

### Log a call
> "Log an outbound call on opportunity abc-123 that connected. We discussed the move date and confirmed March 15. Duration was 5 minutes."

### Schedule a follow-up
> "Create a follow-up callback on opportunity abc-123 for tomorrow at 2pm, assigned to sales rep Jane Doe. Notes: confirm packing date."

## Key Enums Reference

### Opportunity Status
| Value | Name |
|---|---|
| 0 | NewLead |
| 1 | LeadInProgress |
| 3 | Opportunity |
| 4 | Booked |
| 10 | Completed |
| 11 | Closed |
| 20 | Cancelled |
| 30 | Lost |
| 50 | BadLead |

### Job Type
| Value | Name |
|---|---|
| 1 | Moving |
| 3 | Packing |
| 4 | MovingAndPacking |
| 5 | LoadOnly |
| 6 | UnloadOnly |
| 7 | Commercial |
| 8 | StorageInBound |
| 9 | StorageOutBound |
| 10 | InnerHouse |
| 11 | JunkRemoval |
| 12 | LaborOnly |

### Follow-Up Type
| Value | Name |
|---|---|
| 0 | Email |
| 1 | Call |
| 2 | Text |
| 3 | Other |
| 4 | CMET |

### Call Outcome
| Value | Name |
|---|---|
| 0 | NoAnswer |
| 1 | Busy |
| 2 | WrongNumber |
| 3 | LeftLiveMessage |
| 4 | LeftVoicemail |
| 5 | Connected |
| 6 | NumberDisconnected |

### Property Type
| Value | Name |
|---|---|
| 1 | Apartment |
| 2 | House |
| 3 | Commercial |
| 4 | Storage |
| 5 | Warehouse |
| 6 | AssistedLiving |
| 7 | HighRise |
| 8 | TownHouse |
| 10 | Other |

## API Tiers

- **Basic** tier: Read-only access to most resources
- **Premium** tier: Full CRUD operations including creating leads, opportunities, managing inventory, logging calls, and more

If your API key only has Basic tier access, Premium-tier tools will return authorization errors.

## Troubleshooting

1. **"SMARTMOVING_API_KEY environment variable is required"** -- Set the environment variable before starting the server.
2. **401 Unauthorized errors** -- Your API key is invalid or expired. Check your SmartMoving account settings.
3. **403 Forbidden errors** -- Your API key does not have Premium tier access for the endpoint you are trying to use.
4. **Build errors** -- Make sure you have Node.js 18+ and ran `npm install` before `npm run build`.
