#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stderr as output } from "node:process";
import { Command, Option } from "commander";
import { SmartMovingClient } from "./client.js";
import { configPath, DEFAULT_API_KEY_ENV, DEFAULT_BASE_URL, writeInitialConfig } from "./cli/config.js";
import { runDoctor } from "./cli/doctor.js";
import { formatError, formatHuman, formatJson } from "./cli/format.js";
import { registerSchemaCommand } from "./operations/register-cli.js";
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
function profileOption() {
    return new Option("--profile <name>", "SmartMoving CLI config profile");
}
function addReadOptions(command) {
    return command
        .addOption(jsonOption())
        .addOption(new Option("--plain", "prefer plain text output"))
        .addOption(new Option("--quiet", "suppress non-essential stderr messages"))
        .addOption(new Option("--verbose", "print extra diagnostic detail where supported"));
}
function wantsJson(options) {
    return options.json === true || program.opts().json === true;
}
function printResult(label, value, options) {
    console.log(wantsJson(options) ? formatJson(value) : formatHuman(label, value));
}
function printReadResult(label, value, options) {
    console.log(wantsJson(options) ? formatJson({ ok: true, data: value }) : formatHuman(label, value));
}
async function runRead(label, options, action) {
    try {
        const result = await action(requireClient());
        printReadResult(label, result, options);
    }
    catch (error) {
        if (wantsJson(options)) {
            console.log(formatJson({ ok: false, error: { code: "READ_FAILED", message: formatError(error) } }));
        }
        else {
            console.error(`Error: ${formatError(error)}`);
        }
        process.exitCode = 1;
    }
}
async function promptDefault(question, defaultValue) {
    const reader = createInterface({ input, output });
    try {
        const answer = await reader.question(`${question} (${defaultValue}): `);
        return answer.trim() || defaultValue;
    }
    finally {
        reader.close();
    }
}
async function runInit(options) {
    try {
        let profile = options.profile ?? program.opts().profile ?? "default";
        let apiKeyEnv = options.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
        let baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
        if (!options.yes) {
            profile = await promptDefault("Profile name", profile);
            apiKeyEnv = await promptDefault("API key environment variable", apiKeyEnv);
            baseUrl = await promptDefault("Base URL", baseUrl);
        }
        if (options.apiKeyStdin) {
            if (!options.quiet) {
                console.error("Note: --api-key-stdin validates that a key was provided, but raw API keys are never stored in config.");
            }
            for await (const _chunk of input) {
                break;
            }
        }
        const path = configPath();
        const config = await writeInitialConfig({ profile, apiKeyEnv, baseUrl }, path);
        const result = { ok: true, configPath: path, profile: config.defaultProfile, apiKeyEnv: config.profiles[config.defaultProfile]?.apiKeyEnv };
        printResult("Initialized SmartMoving CLI config", result, options);
        if (options.runDoctor) {
            const doctor = await runDoctor({ profile: config.defaultProfile });
            printResult("Doctor", doctor, options);
            if (!doctor.ok) {
                process.exitCode = 1;
            }
        }
    }
    catch (error) {
        if (options.json) {
            console.log(formatJson({ ok: false, error: { code: "INIT_FAILED", message: formatError(error), hint: "Check the init options and try again." } }));
        }
        else {
            console.error(`Error: ${formatError(error)}`);
        }
        process.exitCode = 1;
    }
}
function mcpJsonConfig() {
    return {
        mcpServers: {
            smartmoving: {
                command: "npx",
                args: ["-y", "smartmoving-mcp-server"],
                env: {
                    SMARTMOVING_API_KEY: "${SMARTMOVING_API_KEY}",
                    SMARTMOVING_ALLOW_WRITES: "false",
                },
            },
        },
    };
}
function printMcpConfig(options) {
    if (options.printHermes) {
        console.log(`mcp_servers:\n  smartmoving:\n    command: "npx"\n    args:\n      - "-y"\n      - "smartmoving-mcp-server"\n    env:\n      SMARTMOVING_API_KEY: "\${SMARTMOVING_API_KEY}"\n      SMARTMOVING_ALLOW_WRITES: "false"\n    timeout: 120\n    connect_timeout: 60`);
        return;
    }
    if (options.printClaude) {
        console.log(formatJson(mcpJsonConfig()));
        return;
    }
    console.log(formatJson(mcpJsonConfig()));
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
    .addOption(jsonOption())
    .addOption(new Option("--plain", "prefer plain text output for commands that support it"))
    .addOption(new Option("--quiet", "suppress non-essential stderr messages"))
    .addOption(new Option("--verbose", "print extra diagnostic detail where supported"))
    .addOption(new Option("--no-color", "disable color output"))
    .addOption(profileOption())
    .showHelpAfterError()
    .showSuggestionAfterError();
program
    .command("init")
    .description("Create SmartMoving CLI config without storing raw API keys.")
    .addOption(jsonOption())
    .addOption(profileOption())
    .option("--api-key-env <name>", "environment variable that will hold the API key", DEFAULT_API_KEY_ENV)
    .option("--api-key-stdin", "read an API key from stdin for validation only; the raw key is not stored")
    .option("--base-url <url>", "SmartMoving API base URL", DEFAULT_BASE_URL)
    .option("--yes", "accept defaults and do not prompt")
    .option("--run-doctor", "run doctor after writing config")
    .action((options) => runInit(options));
program
    .command("doctor")
    .description("Check local SmartMoving CLI/MCP configuration and API connectivity.")
    .addOption(jsonOption())
    .addOption(profileOption())
    .action(async (options) => {
    const result = await runDoctor({ profile: options.profile ?? program.opts().profile });
    printResult("Doctor", result, options);
    if (!result.ok) {
        process.exitCode = 1;
    }
});
registerSchemaCommand(program, { jsonOption, printResult });
const mcp = program.command("mcp").description("Print MCP client configuration helpers.");
mcp
    .command("config")
    .description("Print MCP config snippets that reference environment variables, never raw API keys.")
    .option("--print-hermes", "print a Hermes YAML snippet")
    .option("--print-claude", "print a Claude Desktop JSON snippet")
    .option("--print-json", "print generic MCP JSON")
    .action((options) => printMcpConfig(options));
addReadOptions(program
    .command("ping")
    .description("Verify SmartMoving API connectivity and authentication."))
    .action((options) => runRead("Ping", options, (client) => client.get("/api/ping")));
const reference = program.command("reference").description("Read SmartMoving reference data.");
async function getAllReferenceData(client) {
    const [branches, moveSizes, referralSources, serviceTypes, tariffs, users, arrivalWindows, badLeadReasons, cancellationReasons, lostReasons] = await Promise.all([
        client.get("/api/branches"),
        client.get("/api/move-sizes"),
        client.get("/api/referral-sources"),
        client.get("/api/service-types"),
        client.get("/api/tariffs"),
        client.get("/api/users"),
        client.get("/api/arrival-windows"),
        client.get("/api/bad-lead-reasons"),
        client.get("/api/cancellation-reasons"),
        client.get("/api/lost-reasons"),
    ]);
    return { branches, moveSizes, referralSources, serviceTypes, tariffs, users, arrivalWindows, badLeadReasons, cancellationReasons, lostReasons };
}
addReadOptions(reference
    .command("all")
    .description("Fetch commonly used SmartMoving reference data in one read-only response."))
    .action((options) => runRead("Reference data", options, (client) => getAllReferenceData(client)));
addReadOptions(reference
    .command("branches")
    .description("List SmartMoving branches/office locations."))
    .action((options) => runRead("Branches", options, (client) => client.get("/api/branches")));
addReadOptions(reference
    .command("move-sizes")
    .description("List SmartMoving move size reference values."))
    .action((options) => runRead("Move sizes", options, (client) => client.get("/api/move-sizes")));
for (const [commandName, label, path] of [
    ["referral-sources", "Referral sources", "/api/referral-sources"],
    ["service-types", "Service types", "/api/service-types"],
    ["tariffs", "Tariffs", "/api/tariffs"],
    ["users", "Users", "/api/users"],
    ["arrival-windows", "Arrival windows", "/api/arrival-windows"],
    ["bad-lead-reasons", "Bad lead reasons", "/api/bad-lead-reasons"],
    ["cancellation-reasons", "Cancellation reasons", "/api/cancellation-reasons"],
    ["lost-reasons", "Lost reasons", "/api/lost-reasons"],
]) {
    addReadOptions(reference.command(commandName).description(`Read SmartMoving ${label.toLowerCase()}.`))
        .action((options) => runRead(label, options, (client) => client.get(path)));
}
addReadOptions(reference
    .command("tariff-materials")
    .description("List materials available under a tariff.")
    .argument("<tariffId>", "tariff UUID"))
    .action((tariffId, options) => runRead("Tariff materials", options, (client) => client.get(`/api/premium/tariffs/${tariffId}/materials`)));
const customers = program.command("customers").description("Read customer records.");
addReadOptions(customers
    .command("list")
    .description("List customers with pagination.")
    .option("--page <page>", "page number", "1")
    .option("--page-size <pageSize>", "records per page, max 100", "25")
    .option("--from-service-date <date>", "filter customers with service on or after this ISO date")
    .option("--to-service-date <date>", "filter customers with service on or before this ISO date")
    .option("--include-opportunity-info", "include opportunity count and revenue summary"))
    .action((options) => runRead("Customers", options, (client) => {
    const page = positiveInteger(options.page ?? "1", "--page");
    const pageSize = positiveInteger(options.pageSize ?? "25", "--page-size");
    if (pageSize > 100) {
        throw new Error("--page-size must be 100 or less.");
    }
    return client.get("/api/customers", {
        Page: page,
        PageSize: pageSize,
        FromServiceDate: options.fromServiceDate,
        ToServiceDate: options.toServiceDate,
        IncludeOpportunityInfo: options.includeOpportunityInfo === true,
    });
}));
addReadOptions(customers
    .command("get")
    .description("Get a customer by UUID.")
    .argument("<customerId>", "customer UUID"))
    .action((customerId, options) => runRead("Customer", options, (client) => client.get(`/api/customers/${customerId}`)));
addReadOptions(customers
    .command("search")
    .description("Search customers by name, phone, or email.")
    .argument("<query>", "search query, at least 3 characters"))
    .action((query, options) => runRead("Customers", options, (client) => client.get("/api/premium/customers/search", { searchQuery: query })));
for (const [commandName, label, pathFor] of [
    ["opportunities", "Customer opportunities", (customerId) => `/api/customers/${customerId}/opportunities`],
    ["storage-accounts", "Customer storage accounts", (customerId) => `/api/customers/${customerId}/storage-accounts`],
    ["service-tickets", "Customer service tickets", (customerId) => `/api/premium/customers/${customerId}/service-tickets`],
]) {
    addReadOptions(customers.command(commandName).description(`Read ${label.toLowerCase()}.`).argument("<customerId>", "customer UUID"))
        .action((customerId, options) => runRead(label, options, (client) => client.get(pathFor(customerId))));
}
const leads = program.command("leads").description("Read lead records.");
addReadOptions(leads
    .command("list")
    .description("List leads with pagination.")
    .option("--page <page>", "page number", "1")
    .option("--page-size <pageSize>", "records per page, max 100", "25"))
    .action((options) => runRead("Leads", options, (client) => {
    const page = positiveInteger(options.page ?? "1", "--page");
    const pageSize = positiveInteger(options.pageSize ?? "25", "--page-size");
    if (pageSize > 100) {
        throw new Error("--page-size must be 100 or less.");
    }
    return client.get("/api/leads", { page, pageSize });
}));
addReadOptions(leads
    .command("get")
    .description("Get a lead by UUID.")
    .argument("<leadId>", "lead UUID"))
    .action((leadId, options) => runRead("Lead", options, (client) => client.get(`/api/leads/${leadId}`)));
addReadOptions(leads
    .command("by-salesperson")
    .description("List leads assigned to a salesperson.")
    .argument("<userId>", "salesperson user UUID"))
    .action((userId, options) => runRead("Leads", options, (client) => client.get(`/api/premium/leads/sales/${userId}`)));
addReadOptions(leads
    .command("statuses")
    .description("List possible lead statuses."))
    .action((options) => runRead("Lead statuses", options, (client) => client.get("/api/leads/statuses")));
const opportunities = program.command("opportunities").description("Read opportunity records.");
addReadOptions(opportunities
    .command("get")
    .description("Get an opportunity by UUID.")
    .argument("<opportunityId>", "opportunity UUID")
    .option("--include-jobs", "include job details")
    .option("--include-follow-ups", "include follow-ups")
    .option("--include-payments", "include payments")
    .option("--include-documents", "include documents")
    .option("--include-rooms", "include room inventory")
    .option("--include-audit", "include audit activity"))
    .action((opportunityId, options) => runRead("Opportunity", options, (client) => client.get(`/api/opportunities/${opportunityId}`, {
    IncludeJobs: options.includeJobs,
    IncludeFollowUps: options.includeFollowUps,
    IncludePayments: options.includePayments,
    IncludeDocuments: options.includeDocuments,
    IncludeRooms: options.includeRooms,
    IncludeAudit: options.includeAudit,
})));
addReadOptions(opportunities
    .command("by-quote")
    .description("Look up an opportunity by quote number.")
    .argument("<quoteNumber>", "quote number"))
    .action((quoteNumber, options) => runRead("Opportunity", options, (client) => client.get(`/api/opportunities/quote/${encodeURIComponent(quoteNumber)}`)));
for (const [commandName, label, pathFor] of [
    ["audit", "Opportunity audit", (opportunityId) => `/api/opportunities/${opportunityId}/audit-activity`],
    ["documents", "Opportunity documents", (opportunityId) => `/api/premium/opportunities/${opportunityId}/documents`],
    ["payments", "Opportunity payments", (opportunityId) => `/api/payments/opportunities/${opportunityId}`],
]) {
    addReadOptions(opportunities.command(commandName).description(`Read ${label.toLowerCase()}.`).argument("<opportunityId>", "opportunity UUID"))
        .action((opportunityId, options) => runRead(label, options, (client) => client.get(pathFor(opportunityId))));
}
const jobs = program.command("jobs").description("Read job records.");
addReadOptions(jobs
    .command("by-opportunity")
    .description("List all jobs for an opportunity.")
    .argument("<opportunityId>", "opportunity UUID"))
    .action((opportunityId, options) => runRead("Jobs", options, (client) => client.get(`/api/opportunities/${opportunityId}/jobs`)));
addReadOptions(jobs
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
    .option("--include-notes", "include notes"))
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
addReadOptions(jobs
    .command("notes")
    .description("Read all note fields on a job.")
    .argument("<jobId>", "job UUID")
    .requiredOption("--opportunity-id <opportunityId>", "parent opportunity UUID required by the SmartMoving API"))
    .action((jobId, options) => runRead("Job notes", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/jobs/${jobId}`, { IncludeNotes: true })));
const inventory = program.command("inventory").description("Read opportunity inventory data.");
addReadOptions(inventory
    .command("opportunity")
    .description("Get the full inventory for an opportunity.")
    .argument("<opportunityId>", "opportunity UUID"))
    .action((opportunityId, options) => runRead("Opportunity inventory", options, (client) => client.get(`/api/premium/opportunities/${opportunityId}/inventory`)));
addReadOptions(inventory
    .command("master")
    .description("Get the master inventory catalog."))
    .action((options) => runRead("Master inventory", options, (client) => client.get("/api/premium/inventory")));
addReadOptions(inventory
    .command("room-types")
    .description("Get available inventory room types."))
    .action((options) => runRead("Room types", options, (client) => client.get("/api/premium/room-types")));
const followups = program.command("followups").description("Read follow-up records.");
addReadOptions(followups
    .command("list")
    .description("List follow-ups for one opportunity.")
    .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect"))
    .action((options) => runRead("Follow-ups", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/followups`)));
addReadOptions(followups
    .command("get")
    .description("Get one follow-up for an opportunity.")
    .argument("<followupId>", "follow-up UUID")
    .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect"))
    .action((followupId, options) => runRead("Follow-up", options, (client) => client.get(`/api/premium/opportunities/${options.opportunityId}/followups/${followupId}`)));
addReadOptions(followups
    .command("due")
    .description("List due follow-ups for one opportunity. Account-wide due follow-ups are not exposed by the current SmartMoving v1 API spec.")
    .requiredOption("--opportunity-id <opportunityId>", "opportunity UUID to inspect")
    .option("--now <isoDateTime>", "compare against this ISO date/time instead of the current time")
    .option("--include-completed", "include completed follow-ups"))
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