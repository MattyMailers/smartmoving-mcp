import type { Command } from "commander";
export type AgentWorkflowName = "lead-review" | "daily-brief" | "follow-up-audit" | "follow-up-gap-audit";
export declare function agentSafetyContract(): unknown;
export declare function agentExamplesContract(): unknown;
export declare function agentPrompt(workflowName: string): string;
export declare function printAgentQuickstart(options: {
    printHermes?: boolean;
    printClaude?: boolean;
    printJson?: boolean;
}, formatJson: (value: unknown) => string): void;
export declare function registerAgentCommand(program: Command, helpers: {
    jsonOption: () => import("commander").Option;
    printResult: (label: string, value: unknown, options: {
        json?: boolean;
    }) => void;
    formatJson: (value: unknown) => string;
    formatError: (error: unknown) => string;
}): void;
//# sourceMappingURL=agent.d.ts.map