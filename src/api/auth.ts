// ─── Mock Auth API ────────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
    };
}

export interface UserResponse {
    success: boolean;
    data: {
        id: string;
        email: string;
        branchId: number;
        branchName: string;
    };
}

const DEMO_EMAIL = 'demo@gmail.com';
const DEMO_PASSWORD = '12345678';
const MOCK_TOKEN = 'demo-mock-token-2026';

const MOCK_USER = {
    id: 'demo-user-001',
    email: DEMO_EMAIL,
    branchId: 1,
    branchName: 'Demo Branch',
};

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        await delay(400);
        if (data.email === DEMO_EMAIL && data.password === DEMO_PASSWORD) {
            localStorage.setItem('demo_token', MOCK_TOKEN);
            return { success: true, data: { accessToken: MOCK_TOKEN } };
        }
        throw { response: { data: { message: "Email yoki parol noto'g'ri" } } };
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('demo_token');
    },

    getMe: async (): Promise<UserResponse> => {
        await delay(100);
        return { success: true, data: MOCK_USER };
    },

    refresh: async (): Promise<LoginResponse> => {
        const token = localStorage.getItem('demo_token');
        if (token) {
            return { success: true, data: { accessToken: token } };
        }
        throw new Error('No token');
    },
};

function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export default authApi;
