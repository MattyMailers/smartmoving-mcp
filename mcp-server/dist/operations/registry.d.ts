import type { OperationDefinition, OperationGroup, OperationSafety, OperationSchemaContract } from "./types.js";
export declare const operationRegistry: OperationDefinition[];
export interface OperationSchemaFilters {
    group?: OperationGroup;
    safety?: OperationSafety;
}
export declare function operationSchemaContract(filters?: OperationSchemaFilters): OperationSchemaContract;
//# sourceMappingURL=registry.d.ts.map