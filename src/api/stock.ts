// ─── Mock Stock API ────────────────────────────────────────────

export interface StockTransaction {
    _id: string;
    type: 'IN' | 'OUT';
    itemId: {
        _id: string;
        name: string;
        unit: string;
    };
    date: string;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
    supplier: string | null;
    note: string | null;
    createdAt: string;
}

export interface ItemBalance {
    itemId: string;
    itemName: string;
    unit: string;
    balance: number;
    minStock: number | null;
    belowMinStock: boolean;
}

export interface CreateStockInRequest {
    itemId: string;
    date: string;
    quantity: number;
    unitPrice?: number;
    supplier?: string;
    note?: string;
}

export interface CreateStockOutRequest {
    itemId: string;
    date: string;
    quantity: number;
    note?: string;
}

export interface StockQuery {
    page?: number;
    limit?: number;
    type?: 'IN' | 'OUT';
    itemId?: string;
    from?: string;
    to?: string;
}

export interface MonthlyItemBalance {
    itemId: string;
    itemName: string;
    unit: string;
    openingBalance: number;
    inQty: number;
    outQty: number;
    closingBalance: number;
    minStock: number | null;
    belowMinStock: boolean;
}

function d(daysAgo: number) {
    const dt = new Date();
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString();
}

const items = [
    { _id: 'item-1', name: 'Un', unit: 'kg' },
    { _id: 'item-2', name: 'Shakar', unit: 'kg' },
    { _id: 'item-4', name: "Go'sht (mol)", unit: 'kg' },
    { _id: 'item-5', name: "Go'sht (tovuq)", unit: 'kg' },
    { _id: 'item-6', name: 'Guruch', unit: 'kg' },
    { _id: 'item-7', name: "O'simlik yog'i", unit: 'liter' },
    { _id: 'item-8', name: 'Sabzi', unit: 'kg' },
    { _id: 'item-9', name: 'Piyoz', unit: 'kg' },
    { _id: 'item-10', name: 'Kartoshka', unit: 'kg' },
];

// All quantities in base units: grams for kg, ml for liter
// unitPrice in UZS per base unit (per gram)
let mockStock: StockTransaction[] = [
    { _id: 'stk-1', type: 'IN', itemId: items[0], date: d(0), quantity: 100000, unitPrice: 8, totalPrice: 800000, supplier: 'Bozor', note: null, createdAt: d(0) },
    { _id: 'stk-2', type: 'IN', itemId: items[3], date: d(0), quantity: 30000, unitPrice: 32, totalPrice: 960000, supplier: "Go'sht do'koni", note: null, createdAt: d(0) },
    { _id: 'stk-3', type: 'OUT', itemId: items[0], date: d(0), quantity: 15000, unitPrice: null, totalPrice: null, supplier: null, note: 'Non tayyorlash uchun', createdAt: d(0) },
    { _id: 'stk-4', type: 'IN', itemId: items[4], date: d(1), quantity: 50000, unitPrice: 15, totalPrice: 750000, supplier: 'Bozor', note: null, createdAt: d(1) },
    { _id: 'stk-5', type: 'OUT', itemId: items[4], date: d(1), quantity: 8000, unitPrice: null, totalPrice: null, supplier: null, note: 'Osh uchun', createdAt: d(1) },
    { _id: 'stk-6', type: 'IN', itemId: items[2], date: d(1), quantity: 25000, unitPrice: 85, totalPrice: 2125000, supplier: "Go'sht do'koni", note: null, createdAt: d(1) },
    { _id: 'stk-7', type: 'OUT', itemId: items[2], date: d(2), quantity: 10000, unitPrice: null, totalPrice: null, supplier: null, note: 'Kabob uchun', createdAt: d(2) },
    { _id: 'stk-8', type: 'IN', itemId: items[5], date: d(2), quantity: 20000, unitPrice: 22, totalPrice: 440000, supplier: 'Bozor', note: null, createdAt: d(2) },
    { _id: 'stk-9', type: 'OUT', itemId: items[6], date: d(3), quantity: 12000, unitPrice: null, totalPrice: null, supplier: null, note: 'Osh uchun sabzi', createdAt: d(3) },
    { _id: 'stk-10', type: 'IN', itemId: items[7], date: d(3), quantity: 40000, unitPrice: 5, totalPrice: 200000, supplier: 'Bozor', note: null, createdAt: d(3) },
];

