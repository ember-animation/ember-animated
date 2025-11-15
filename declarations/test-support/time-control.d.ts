export default class TimeControl {
    _timer: number;
    _runningSpeed: boolean;
    _runStartedAt: number | null;
    finished(): void;
    now(): number;
    advance(ms: any): Promise<unknown>;
    runAtSpeed(factor: any): void;
    pause(): void;
    _runstartedAt: any;
}
//# sourceMappingURL=time-control.d.ts.map