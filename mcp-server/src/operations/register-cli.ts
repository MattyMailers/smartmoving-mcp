import type { Command } from "commander";
import { operationSchemaContract } from "./registry.js";
import type { OperationGroup, OperationSafety } from "./types.js";

export interface RegisterCliSchemaOptions {
  jsonOption: () => import("commander").Option;
  printResult: (label: string, value: unknown, options: { json?: boolean }) => void;
}

interface SchemaCommandOptions {
  json?: boolean;
  group?: OperationGroup;
  safety?: OperationSafety;
}

export function registerSchemaCommand(program: Command, helpers: RegisterCliSchemaOptions): void {
  program
    .command("schema")
    .description("Print the SmartMoving operation registry schema contract.")
    .addOption(helpers.jsonOption())
    .option("--group <group>", "filter operations by group")
    .option("--safety <safety>", "filter operations by safety level: read, write, or destructive")
    .action((options: SchemaCommandOptions) => {
      helpers.printResult("Schema", operationSchemaContract({ group: options.group, safety: options.safety }), options);
    });
}
