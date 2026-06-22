import type { Command } from "commander";
export interface RegisterDocsCommandHelpers {
    jsonOption: () => import("commander").Option;
    printResult: (label: string, value: unknown, options: {
        json?: boolean;
    }) => void;
}
export declare function generateCommandDocs(outputDir?: string): Promise<{
    ok: true;
    outputDir: string;
    filesWritten: number;
}>;
export declare function registerDocsCommand(program: Command, helpers: RegisterDocsCommandHelpers): void;
//# sourceMappingURL=docs.d.ts.map