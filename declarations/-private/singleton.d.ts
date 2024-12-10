declare global {
    var emberAnimatedSingleton: {
        [key: symbol]: unknown;
    };
}
export declare function getOrCreate<T>(key: string, construct: () => T): T;
//# sourceMappingURL=singleton.d.ts.map