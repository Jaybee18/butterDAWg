export function msToTime(ms: number) {
    return new Date(ms).toISOString().slice(14, -2);
}