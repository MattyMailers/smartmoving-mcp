import { z } from "zod";
const notImplementedHandler = async () => {
    throw new Error("Operation registry handlers are not wired yet; existing MCP tool modules and CLI commands remain the execution path.");
};
const emptyInputSchema = z.object({});
const operationMetadata = [
    {
        "name": "list_customers",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers list",
            "description": "List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range.",
            "examples": [
                "smartmoving customers list --json"
            ],
            "arguments": [],
            "options": ["page", "page-size", "from-service-date", "to-service-date", "include-opportunity-info"],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "list_customers",
            "description": "List customers with pagination. Returns a paginated list of customer records from SmartMoving. Use this to browse or iterate through all customers in the system. Supports filtering by service date range."
        }
    },
    {
        "name": "get_customer",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers get",
            "description": "Get detailed information about a specific customer by their ID. Returns full customer profile including contact info, address, notes, and dates.",
            "examples": [
                "smartmoving customers get --json"
            ],
            "arguments": [
                "customerId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_customer",
            "description": "Get detailed information about a specific customer by their ID. Returns full customer profile including contact info, address, notes, and dates."
        }
    },
    {
        "name": "search_customers",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers search",
            "description": "Search customers by name, phone, or email. Premium tier endpoint. The search query must be at least 3 characters. Use this when you need to find a customer by partial information rather than browsing the full list.",
            "examples": [
                "smartmoving customers search <query> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "search_customers",
            "description": "Search customers by name, phone, or email. Premium tier endpoint. The search query must be at least 3 characters. Use this when you need to find a customer by partial information rather than browsing the full list."
        }
    },
    {
        "name": "create_customer",
        "group": "customers",
        "safety": "write",
        "cli": {
            "command": "customers create",
            "description": "Create a new customer record in SmartMoving. Premium tier endpoint. At minimum a name (first/last or company) should be provided. Returns the created customer with its new ID.",
            "examples": [
                "smartmoving customers create-customer --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_customer",
            "description": "Create a new customer record in SmartMoving. Premium tier endpoint. At minimum a name (first/last or company) should be provided. Returns the created customer with its new ID."
        }
    },
    {
        "name": "update_customer",
        "group": "customers",
        "safety": "write",
        "cli": {
            "command": "customers update",
            "description": "Update an existing customer record. Premium tier endpoint. Provide the customer ID and any fields you want to change. Fields not included will remain unchanged.",
            "examples": [
                "smartmoving customers update-customer --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_customer",
            "description": "Update an existing customer record. Premium tier endpoint. Provide the customer ID and any fields you want to change. Fields not included will remain unchanged."
        }
    },
    {
        "name": "get_customer_opportunities",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers opportunities",
            "description": "List all opportunities (quotes/moves) associated with a specific customer. Returns an array of opportunity summaries for the given customer ID.",
            "examples": [
                "smartmoving customers opportunities <customerId> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_customer_opportunities",
            "description": "List all opportunities (quotes/moves) associated with a specific customer. Returns an array of opportunity summaries for the given customer ID."
        }
    },
    {
        "name": "get_customer_storage_accounts",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers storage-accounts",
            "description": "List storage accounts for a specific customer. Returns storage unit details, monthly rates, and account status for the customer.",
            "examples": [
                "smartmoving customers storage-accounts <customerId> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_customer_storage_accounts",
            "description": "List storage accounts for a specific customer. Returns storage unit details, monthly rates, and account status for the customer."
        }
    },
    {
        "name": "get_customer_service_tickets",
        "group": "customers",
        "safety": "read",
        "cli": {
            "command": "customers service-tickets",
            "description": "List service tickets for a specific customer. Premium tier endpoint. Returns any open or resolved service tickets (claims, complaints, etc.) for the customer.",
            "examples": [
                "smartmoving customers service-tickets <customerId> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_customer_service_tickets",
            "description": "List service tickets for a specific customer. Premium tier endpoint. Returns any open or resolved service tickets (claims, complaints, etc.) for the customer."
        }
    },
    {
        "name": "list_leads",
        "group": "leads",
        "safety": "read",
        "cli": {
            "command": "leads list",
            "description": "List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities.",
            "examples": [
                "smartmoving leads list --json"
            ],
            "arguments": [],
            "options": [
                "page",
                "page-size"
            ],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "list_leads",
            "description": "List leads with pagination. Returns a paginated list of lead records. Leads are prospective customers who have not yet been converted to opportunities."
        }
    },
    {
        "name": "get_lead",
        "group": "leads",
        "safety": "read",
        "cli": {
            "command": "leads get",
            "description": "Get detailed information about a specific lead by ID. Returns all lead details including contact info, move details, origin/destination addresses, and current status.",
            "examples": [
                "smartmoving leads get <leadId> --json"
            ],
            "arguments": [
                "leadId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_lead",
            "description": "Get detailed information about a specific lead by ID. Returns all lead details including contact info, move details, origin/destination addresses, and current status."
        }
    },
    {
        "name": "create_lead",
        "group": "leads",
        "safety": "write",
        "cli": {
            "command": "leads create",
            "description": "Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs.",
            "examples": [
                "smartmoving leads create-lead --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_lead",
            "description": "Create a new lead in SmartMoving. Premium tier endpoint. A lead represents a potential customer inquiry. You can provide either separate firstName/lastName fields or a combined 'name' field. The referralSourceId is required - use get_referral_sources to find valid IDs."
        }
    },
    {
        "name": "update_lead",
        "group": "leads",
        "safety": "write",
        "cli": {
            "command": "leads update",
            "description": "Fully update an existing lead record. Premium tier endpoint. This is a PUT operation - all fields will be set to the provided values (omitted fields may be cleared). For partial updates, use patch_lead instead.",
            "examples": [
                "smartmoving leads update-lead --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_lead",
            "description": "Fully update an existing lead record. Premium tier endpoint. This is a PUT operation - all fields will be set to the provided values (omitted fields may be cleared). For partial updates, use patch_lead instead."
        }
    },
    {
        "name": "patch_lead",
        "group": "leads",
        "safety": "write",
        "cli": {
            "command": "leads patch",
            "description": "Partially update an existing lead. Premium tier endpoint. Only the fields you provide will be modified; all other fields remain unchanged. Use this for small updates to a lead.",
            "examples": [
                "smartmoving leads patch-lead --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "patch_lead",
            "description": "Partially update an existing lead. Premium tier endpoint. Only the fields you provide will be modified; all other fields remain unchanged. Use this for small updates to a lead."
        }
    },
    {
        "name": "get_leads_by_salesperson",
        "group": "leads",
        "safety": "read",
        "cli": {
            "command": "leads by-salesperson",
            "description": "List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads.",
            "examples": [
                "smartmoving leads by-salesperson <userId> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_leads_by_salesperson",
            "description": "List leads assigned to a specific salesperson. Premium tier endpoint. Useful for viewing a sales rep's pipeline of uncontacted or in-progress leads."
        }
    },
    {
        "name": "convert_lead_to_opportunity",
        "group": "leads",
        "safety": "write",
        "cli": {
            "command": "leads convert-lead-to-opportunity",
            "description": "Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only.",
            "examples": [
                "smartmoving leads convert-lead-to-opportunity --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "convert_lead_to_opportunity",
            "description": "Convert a lead into an opportunity. Premium tier endpoint. SmartMoving requires a complete conversion payload, not just the lead ID: customerId, referralSourceId, tariffId, moveDate, moveSizeId, salesPersonId, and serviceTypeId are required. Use search_customers/create_customer, get_referral_sources, get_tariffs, get_move_sizes, get_users, and get_service_types first. Follow-up reminders can only be created after this conversion because follow-ups are opportunity-only."
        }
    },
    {
        "name": "get_lead_statuses",
        "group": "leads",
        "safety": "read",
        "cli": {
            "command": "leads statuses",
            "description": "Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes.",
            "examples": [
                "smartmoving leads statuses --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_lead_statuses",
            "description": "Get all possible lead status values. Returns the list of statuses a lead can be in (e.g. New, Contacted, Qualified, Lost, BadLead, Converted). Useful for understanding lead status codes."
        }
    },
    {
        "name": "get_opportunity",
        "group": "opportunities",
        "safety": "read",
        "cli": {
            "command": "opportunities get",
            "description": "Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses.",
            "examples": [
                "smartmoving opportunities get --json"
            ],
            "arguments": [
                "opportunityId"
            ],
            "options": [
                "include-jobs",
                "include-follow-ups",
                "include-payments",
                "include-documents",
                "include-rooms",
                "include-audit"
            ],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity",
            "description": "Get detailed information about a specific opportunity (quote/move). This is the core entity in SmartMoving representing a potential or booked move. Use the Include* boolean params to control which related data is returned (jobs, follow-ups, payments, documents, rooms). Including everything may result in large responses."
        }
    },
    {
        "name": "get_opportunity_by_quote",
        "group": "opportunities",
        "safety": "read",
        "cli": {
            "command": "opportunities by-quote",
            "description": "Look up an opportunity by its quote number (e.g. 'Q-12345'). Use this when you have a quote number but not the opportunity UUID. Returns the same detailed view as get_opportunity.",
            "examples": [
                "smartmoving opportunities by-quote <quoteNumber> --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity_by_quote",
            "description": "Look up an opportunity by its quote number (e.g. 'Q-12345'). Use this when you have a quote number but not the opportunity UUID. Returns the same detailed view as get_opportunity."
        }
    },
    {
        "name": "create_opportunity",
        "group": "opportunities",
        "safety": "write",
        "cli": {
            "command": "opportunities create",
            "description": "Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field.",
            "examples": [
                "smartmoving opportunities create-opportunity --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_opportunity",
            "description": "Create a new opportunity (quote) directly, bypassing the lead stage. Premium tier endpoint. An opportunity represents a potential move that can be priced, scheduled, and booked. The referralSourceId is required - use get_referral_sources to find valid IDs. You can provide either firstName/lastName or the combined 'name' field."
        }
    },
    {
        "name": "update_opportunity",
        "group": "opportunities",
        "safety": "write",
        "cli": {
            "command": "opportunities update",
            "description": "Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID.",
            "examples": [
                "smartmoving opportunities update-opportunity --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_opportunity",
            "description": "Update an existing opportunity. Premium tier endpoint. This is a PATCH operation - only the fields you provide will be modified. Use this to update customer info, move details, pricing, status changes, etc. To mark as lost/cancelled, set the status and provide the corresponding reason ID."
        }
    },
    {
        "name": "get_opportunity_audit",
        "group": "opportunities",
        "safety": "read",
        "cli": {
            "command": "opportunities audit",
            "description": "Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity.",
            "examples": [
                "smartmoving opportunities get-opportunity-audit --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity_audit",
            "description": "Get the audit trail / activity log for an opportunity. Shows a chronological history of all changes, status transitions, and actions performed on the opportunity."
        }
    },
    {
        "name": "get_opportunity_documents",
        "group": "opportunities",
        "safety": "read",
        "cli": {
            "command": "opportunities documents",
            "description": "List all documents attached to an opportunity. Premium tier endpoint. Returns file metadata including name, category, URL, and upload date.",
            "examples": [
                "smartmoving opportunities get-opportunity-documents --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity_documents",
            "description": "List all documents attached to an opportunity. Premium tier endpoint. Returns file metadata including name, category, URL, and upload date."
        }
    },
    {
        "name": "get_opportunity_payments",
        "group": "opportunities",
        "safety": "read",
        "cli": {
            "command": "opportunities payments",
            "description": "List all payments recorded for an opportunity. Returns payment details including type, amount, date, and reference numbers.",
            "examples": [
                "smartmoving opportunities get-opportunity-payments --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity_payments",
            "description": "List all payments recorded for an opportunity. Returns payment details including type, amount, date, and reference numbers."
        }
    },
    {
        "name": "add_attachment",
        "group": "opportunities",
        "safety": "write",
        "cli": {
            "command": "opportunities add-attachment",
            "description": "Upload a file attachment to an opportunity. Premium tier endpoint. The file must be provided as a base64-encoded string. Use fileCategory to classify the document type.",
            "examples": [
                "smartmoving opportunities add-attachment --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "add_attachment",
            "description": "Upload a file attachment to an opportunity. Premium tier endpoint. The file must be provided as a base64-encoded string. Use fileCategory to classify the document type."
        }
    },
    {
        "name": "create_rooms",
        "group": "opportunities",
        "safety": "write",
        "cli": {
            "command": "opportunities create-rooms",
            "description": "Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs.",
            "examples": [
                "smartmoving opportunities create-rooms --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_rooms",
            "description": "Create rooms for an opportunity's inventory. Premium tier endpoint. Rooms are used to organize inventory items (e.g. 'Living Room', 'Master Bedroom'). Use get_room_types to find valid room type IDs."
        }
    },
    {
        "name": "get_jobs_by_opportunity",
        "group": "jobs",
        "safety": "read",
        "cli": {
            "command": "jobs by-opportunity",
            "description": "List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days).",
            "examples": [
                "smartmoving jobs get-jobs-by-opportunity --json"
            ],
            "arguments": [
                "opportunityId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_jobs_by_opportunity",
            "description": "List all jobs for an opportunity. A job represents a specific service event (moving day, packing day, etc.) within an opportunity. An opportunity can have multiple jobs (e.g. separate packing and moving days)."
        }
    },
    {
        "name": "get_job",
        "group": "jobs",
        "safety": "read",
        "cli": {
            "command": "jobs get",
            "description": "Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs.",
            "examples": [
                "smartmoving jobs get --json"
            ],
            "arguments": [
                "jobId"
            ],
            "options": [
                "include-estimated-charges",
                "include-actual-charges",
                "include-estimated-materials",
                "include-actual-materials",
                "include-stops",
                "include-dispatch-info",
                "include-charges",
                "include-notes"
            ],
            "requiredOptions": [
                "opportunity-id"
            ]
        },
        "mcp": {
            "toolName": "get_job",
            "description": "Get detailed information about a specific job within an opportunity. Premium tier endpoint. Can include estimated/actual charges, estimated/actual materials, and stops. Use IncludeActualMaterials=true to pull supplies sold/used on completed jobs."
        }
    },
    {
        "name": "create_job",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs create-job",
            "description": "Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly.",
            "examples": [
                "smartmoving jobs create-job --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_job",
            "description": "Add a new job to an opportunity. Premium tier endpoint. Use this to schedule a moving day, packing day, or other service. Job types: 1=Moving, 3=Packing, 4=MovingAndPacking, 5=LoadOnly, 6=UnloadOnly, 7=Commercial, 8=StorageInBound, 9=StorageOutBound, 10=InnerHouse, 11=JunkRemoval, 12=LaborOnly."
        }
    },
    {
        "name": "delete_job",
        "group": "jobs",
        "safety": "destructive",
        "cli": {
            "command": "jobs delete-job",
            "description": "Delete a job from an opportunity. Premium tier endpoint. This permanently removes the job and its associated stops, materials, and crew assignments. Use with caution.",
            "examples": [
                "smartmoving jobs delete-job --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "delete_job",
            "description": "Delete a job from an opportunity. Premium tier endpoint. This permanently removes the job and its associated stops, materials, and crew assignments. Use with caution."
        }
    },
    {
        "name": "confirm_job",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs confirm-job",
            "description": "Confirm a job on an opportunity. Premium tier endpoint. Marks the job as confirmed, indicating the customer has agreed to the scheduled date and services.",
            "examples": [
                "smartmoving jobs confirm-job --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "confirm_job",
            "description": "Confirm a job on an opportunity. Premium tier endpoint. Marks the job as confirmed, indicating the customer has agreed to the scheduled date and services."
        }
    },
    {
        "name": "get_job_notes",
        "group": "jobs",
        "safety": "read",
        "cli": {
            "command": "jobs notes",
            "description": "Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text.",
            "examples": [
                "smartmoving jobs get-job-notes --json"
            ],
            "arguments": [
                "opportunityId",
                "jobId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_job_notes",
            "description": "Read all note fields on a specific job. This calls Premium job detail with IncludeNotes=true and returns crew, customer, internal, accounting, dispatcher notes, plus crew feedback when present. Use this before update_job_notes so you don't accidentally replace existing note text."
        }
    },
    {
        "name": "update_job_notes",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs notes update",
            "description": "Update one or more note fields on a specific job. Premium tier endpoint. SmartMoving PATCH updates the provided note properties only, but each provided field value replaces that field. To add text below existing notes, use append_job_note instead.",
            "examples": [
                "smartmoving jobs update-job-notes --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_job_notes",
            "description": "Update one or more note fields on a specific job. Premium tier endpoint. SmartMoving PATCH updates the provided note properties only, but each provided field value replaces that field. To add text below existing notes, use append_job_note instead."
        }
    },
    {
        "name": "append_job_note",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs notes append",
            "description": "Append text below an existing job note field without erasing the prior content. This reads the current notes, adds a blank line plus the new text, then PATCHes only the selected note field. Fails if the job is closed or SmartMoving rejects note updates.",
            "examples": [
                "smartmoving jobs append-job-note --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "append_job_note",
            "description": "Append text below an existing job note field without erasing the prior content. This reads the current notes, adds a blank line plus the new text, then PATCHes only the selected note field. Fails if the job is closed or SmartMoving rejects note updates."
        }
    },
    {
        "name": "update_job_stops",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs update-job-stops",
            "description": "Replace all stops on a job. Premium tier endpoint. This is a PUT operation that replaces the entire list of stops. Each stop has a type (PickUp=0 or DropOff=1) and an address. Use sortOrder to control the route sequence.",
            "examples": [
                "smartmoving jobs update-job-stops --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_job_stops",
            "description": "Replace all stops on a job. Premium tier endpoint. This is a PUT operation that replaces the entire list of stops. Each stop has a type (PickUp=0 or DropOff=1) and an address. Use sortOrder to control the route sequence."
        }
    },
    {
        "name": "add_job_materials",
        "group": "jobs",
        "safety": "write",
        "cli": {
            "command": "jobs add-job-materials",
            "description": "Add estimated materials to a job. Premium tier endpoint. Materials are items like boxes, tape, wrapping paper, etc. that will be used during the job. Use get_tariff_materials to find valid material IDs for the opportunity's tariff.",
            "examples": [
                "smartmoving jobs add-job-materials --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "add_job_materials",
            "description": "Add estimated materials to a job. Premium tier endpoint. Materials are items like boxes, tape, wrapping paper, etc. that will be used during the job. Use get_tariff_materials to find valid material IDs for the opportunity's tariff."
        }
    },
    {
        "name": "get_opportunity_inventory",
        "group": "inventory",
        "safety": "read",
        "cli": {
            "command": "inventory opportunity",
            "description": "Get the full inventory for an opportunity. Premium tier endpoint. Returns all rooms and their inventory items with quantities, weights, and volumes. This gives a complete picture of what the customer is moving.",
            "examples": [
                "smartmoving inventory get-opportunity-inventory --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_opportunity_inventory",
            "description": "Get the full inventory for an opportunity. Premium tier endpoint. Returns all rooms and their inventory items with quantities, weights, and volumes. This gives a complete picture of what the customer is moving."
        }
    },
    {
        "name": "add_inventory_items",
        "group": "inventory",
        "safety": "write",
        "cli": {
            "command": "inventory add-inventory-items",
            "description": "Add inventory items to a specific room in an opportunity. Premium tier endpoint. Items reference the master inventory catalog (use get_master_inventory to find valid item IDs). Each item needs a masterInventoryItemId and a quantity.",
            "examples": [
                "smartmoving inventory add-inventory-items --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "add_inventory_items",
            "description": "Add inventory items to a specific room in an opportunity. Premium tier endpoint. Items reference the master inventory catalog (use get_master_inventory to find valid item IDs). Each item needs a masterInventoryItemId and a quantity."
        }
    },
    {
        "name": "update_inventory_item",
        "group": "inventory",
        "safety": "write",
        "cli": {
            "command": "inventory update-inventory-item",
            "description": "Update an existing inventory item in a room. Premium tier endpoint. Use this to change the quantity or notes for an item already in the inventory.",
            "examples": [
                "smartmoving inventory update-inventory-item --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_inventory_item",
            "description": "Update an existing inventory item in a room. Premium tier endpoint. Use this to change the quantity or notes for an item already in the inventory."
        }
    },
    {
        "name": "remove_inventory_item",
        "group": "inventory",
        "safety": "destructive",
        "cli": {
            "command": "inventory remove-inventory-item",
            "description": "Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory.",
            "examples": [
                "smartmoving inventory remove-inventory-item --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "remove_inventory_item",
            "description": "Remove an inventory item from a room. Premium tier endpoint. Permanently deletes the item from the opportunity's inventory."
        }
    },
    {
        "name": "submit_inventory_review",
        "group": "inventory",
        "safety": "write",
        "cli": {
            "command": "inventory submit-inventory-review",
            "description": "Submit the inventory for review / finalization. Premium tier endpoint. Call this after all inventory items have been added and the inventory is complete. This typically triggers weight/volume calculations and may affect pricing.",
            "examples": [
                "smartmoving inventory submit-inventory-review --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "submit_inventory_review",
            "description": "Submit the inventory for review / finalization. Premium tier endpoint. Call this after all inventory items have been added and the inventory is complete. This typically triggers weight/volume calculations and may affect pricing."
        }
    },
    {
        "name": "get_master_inventory",
        "group": "inventory",
        "safety": "read",
        "cli": {
            "command": "inventory master",
            "description": "Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items.",
            "examples": [
                "smartmoving inventory get-master-inventory --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_master_inventory",
            "description": "Get the master inventory catalog. Premium tier endpoint. Returns all available inventory items that can be added to an opportunity (e.g. 'Sofa', 'Queen Bed', 'Box - Large'). Each item has a default weight and volume. Use the item IDs when calling add_inventory_items."
        }
    },
    {
        "name": "get_room_types",
        "group": "inventory",
        "safety": "read",
        "cli": {
            "command": "inventory room-types",
            "description": "Get all available room types. Premium tier endpoint. Returns the catalog of room types (e.g. 'Living Room', 'Master Bedroom', 'Kitchen', 'Garage') that can be used when creating rooms for an opportunity's inventory.",
            "examples": [
                "smartmoving inventory get-room-types --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_room_types",
            "description": "Get all available room types. Premium tier endpoint. Returns the catalog of room types (e.g. 'Living Room', 'Master Bedroom', 'Kitchen', 'Garage') that can be used when creating rooms for an opportunity's inventory."
        }
    },
    {
        "name": "list_followups",
        "group": "followups",
        "safety": "read",
        "cli": {
            "command": "followups list",
            "description": "List all follow-ups for an opportunity. Premium tier endpoint. Follow-ups are scheduled tasks like callbacks, emails to send, or in-home estimates. Returns both pending and completed follow-ups.",
            "examples": [
                "smartmoving followups list --json"
            ],
            "arguments": [
                "opportunityId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "list_followups",
            "description": "List all follow-ups for an opportunity. Premium tier endpoint. Follow-ups are scheduled tasks like callbacks, emails to send, or in-home estimates. Returns both pending and completed follow-ups."
        }
    },
    {
        "name": "get_followup",
        "group": "followups",
        "safety": "read",
        "cli": {
            "command": "followups get",
            "description": "Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes.",
            "examples": [
                "smartmoving followups get --json"
            ],
            "arguments": [
                "opportunityId",
                "followupId"
            ],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_followup",
            "description": "Get details of a specific follow-up. Premium tier endpoint. Returns full information including type, due date, assigned user, completion status, and notes."
        }
    },
    {
        "name": "create_followup",
        "group": "followups",
        "safety": "write",
        "cli": {
            "command": "followups create",
            "description": "Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime.",
            "examples": [
                "smartmoving followups create-followup --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "create_followup",
            "description": "Create a new follow-up task on an OPPORTUNITY. SmartMoving does not support lead-level follow-ups through this endpoint: convert the lead to an opportunity first. Use this to schedule a callback, email, text, or in-home estimate. Types: 0=Email, 1=Call, 2=Text, 3=Other, 4=CMET. Required API field names are type, title, assignedToId, and dueDateTime."
        }
    },
    {
        "name": "update_followup",
        "group": "followups",
        "safety": "write",
        "cli": {
            "command": "followups update",
            "description": "Update an existing follow-up. Premium tier endpoint. Use this to reschedule, reassign, change type, or update notes on a follow-up task.",
            "examples": [
                "smartmoving followups update-followup --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "update_followup",
            "description": "Update an existing follow-up. Premium tier endpoint. Use this to reschedule, reassign, change type, or update notes on a follow-up task."
        }
    },
    {
        "name": "delete_followup",
        "group": "followups",
        "safety": "destructive",
        "cli": {
            "command": "followups delete-followup",
            "description": "Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed.",
            "examples": [
                "smartmoving followups delete-followup --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "delete_followup",
            "description": "Delete a follow-up from an opportunity. Premium tier endpoint. Permanently removes the follow-up task. Use complete_followup instead if the task was actually performed."
        }
    },
    {
        "name": "complete_followup",
        "group": "followups",
        "safety": "write",
        "cli": {
            "command": "followups complete-followup",
            "description": "Mark a follow-up as complete. Premium tier endpoint. Use this when the scheduled callback, email, or task has been performed. The follow-up remains in the history but is flagged as completed.",
            "examples": [
                "smartmoving followups complete-followup --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "complete_followup",
            "description": "Mark a follow-up as complete. Premium tier endpoint. Use this when the scheduled callback, email, or task has been performed. The follow-up remains in the history but is flagged as completed."
        }
    },
    {
        "name": "log_call",
        "group": "communication",
        "safety": "write",
        "cli": {
            "command": "communication call",
            "description": "Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected.",
            "examples": [
                "smartmoving communication log-call --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "log_call",
            "description": "Log a phone call on an opportunity. Premium tier endpoint. Records an inbound or outbound call with its outcome. Use this to track all phone interactions with the customer. Call types: 0=Outbound, 1=Inbound. Outcomes: 0=NoAnswer, 1=Busy, 2=WrongNumber, 3=LeftLiveMessage, 4=LeftVoicemail, 5=Connected, 6=NumberDisconnected."
        }
    },
    {
        "name": "log_note",
        "group": "communication",
        "safety": "write",
        "cli": {
            "command": "communication note",
            "description": "Log a note on an opportunity. Premium tier endpoint. Use this to record any interaction, observation, or update that isn't a phone call. Notes appear in the opportunity's activity timeline.",
            "examples": [
                "smartmoving communication log-note --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "log_note",
            "description": "Log a note on an opportunity. Premium tier endpoint. Use this to record any interaction, observation, or update that isn't a phone call. Notes appear in the opportunity's activity timeline."
        }
    },
    {
        "name": "get_branches",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference branches",
            "description": "Get all branches (office locations) configured in SmartMoving. Branches are used to segment operations by location. Branch IDs are needed when creating leads, opportunities, or filtering data.",
            "examples": [
                "smartmoving reference branches --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_branches",
            "description": "Get all branches (office locations) configured in SmartMoving. Branches are used to segment operations by location. Branch IDs are needed when creating leads, opportunities, or filtering data."
        }
    },
    {
        "name": "get_move_sizes",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference move-sizes",
            "description": "Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities.",
            "examples": [
                "smartmoving reference move-sizes --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_move_sizes",
            "description": "Get all move size options (e.g. 'Studio', '1 Bedroom', '2-3 Bedroom', '4+ Bedroom'). Move sizes help categorize the scope of a move and are used when creating leads and opportunities."
        }
    },
    {
        "name": "get_referral_sources",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference referral-sources",
            "description": "Get all referral sources (how customers find the company). Examples: 'Google', 'Yelp', 'Referral', 'Website'. A referral source ID is REQUIRED when creating leads and opportunities. Always call this first to get valid IDs.",
            "examples": [
                "smartmoving reference get-referral-sources --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_referral_sources",
            "description": "Get all referral sources (how customers find the company). Examples: 'Google', 'Yelp', 'Referral', 'Website'. A referral source ID is REQUIRED when creating leads and opportunities. Always call this first to get valid IDs."
        }
    },
    {
        "name": "get_service_types",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference service-types",
            "description": "Get all service types offered (e.g. 'Local Moving', 'Long Distance', 'Packing Only', 'Storage'). Service type IDs are used when creating leads and opportunities to categorize the type of service requested.",
            "examples": [
                "smartmoving reference get-service-types --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_service_types",
            "description": "Get all service types offered (e.g. 'Local Moving', 'Long Distance', 'Packing Only', 'Storage'). Service type IDs are used when creating leads and opportunities to categorize the type of service requested."
        }
    },
    {
        "name": "get_tariffs",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference tariffs",
            "description": "Get all tariffs (rate sheets / pricing structures). Tariffs define hourly rates, minimums, and material pricing. A tariff ID can be assigned to an opportunity to control pricing. Each tariff may be tied to a specific branch.",
            "examples": [
                "smartmoving reference get-tariffs --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_tariffs",
            "description": "Get all tariffs (rate sheets / pricing structures). Tariffs define hourly rates, minimums, and material pricing. A tariff ID can be assigned to an opportunity to control pricing. Each tariff may be tied to a specific branch."
        }
    },
    {
        "name": "get_tariff_materials",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference tariff-materials",
            "description": "Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials.",
            "examples": [
                "smartmoving reference get-tariff-materials --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_tariff_materials",
            "description": "Get materials available under a specific tariff. Premium tier endpoint. Returns packing materials (boxes, tape, paper, etc.) with their unit prices. Material IDs are used when adding materials to jobs via add_job_materials."
        }
    },
    {
        "name": "get_users",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference users",
            "description": "Get all users in the SmartMoving account. Returns salespeople, dispatchers, managers, and other staff. User IDs are needed when assigning leads, opportunities, follow-ups, or filtering by salesperson.",
            "examples": [
                "smartmoving reference get-users --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_users",
            "description": "Get all users in the SmartMoving account. Returns salespeople, dispatchers, managers, and other staff. User IDs are needed when assigning leads, opportunities, follow-ups, or filtering by salesperson."
        }
    },
    {
        "name": "get_arrival_windows",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference arrival-windows",
            "description": "Get all arrival window options (e.g. '8AM-10AM', '10AM-12PM'). Arrival windows define the time range when the crew is expected to arrive at the customer's location. IDs are used when creating or updating opportunities.",
            "examples": [
                "smartmoving reference get-arrival-windows --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_arrival_windows",
            "description": "Get all arrival window options (e.g. '8AM-10AM', '10AM-12PM'). Arrival windows define the time range when the crew is expected to arrive at the customer's location. IDs are used when creating or updating opportunities."
        }
    },
    {
        "name": "get_bad_lead_reasons",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference bad-lead-reasons",
            "description": "Get all bad lead reason options. These are used when marking a lead as 'Bad Lead' to categorize why (e.g. 'Spam', 'Out of Service Area', 'Duplicate').",
            "examples": [
                "smartmoving reference get-bad-lead-reasons --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_bad_lead_reasons",
            "description": "Get all bad lead reason options. These are used when marking a lead as 'Bad Lead' to categorize why (e.g. 'Spam', 'Out of Service Area', 'Duplicate')."
        }
    },
    {
        "name": "get_cancellation_reasons",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference cancellation-reasons",
            "description": "Get all cancellation reason options. These are required when changing an opportunity's status to Cancelled (status=20). Examples: 'Customer Changed Plans', 'Price Too High', 'Went With Competitor'.",
            "examples": [
                "smartmoving reference get-cancellation-reasons --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_cancellation_reasons",
            "description": "Get all cancellation reason options. These are required when changing an opportunity's status to Cancelled (status=20). Examples: 'Customer Changed Plans', 'Price Too High', 'Went With Competitor'."
        }
    },
    {
        "name": "get_lost_reasons",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "reference lost-reasons",
            "description": "Get all lost reason options. These are required when changing an opportunity's status to Lost (status=30). Similar to cancellation reasons but for opportunities that were never booked.",
            "examples": [
                "smartmoving reference get-lost-reasons --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "get_lost_reasons",
            "description": "Get all lost reason options. These are required when changing an opportunity's status to Lost (status=30). Similar to cancellation reasons but for opportunities that were never booked."
        }
    },
    {
        "name": "ping",
        "group": "reference",
        "safety": "read",
        "cli": {
            "command": "ping",
            "description": "Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working.",
            "examples": [
                "smartmoving ping --json"
            ],
            "arguments": [],
            "options": [],
            "requiredOptions": []
        },
        "mcp": {
            "toolName": "ping",
            "description": "Health check endpoint. Use this to verify the SmartMoving API connection and that your API key is valid. Returns a simple success response if everything is working."
        }
    }
];
export const operationRegistry = operationMetadata.map((operation) => ({
    ...operation,
    inputSchema: emptyInputSchema,
    handler: notImplementedHandler,
}));
export function operationSchemaContract(filters = {}) {
    const operations = operationRegistry
        .filter((operation) => !filters.group || operation.group === filters.group)
        .filter((operation) => !filters.safety || operation.safety === filters.safety)
        .map((operation) => ({
        name: operation.name,
        group: operation.group,
        safety: operation.safety,
        description: operation.cli.description,
        cli: {
            command: operation.cli.command,
            description: operation.cli.description,
            examples: operation.cli.examples,
            arguments: operation.cli.arguments ?? [],
            options: operation.cli.options ?? [],
            requiredOptions: operation.cli.requiredOptions ?? [],
        },
        mcp: operation.mcp,
        outputModes: ["human", "json"],
        exitCodes: { success: 0, failure: 1 },
    }));
    return { ok: true, version: "0.1.0", operations };
}
//# sourceMappingURL=registry.js.map