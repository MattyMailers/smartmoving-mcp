const DEFAULT_JOB_NUMBER_COLUMNS = ["Job Number", "Job #", "Job", "Quote Number", "Quote #"];
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    const finishField = () => { row.push(field); field = ""; };
    const finishRow = () => {
        finishField();
        if (row.some((value) => value.trim().length > 0))
            rows.push(row);
        row = [];
    };
    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (character === '"') {
            if (quoted && text[index + 1] === '"') {
                field += '"';
                index += 1;
            }
            else
                quoted = !quoted;
        }
        else if (character === "," && !quoted)
            finishField();
        else if ((character === "\n" || character === "\r") && !quoted) {
            if (character === "\r" && text[index + 1] === "\n")
                index += 1;
            finishRow();
        }
        else
            field += character;
    }
    if (quoted)
        throw new Error("CSV contains an unterminated quoted field.");
    if (field.length > 0 || row.length > 0)
        finishRow();
    return rows;
}
export function jobNumbersFromCsv(text, requestedColumn) {
    const rows = parseCsv(text);
    if (rows.length === 0)
        throw new Error("CSV is empty.");
    const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim());
    const normalizedHeaders = headers.map((header) => header.toLowerCase());
    const requested = requestedColumn?.trim();
    const candidates = requested ? [requested] : DEFAULT_JOB_NUMBER_COLUMNS;
    let columnIndex = -1;
    for (const candidate of candidates) {
        const matches = normalizedHeaders.map((header, index) => header === candidate.toLowerCase() ? index : -1).filter((index) => index >= 0);
        if (matches.length > 1)
            throw new Error(`Column '${headers[matches[0]]}' appears more than once.`);
        if (matches.length === 1) {
            columnIndex = matches[0];
            break;
        }
    }
    if (columnIndex < 0) {
        const wanted = requested ? `Column '${requested}' was not found.` : "Could not detect a job or quote number column.";
        throw new Error(`${wanted} Available columns: ${headers.join(", ")}.`);
    }
    const values = rows.slice(1).map((row) => (row[columnIndex] ?? "").trim()).filter(Boolean);
    if (values.length === 0)
        throw new Error(`CSV column '${headers[columnIndex]}' contains no job or quote numbers.`);
    return values;
}
//# sourceMappingURL=followup-gap-input.js.map