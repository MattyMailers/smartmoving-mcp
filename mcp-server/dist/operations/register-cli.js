import { operationSchemaContract } from "./registry.js";
export function registerSchemaCommand(program, helpers) {
    program
        .command("schema")
        .description("Print the SmartMoving operation registry schema contract.")
        .addOption(helpers.jsonOption())
        .option("--group <group>", "filter operations by group")
        .option("--safety <safety>", "filter operations by safety level: read, write, or destructive")
        .action((options) => {
        helpers.printResult("Schema", operationSchemaContract({ group: options.group, safety: options.safety }), options);
    });
}
//# sourceMappingURL=register-cli.js.map