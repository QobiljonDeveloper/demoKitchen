// Mock client — no real HTTP calls needed
// This file exists only to maintain import compatibility

export function refreshOnce(): Promise<string | null> {
    const token = localStorage.getItem('demo_token');
    return Promise.resolve(token);
}

const apiClient = {} as any;
export { apiClient };
export default apiClient;
