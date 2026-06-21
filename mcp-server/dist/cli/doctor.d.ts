export interface DoctorCheck {
    name: string;
    ok: boolean;
    detail?: string;
}
export interface DoctorError {
    code: string;
    message: string;
    hint: string;
}
export interface DoctorResult {
    ok: boolean;
    checks: DoctorCheck[];
    safety: {
        writesEnabled: boolean;
        destructiveEnabled: boolean;
    };
    error?: DoctorError;
}
export interface DoctorOptions {
    profile?: string;
}
export declare function runDoctor(options?: DoctorOptions): Promise<DoctorResult>;
//# sourceMappingURL=doctor.d.ts.map