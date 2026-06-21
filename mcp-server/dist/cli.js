#!/usr/bin/env node
import { Command, Option } from "commander";
import { SmartMovingClient } from "./client.js";
import { formatError, formatHuman, formatJson } from "./cli/format.js";
function requireClient() {
    const apiKey = process.env.SMARTMOVING_API_KEY;
    if (!apiKey) {
        throw new Error("SMARTMOVING_API_KEY environment variable is required. Set it in your shell or agent environment; do not pass API keys as CLI arguments.");
    }
    return new SmartMovingClient({
        apiKey,
        baseUrl: process.env.SMARTMOVING_BASE_URL,
    });
}
function positiveInteger(value, label) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`${label} must be a positive integer.`);
    }
    return parsed;
}
function jsonOption() {
    return new Option("--json", "print machine-readable JSON output");
}
async function runRead(label, options, action) {
    try {
        const result = await action(requireClient());
        console.log(options.json ? formatJson(result) : formatHuman(label, result));
    }
    catch (error) {
        console.error(`Error: ${formatError(error)}`);
        process.exitCode = 1;
    }
}
function dueDateOf(followup) {
    if (!followup || typeof followup !== "object") {
        return null;
    }
    const record = followup;
    const raw = record.dueDateTime ?? record.dueDate ?? record.dueAtUtc ?? record.dueAt;
    if (typeof raw !== "string") {
        return null;
    }
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}
function isCompleted(followup) {
    if (!followup || typeof followup !== "object") {
        return false;
    }
    const record = followup;
    return record.completed === true || record.isCompleted === true || Boolean(record.completedAtUtc);
}
function filterDueFollowups(value, now, includeCompleted) {
    const list = Array.isArray(value)
        ? value
        : value && typeof value === "object" && Array.isArray(value.items)
            ? value.items
            : null;
    if (!list) {
        return value;
    }
    return list.filter((followup) => {
        const dueDate = dueDateOf(followup);
        if (!dueDate || dueDate.getTime() > now.getTime()) {
            return false;
        }
        return includeCompleted || !isCompleted(followup);
    });
}
const program = new Command();
program
    .name("smartmoving")
    .description("Read-only CLI for the SmartMoving External API v1")
    .version("0.1.0")
    .showHelpAfterError()
    .showSuggestionAfterError();
program
    .command("ping")
    .description("Verify SmartMoving API connectivity and authentication.")
    .addOption(jsonOption())
    .action((options) => runRead("Ping", options, (client) => client.get("/api/ping")));
const reference = program.command("reference").description("Read SmartMoving reference data.");
reference
    .command("branches")
    .description("List SmartMoving branches/office locations.")
    .addOption(jsonOption())
    .action((options) => runRead("Branches", options, (client) => client.get("/api/branches")));
reference
    .command("move-sizes")
    .description("List SmartMoving move size reference values.")
    .addOption(jsonOption())
    .action((options) => runRead("Move sizes", options, (client) => client.get("/api/move-sizes")));
const customers = program.command("customers").description("Read customer records.");
customers
    .command("get")
    .description("Get a customer by UUID.")
    .argument("<customerId>", "customer UUID")
    .addOption(jsonOption())
    .action((customerId, options) => runRead("Customer", options, (client) => client.get(`/api/customers/${customerId}`)));
const leads = program.command("leads").description("Read lead records.");
leads
    .command("list")
    .description("List leads with pagination.")
    .option("--page <page>", "page number", "1")
    .option("--page-size <pageSize>", "records per page, max 100", "25")
    .addOption(jsonOption())
    .action((options) => runRead("Leads", options, (client) => {
    const page = positiveInteger(options.page ?? "1", "--page");
    const pageSize = positiveInteger(options.pageSize ?? "25", "--page-size");
    if (pageSize > 100) {
        throw new Error("--page-size must be 100 or less.");
    }
    return client.get("/api/leads", { page, pageSize });
}));
const opportunities = program.command("opportunities").description("Read opportunity records.");
opportunities
    .command("get")
    .description("Get an opportunity by UUID.")
    .argument("<opportunityId>", "opportunity UUID")
    .option("--include-jobs", "include job details")
    .option("--include-follow-ups", "include follow-ups")
    .option("--include-payments", "include payments")
    .option("--include-documents", "include documents")
    .option("--include-rooms", "include room inventory")
    .option("--include-audit", "include audit activity")
    .addOption(jsonOption())
    .action((opportunityId, options) => runRead("Opportunity", options, (client) => client.get(`/api/opportunities/${opportunityId}`, {
    IncludeJobs: options.includeJobs,
    IncludeFollowUps: options.includeFollowUps,
    IncludePayments: options.includePayments,
    IncludeDocuments: options.includeDocuments,
    IncludeRooms: options.includeRooms,
    IncludeAudit: options.includeAudit,
})));
const jobs = program.command("jobs").description("Read job records.");
jobs
    .command("get")
    .description("Get a premium job by UUID. SmartMoving requires the parent opportunity UUID.")
    .argument("<jobId>", "job UUID")
    .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API")
    .option("--include-estimated-charges", "include estimated charge lines")
    .option("--include-actual-charges", "include actual charge lines")
    .option("--include-estimated-materials", "include estimated materials")
    .option("--include-actual-materials", "include actual materials")
    .option("--include-stops", "include stops")
    .option("--include-dispatch-info", "include dispatch information")
    .option("--include-charges", "include SmartMoving catch-all charges")
    .option("--include-notes", "include notes")
    .addOption(jsonOption())
    .action((jobId, options) => runRead("Job", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}`, {
    IncludeEstimatedCharges: options.includeEstimatedCharges,
    IncludeActualCharges: options.includeActualCharges,
    IncludeEstimatedMaterials: options.includeEstimatedMaterials,
    IncludeActualMaterials: options.includeActualMaterials,
    IncludeStops: options.includeStops,
    IncludeDispatchInfo: options.includeDispatchInfo,
    IncludeCharges: options.includeCharges,
    IncludeNotes: options.includeNotes,
})));
const followups = program.command("followups").description("Read follow-up records.");
followups
    .command("due")
    .description("List due follow-ups for one opportunity. Account-wide due follow-ups are not exposed by the current SmartMoving v1 API spec.")
    .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect")
    .option("--now <isoDateTime>", "compare against this ISO date/time instead of the current time")
    .option("--include-completed", "include completed follow-ups")
    .addOption(jsonOption())
    .action((options) => runRead("Due follow-ups", options, async (client) => {
    const now = options.now ? new Date(options.now) : new Date();
    if (Number.isNaN(now.getTime())) {
        throw new Error("--now must be a valid ISO date/time.");
    }
    const result = await client.get(`/api/premium/opportunities/${options.opportunityId}/followups`);
    return filterDueFollowups(result, now, options.includeCompleted === true);
}));
program.parseAsync(process.argv).catch((error) => {
    console.error(`Error: ${formatError(error)}`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map