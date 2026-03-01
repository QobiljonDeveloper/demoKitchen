// ─── Mock Utilities API ────────────────────────────────────────

export type UtilityType =
    | 'ELECTRICITY'
    | 'GAS'
    | 'WATER'
    | 'INTERNET'
    | 'RENT'
    | 'TRASH'
    | 'MAINTENANCE'
    | 'SECURITY'
    | 'OTHER';

export type UtilityUnit = 'kWh' | 'm3' | 'liter' | 'month' | 'fixed';

export interface UtilityTransaction {
    _id: string;
    date: string;
    utilityType: UtilityType;
    customTypeLabel: string | null;
    providerName: string | null;
    meterStart: number | null;
    meterEnd: number | null;
    consumption: number | null;
    unit: UtilityUnit;
    amount: number;
    note: string | null;
    cashTransactionId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUtilityRequest {
    date: string;
    utilityType: UtilityType;
    customTypeLabel?: string;
    providerName?: string;
    meterStart?: number | null;
    meterEnd?: number | null;
    consumption?: number | null;
    unit: UtilityUnit;
    amount: number;
    note?: string;
}

export interface UtilityQuery {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    utilityType?: UtilityType;
    providerName?: string;
    customTypeLabel?: string;
    sort?: string;
}

export interface UtilityTypeRule {
    allowedUnits: UtilityUnit[];
    defaultUnit: UtilityUnit;
    supportsMeter: boolean;
    meterRequired: boolean;
    supportsConsumption: boolean;
    providerSuggested: boolean;
    requiresCustomLabel?: boolean;
}

export interface UtilityConfig {
    utilityTypes: Array<{ value: UtilityType; label: string }>;
    units: Array<{ value: UtilityUnit; label: string }>;
    rules: Record<UtilityType, UtilityTypeRule>;
}

export const UTILITY_TYPES: { value: UtilityType; label: string }[] = [
    { value: 'ELECTRICITY', label: 'Elektr energiya' },
    { value: 'GAS', label: 'Gaz' },
    { value: 'WATER', label: 'Suv' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'RENT', label: 'Ijara' },
    { value: 'TRASH', label: 'Chiqindi' },
    { value: 'MAINTENANCE', label: "Ta'mirlash" },
    { value: 'SECURITY', label: "Qo'riqlash" },
    { value: 'OTHER', label: 'Boshqa' },
];

export const UTILITY_UNITS: { value: UtilityUnit; label: string }[] = [
    { value: 'kWh', label: 'kWh' },
    { value: 'm3', label: 'm³' },
    { value: 'liter', label: 'Litr' },
    { value: 'month', label: 'Oylik' },
    { value: 'fixed', label: 'Belgilangan' },
];

const MOCK_CONFIG: UtilityConfig = {
    utilityTypes: UTILITY_TYPES,
    units: UTILITY_UNITS,
    rules: {
        ELECTRICITY: { allowedUnits: ['kWh'], defaultUnit: 'kWh', supportsMeter: true, meterRequired: true, supportsConsumption: true, providerSuggested: true },
        GAS: { allowedUnits: ['m3'], defaultUnit: 'm3', supportsMeter: true, meterRequired: true, supportsConsumption: true, providerSuggested: true },
        WATER: { allowedUnits: ['m3', 'liter'], defaultUnit: 'm3', supportsMeter: true, meterRequired: false, supportsConsumption: true, providerSuggested: true },
        INTERNET: { allowedUnits: ['month'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: true },
        RENT: { allowedUnits: ['month'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: true },
        TRASH: { allowedUnits: ['month', 'fixed'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false },
        MAINTENANCE: { allowedUnits: ['fixed'], defaultUnit: 'fixed', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: true },
        SECURITY: { allowedUnits: ['month'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: true },
        OTHER: { allowedUnits: ['kWh', 'm3', 'liter', 'month', 'fixed'], defaultUnit: 'fixed', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false, requiresCustomLabel: true },
    },
};

function d(daysAgo: number) {
    const dt = new Date();
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString();
}

const now = new Date().toISOString();

let mockUtilities: UtilityTransaction[] = [
    { _id: 'util-1', date: d(2), utilityType: 'ELECTRICITY', customTypeLabel: null, providerName: 'Hududiy elektr tarmoqlari', meterStart: 15230, meterEnd: 15580, consumption: 350, unit: 'kWh', amount: 350000, note: null, cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-2', date: d(5), utilityType: 'GAS', customTypeLabel: null, providerName: 'Hududgaz', meterStart: 4520, meterEnd: 4680, consumption: 160, unit: 'm3', amount: 180000, note: null, cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-3', date: d(8), utilityType: 'WATER', customTypeLabel: null, providerName: 'Suv ta\'minoti', meterStart: 890, meterEnd: 920, consumption: 30, unit: 'm3', amount: 45000, note: null, cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-4', date: d(1), utilityType: 'INTERNET', customTypeLabel: null, providerName: 'Uztelecom', meterStart: null, meterEnd: null, consumption: null, unit: 'month', amount: 150000, note: 'Oylik internet', cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-5', date: d(0), utilityType: 'RENT', customTypeLabel: null, providerName: 'Bino egasi', meterStart: null, meterEnd: null, consumption: null, unit: 'month', amount: 5000000, note: 'Mart oyi ijarasi', cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-6', date: d(10), utilityType: 'TRASH', customTypeLabel: null, providerName: null, meterStart: null, meterEnd: null, consumption: null, unit: 'month', amount: 80000, note: null, cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-7', date: d(15), utilityType: 'MAINTENANCE', customTypeLabel: null, providerName: "Usta Sobir", meterStart: null, meterEnd: null, consumption: null, unit: 'fixed', amount: 250000, note: "Gaz plita ta'mirlash", cashTransactionId: null, createdAt: now, updatedAt: now },
    { _id: 'util-8', date: d(3), utilityType: 'SECURITY', customTypeLabel: null, providerName: "Xavfsizlik xizmati", meterStart: null, meterEnd: null, consumption: null, unit: 'month', amount: 300000, note: null, cashTransactionId: null, createdAt: now, updatedAt: now },
];

let nextId = 9;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const utilitiesApi = {
    getConfig: async (): Promise<{ success: boolean; data: UtilityConfig }> => {
        await delay(100);
        return { success: true, data: MOCK_CONFIG };
    },

    getAll: async (query: UtilityQuery = {}) => {
        await delay(200);
        let filtered = [...mockUtilities];
        if (query.utilityType) filtered = filtered.filter(u => u.utilityType === query.utilityType);
        if (query.providerName) filtered = filtered.filter(u => u.providerName === query.providerName);
        if (query.from) filtered = filtered.filter(u => u.date >= query.from!);
        if (query.to) filtered = filtered.filter(u => u.date <= query.to! + 'T23:59:59');

        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const page = query.page || 1;
        const limit = query.limit || 20;
        const start = (page - 1) * limit;

        return {
            success: true,
            data: filtered.slice(start, start + limit),
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit),
        };
    },

    getOne: async (id: string): Promise<{ success: boolean; data: UtilityTransaction }> => {
        await delay(100);
        const item = mockUtilities.find(u => u._id === id);
        if (!item) throw new Error('Not found');
        return { success: true, data: item };
    },

    create: async (data: CreateUtilityRequest): Promise<{ success: boolean; data: UtilityTransaction }> => {
        await delay(300);
        const tx: UtilityTransaction = {
            _id: `util-${nextId++}`,
            ...data,
            customTypeLabel: data.customTypeLabel || null,
            providerName: data.providerName || null,
            meterStart: data.meterStart ?? null,
            meterEnd: data.meterEnd ?? null,
            consumption: data.consumption ?? null,
            note: data.note || null,
            cashTransactionId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockUtilities.unshift(tx);
        return { success: true, data: tx };
    },

    update: async (id: string, data: Partial<CreateUtilityRequest>): Promise<{ success: boolean; data: UtilityTransaction }> => {
        await delay(300);
        const idx = mockUtilities.findIndex(u => u._id === id);
        if (idx === -1) throw new Error('Not found');
        mockUtilities[idx] = { ...mockUtilities[idx], ...data, updatedAt: new Date().toISOString() } as UtilityTransaction;
        return { success: true, data: mockUtilities[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        mockUtilities = mockUtilities.filter(u => u._id !== id);
    },
};

export default utilitiesApi;