// Calculated balances from transactions
const balanceMap: Record<string, number> = {};
items.forEach(i => { balanceMap[i._id] = 0; });
mockStock.forEach(t => {
    if (t.type === 'IN') balanceMap[t.itemId._id] = (balanceMap[t.itemId._id] || 0) + t.quantity;
    else balanceMap[t.itemId._id] = (balanceMap[t.itemId._id] || 0) - t.quantity;
});

let nextId = 11;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const stockApi = {
    getAll: async (query: StockQuery = {}) => {
        await delay(200);
        let filtered = [...mockStock];
        if (query.type) filtered = filtered.filter(t => t.type === query.type);
        if (query.itemId) filtered = filtered.filter(t => t.itemId._id === query.itemId);
        if (query.from) filtered = filtered.filter(t => t.date >= query.from!);
        if (query.to) filtered = filtered.filter(t => t.date <= query.to! + 'T23:59:59');

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

    getBalances: async (): Promise<{ success: boolean; data: ItemBalance[] }> => {
        await delay(200);
        const minStocks: Record<string, number | null> = {
            'item-1': 50000, 'item-2': 20000, 'item-4': 30000, 'item-5': 20000,
            'item-6': 40000, 'item-7': 15000, 'item-8': 25000, 'item-9': 20000, 'item-10': 30000,
        };
        const balances: ItemBalance[] = items.map(item => {
            const bal = balanceMap[item._id] || 0;
            const min = minStocks[item._id] ?? null;
            return {
                itemId: item._id,
                itemName: item.name,
                unit: item.unit,
                balance: bal,
                minStock: min,
                belowMinStock: min !== null && bal < min,
            };
        });
        return { success: true, data: balances };
    },

    getMonthlyBalances: async (_month: string): Promise<{ success: boolean; data: MonthlyItemBalance[] }> => {
        await delay(200);
        const minStocksMap: Record<string, number> = {
            'item-1': 50000, 'item-2': 20000, 'item-4': 30000, 'item-5': 20000,
            'item-6': 40000, 'item-7': 15000, 'item-8': 25000, 'item-9': 20000, 'item-10': 30000,
        };
        const balances: MonthlyItemBalance[] = items.map(item => {
            const opening = (Math.floor(Math.random() * 50) + 10) * 1000;
            const inQty = (Math.floor(Math.random() * 80) + 20) * 1000;
            const outQty = (Math.floor(Math.random() * 60) + 10) * 1000;
            const closing = balanceMap[item._id] || 0;
            const min = minStocksMap[item._id] || 20000;
            return {
                itemId: item._id,
                itemName: item.name,
                unit: item.unit,
                openingBalance: opening,
                inQty,
                outQty,
                closingBalance: closing,
                minStock: min,
                belowMinStock: closing < min,
            };
        });
        return { success: true, data: balances };
    },

    createIn: async (data: CreateStockInRequest): Promise<{ success: boolean; data: StockTransaction }> => {
        await delay(300);
        const item = items.find(i => i._id === data.itemId) || { _id: data.itemId, name: 'Nomaʼlum', unit: 'piece' };
        const tx: StockTransaction = {
            _id: `stk-${nextId++}`,
            type: 'IN',
            itemId: item,
            date: data.date,
            quantity: data.quantity,
            unitPrice: data.unitPrice || null,
            totalPrice: data.unitPrice ? data.unitPrice * data.quantity : null,
            supplier: data.supplier || null,
            note: data.note || null,
            createdAt: new Date().toISOString(),
        };
        mockStock.unshift(tx);
        balanceMap[data.itemId] = (balanceMap[data.itemId] || 0) + data.quantity;
        return { success: true, data: tx };
    },

    createOut: async (data: CreateStockOutRequest): Promise<{ success: boolean; data: StockTransaction }> => {
        await delay(300);
        const item = items.find(i => i._id === data.itemId) || { _id: data.itemId, name: 'Nomaʼlum', unit: 'piece' };
        const tx: StockTransaction = {
            _id: `stk-${nextId++}`,
            type: 'OUT',
            itemId: item,
            date: data.date,
            quantity: data.quantity,
            unitPrice: null,
            totalPrice: null,
            supplier: null,
            note: data.note || null,
            createdAt: new Date().toISOString(),
        };
        mockStock.unshift(tx);
        balanceMap[data.itemId] = (balanceMap[data.itemId] || 0) - data.quantity;
        return { success: true, data: tx };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        const tx = mockStock.find(t => t._id === id);
        if (tx) {
            if (tx.type === 'IN') balanceMap[tx.itemId._id] -= tx.quantity;
            else balanceMap[tx.itemId._id] += tx.quantity;
        }
        mockStock = mockStock.filter(t => t._id !== id);
    },
};

export default stockApi;
