// ─── Mock Cash API ────────────────────────────────────────────

export interface CashTransaction {
    _id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    category: string | null;
    note: string | null;
    relatedRef: string | null;
    createdAt: string;
}

export interface CreateCashRequest {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    category?: string;
    note?: string;
}

export interface CashQuery {
    page?: number;
    limit?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    from?: string;
    to?: string;
}

function d(daysAgo: number) {
    const dt = new Date();
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString();
}

let mockCash: CashTransaction[] = [
    { _id: 'cash-1', type: 'INCOME', amount: 5200000, date: d(0), category: 'Savdo', note: 'Kunlik tushum', relatedRef: null, createdAt: d(0) },
    { _id: 'cash-2', type: 'INCOME', amount: 4800000, date: d(1), category: 'Savdo', note: 'Kunlik tushum', relatedRef: null, createdAt: d(1) },
    { _id: 'cash-3', type: 'INCOME', amount: 6100000, date: d(2), category: 'Savdo', note: 'Bayram kuni tushum', relatedRef: null, createdAt: d(2) },
    { _id: 'cash-4', type: 'EXPENSE', amount: 1500000, date: d(0), category: 'Xarid', note: "Go'sht xaridi", relatedRef: null, createdAt: d(0) },
    { _id: 'cash-5', type: 'EXPENSE', amount: 800000, date: d(1), category: 'Xarid', note: 'Sabzavot xaridi', relatedRef: null, createdAt: d(1) },
    { _id: 'cash-6', type: 'EXPENSE', amount: 350000, date: d(2), category: 'Kommunal', note: 'Elektr energiya', relatedRef: null, createdAt: d(2) },
    { _id: 'cash-7', type: 'EXPENSE', amount: 2000000, date: d(3), category: 'Maosh', note: 'Oshpaz maoshi', relatedRef: null, createdAt: d(3) },
    { _id: 'cash-8', type: 'INCOME', amount: 5500000, date: d(3), category: 'Savdo', note: 'Kunlik tushum', relatedRef: null, createdAt: d(3) },
    { _id: 'cash-9', type: 'EXPENSE', amount: 450000, date: d(4), category: 'Xarid', note: 'Un xaridi', relatedRef: null, createdAt: d(4) },
    { _id: 'cash-10', type: 'INCOME', amount: 4200000, date: d(4), category: 'Savdo', note: 'Kunlik tushum', relatedRef: null, createdAt: d(4) },
    { _id: 'cash-11', type: 'EXPENSE', amount: 1200000, date: d(5), category: 'Xarid', note: 'Haftalik bozor', relatedRef: null, createdAt: d(5) },
    { _id: 'cash-12', type: 'INCOME', amount: 3900000, date: d(5), category: 'Savdo', note: 'Kunlik tushum', relatedRef: null, createdAt: d(5) },
];

let nextId = 13;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const cashApi = {
    getAll: async (query: CashQuery = {}) => {
        await delay(200);
        let filtered = [...mockCash];

        if (query.type) filtered = filtered.filter(t => t.type === query.type);
        if (query.category) filtered = filtered.filter(t => t.category === query.category);
        if (query.from) filtered = filtered.filter(t => t.date >= query.from!);
        if (query.to) filtered = filtered.filter(t => t.date <= query.to! + 'T23:59:59');

        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const page = query.page || 1;
        const limit = query.limit || 20;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);

        return {
            success: true,
            data: paged,
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit),
        };
    },

    create: async (data: CreateCashRequest): Promise<{ success: boolean; data: CashTransaction }> => {
        await delay(300);
        const tx: CashTransaction = {
            _id: `cash-${nextId++}`,
            ...data,
            category: data.category || null,
            note: data.note || null,
            relatedRef: null,
            createdAt: new Date().toISOString(),
        };
        mockCash.unshift(tx);
        return { success: true, data: tx };
    },

    update: async (id: string, data: Partial<CreateCashRequest>): Promise<{ success: boolean; data: CashTransaction }> => {
        await delay(300);
        const idx = mockCash.findIndex(t => t._id === id);
        if (idx === -1) throw new Error('Not found');
        mockCash[idx] = { ...mockCash[idx], ...data } as CashTransaction;
        return { success: true, data: mockCash[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        mockCash = mockCash.filter(t => t._id !== id);
    },
};

export default cashApi;
