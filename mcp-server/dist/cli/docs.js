import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { operationSchemaContract } from "../operations/registry.js";
const groupOrder = [
    "reference",
    "customers",
    "leads",
    "opportunities",
    "jobs",
    "inventory",
    "followups",
    "communication",
];
function safetyBadge(safety) {
    return safety.toUpperCase();
}
function safetyRequirement(safety) {
    if (safety === "read") {
        return "Read-only. Requires a valid API key from local `smartmoving init` credentials or `SMARTMOVING_API_KEY`; does not mutate SmartMoving data.";
    }
    if (safety === "write") {
        return "WRITE. Blocked unless `SMARTMOVING_ALLOW_WRITES=true` or `--allow-writes` is used. Prefer `--dry-run` before `--yes`.";
    }
    return "DESTRUCTIVE. Requires writes, `SMARTMOVING_ALLOW_DESTRUCTIVE=true`, and `--yes`. Prefer `--dry-run`; use only with explicit human approval.";
}
function commandPath(operation) {
    const parts = operation.cli.command.split(/\s+/).filter(Boolean);
    const group = parts.length > 1 ? parts[0] : operation.group;
    const leaf = parts.length > 1 ? parts.slice(1).join("-") : (parts[0] ?? operation.name.replace(/_/g, "-"));
    return join(group, `${leaf}.md`);
}
function commandDisplay(operation) {
    return `smartmoving ${operation.cli.command}`;
}
function formatList(values, empty = "None.") {
    if (!values || values.length === 0) {
        return empty;
    }
    return values.map((value) => `- \`${value}\``).join("\n");
}
function ensureExample(operation) {
    if (operation.cli.examples.length > 0) {
        return operation.cli.examples;
    }
    return [`${commandDisplay(operation)} --json`];
}
function renderCommandPage(operation) {
    const examples = ensureExample(operation)
        .map((example) => `\`\`\`bash\n${example}\n\`\`\``)
        .join("\n\n");
    return `# ${commandDisplay(operation)}\n\n${operation.description}\n\nSafety level: \`${safetyBadge(operation.safety)}\`\n\n${safetyRequirement(operation.safety)}\n\n## Arguments\n\n${formatList(operation.cli.arguments)}\n\n## Options\n\n${formatList(operation.cli.options)}\n\nRequired options:\n\n${formatList(operation.cli.requiredOptions)}\n\n## Examples\n\n${examples}\n\n## JSON output notes\n\nUse \`--json\` for machine-readable output. Successful read/write calls return \`{ "ok": true, "data": ... }\`. Dry-run writes return \`{ "ok": true, "dryRun": true, "request": ... }\`. Failures return \`{ "ok": false, "error": { "code": ..., "message": ... } }\` with API keys redacted.\n\n## Related MCP tool\n\nRelated MCP tool: \`${operation.mcp.toolName}\`\n\n${operation.mcp.description}\n\n## Failure modes\n\n- Missing or invalid \`SMARTMOVING_API_KEY\` returns an auth/read failure.\n- Basic-tier keys may receive \`403 Forbidden\` on Premium endpoints.\n- Invalid UUIDs, missing required options, or invalid JSON input return validation/client errors.\n- SmartMoving rate limits or transient API failures can return HTTP errors; retry cautiously and never duplicate writes without checking SmartMoving state.\n`;
}
function renderIndex(operations) {
    const byGroup = new Map();
    for (const operation of operations) {
        const list = byGroup.get(operation.group) ?? [];
        list.push(operation);
        byGroup.set(operation.group, list);
    }
    const sections = groupOrder
        .filter((group) => byGroup.has(group))
        .map((group) => {
        const entries = (byGroup.get(group) ?? [])
            .map((operation) => {
            const href = commandPath(operation).replace(/\\/g, "/");
            return `- [${safetyBadge(operation.safety)}] \`${commandDisplay(operation)}\` — [docs](./${href}) — ${operation.description}`;
        })
            .join("\n");
        return `## ${group}\n\n${entries}`;
    })
        .join("\n\n");
    return `# SmartMoving CLI Command Index\n\n> Generated from \`smartmoving schema --json\`. Do not edit command pages by hand; run \`smartmoving docs generate\` from \`mcp-server/\` after changing the operation registry.\n\nThe SmartMoving CLI is an unofficial, safety-gated terminal interface for authorized SmartMoving API users. It uses the same registry metadata as the MCP server so agents can map CLI commands to MCP tools.\n\n## Safety badges\n\n- READ: read-only command. Requires a local \`smartmoving init\` credential or \`SMARTMOVING_API_KEY\`; does not mutate CRM data.\n- WRITE: requires \`SMARTMOVING_ALLOW_WRITES=true\` or \`--allow-writes\`; dry-run first.\n- DESTRUCTIVE: requires writes + \`SMARTMOVING_ALLOW_DESTRUCTIVE=true\` + \`--yes\`; explicit human approval recommended.\n\n${sections}\n`;
}
function defaultOutputDir() {
    return resolve(process.cwd(), "..", "docs", "commands");
}
export async function generateCommandDocs(outputDir = defaultOutputDir()) {
    const resolvedOutputDir = resolve(outputDir);
    const operations = operationSchemaContract().operations;
    const files = new Map();
    files.set("README.md", renderIndex(operations));
    for (const operation of operations) {
        files.set(commandPath(operation), renderCommandPage(operation));
    }
    for (const [relativePath, content] of [...files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const target = join(resolvedOutputDir, relativePath);
        await mkdir(resolve(target, ".."), { recursive: true });
        await writeFile(target, content, "utf8");
    }
    return { ok: true, outputDir: resolvedOutputDir, filesWritten: files.size };
}
export function registerDocsCommand(program, helpers) {
    const docs = program.command("docs").description("Generate registry-backed SmartMoving CLI documentation.");
    docs
        .command("generate")
        .description("Generate docs/commands from the operation registry schema.")
        .addOption(helpers.jsonOption())
        .option("--output-dir <dir>", "directory for generated command docs", defaultOutputDir())
        .action(async (options) => {
        const result = await generateCommandDocs(options.outputDir);
        helpers.printResult("Generated command docs", result, options);
    });
}
//# sourceMappingURL=docs.js.map