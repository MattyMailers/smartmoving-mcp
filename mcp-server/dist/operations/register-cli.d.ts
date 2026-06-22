import type { Command } from "commander";
export interface RegisterCliSchemaOptions {
    jsonOption: () => import("commander").Option;
    printResult: (label: string, value: unknown, options: {
        json?: boolean;
    }) => void;
}
export declare function registerSchemaCommand(program: Command, helpers: RegisterCliSchemaOptions): void;
//# sourceMappingURL=register-cli.d.ts.map