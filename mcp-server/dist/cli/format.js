export function redactSecrets(value) {
    let redacted = value;
    const apiKey = process.env.SMARTMOVING_API_KEY;
    if (apiKey) {
        redacted = redacted.split(apiKey).join("[REDACTED_API_KEY]");
    }
    return redacted
        .replace(/(x-api-key\s*[:=]\s*)[^\s,"'}]+/gi, "$1[REDACTED]")
        .replace(/(api[-_ ]?key\s*[:=]\s*)[^\s,"'}]+/gi, "$1[REDACTED]")
        .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,"'}]+/gi, "$1[REDACTED]");
}
export function formatJson(value) {
    return JSON.stringify(value, null, 2);
}
export function formatHuman(label, value) {
    if (value === null || value === undefined) {
        return `${label}: no data returned`;
    }
    if (typeof value === "string") {
        return `${label}: ${value}`;
    }
    if (Array.isArray(value)) {
        return `${label}: ${value.length} item${value.length === 1 ? "" : "s"}\n${formatJson(value)}`;
    }
    if (typeof value === "object") {
        const record = value;
        const keys = Object.keys(record);
        return `${label}: ${keys.length} field${keys.length === 1 ? "" : "s"}\n${formatJson(value)}`;
    }
    return `${label}: ${String(value)}`;
}
export function formatError(error) {
    if (error instanceof Error) {
        return redactSecrets(error.message);
    }
    const maybeError = error;
    if (maybeError?.message) {
        return redactSecrets(maybeError.message);
    }
    return redactSecrets(JSON.stringify(error));
}
//# sourceMappingURL=format.js.map