// ─── Mock Items API ────────────────────────────────────────────

export interface Item {
    _id: string;
    name: string;
    itemType: 'INGREDIENT' | 'SUPPLY' | 'CLEANING' | 'PACKAGING' | 'OTHER';
    unitType: 'WEIGHT' | 'VOLUME' | 'COUNT';
    unit: 'kg' | 'g' | 'liter' | 'ml' | 'piece';
    minStock: number | null;
    defaultUnitPrice: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemRequest {
    name: string;
    itemType: Item['itemType'];
    unitType: Item['unitType'];
    unit: Item['unit'];
    minStock?: number;
    defaultUnitPrice?: number;
    isActive?: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ItemsQuery {
    page?: number;
    limit?: number;
    itemType?: Item['itemType'];
    isActive?: boolean;
    search?: string;
}

const now = new Date().toISOString();

let mockItems: Item[] = [
    { _id: 'item-1', name: 'Un', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 50000, defaultUnitPrice: 8, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-2', name: 'Shakar', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 20000, defaultUnitPrice: 12, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-3', name: 'Tuz', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 10000, defaultUnitPrice: 3, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-4', name: "Go'sht (mol)", itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 30000, defaultUnitPrice: 85, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-5', name: "Go'sht (tovuq)", itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 20000, defaultUnitPrice: 32, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-6', name: 'Guruch', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 40000, defaultUnitPrice: 15, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-7', name: "O'simlik yog'i", itemType: 'INGREDIENT', unitType: 'VOLUME', unit: 'liter', minStock: 15000, defaultUnitPrice: 22, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-8', name: 'Sabzi', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 25000, defaultUnitPrice: 6, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-9', name: 'Piyoz', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 20000, defaultUnitPrice: 5, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-10', name: 'Kartoshka', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 30000, defaultUnitPrice: 4, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-11', name: 'Salfetka', itemType: 'SUPPLY', unitType: 'COUNT', unit: 'piece', minStock: 100, defaultUnitPrice: 500, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-12', name: 'Tozalash vositasi', itemType: 'CLEANING', unitType: 'VOLUME', unit: 'liter', minStock: 5000, defaultUnitPrice: 25, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-13', name: 'Paket (katta)', itemType: 'PACKAGING', unitType: 'COUNT', unit: 'piece', minStock: 200, defaultUnitPrice: 300, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-14', name: 'Pomidor', itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 15000, defaultUnitPrice: 10, isActive: true, createdAt: now, updatedAt: now },
    { _id: 'item-15', name: "Makaron", itemType: 'INGREDIENT', unitType: 'WEIGHT', unit: 'kg', minStock: 10000, defaultUnitPrice: 9, isActive: true, createdAt: now, updatedAt: now },
];

let nextId = 16;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const itemsApi = {
    getAll: async (query: ItemsQuery = {}): Promise<PaginatedResponse<Item>> => {
        await delay(200);
        let filtered = [...mockItems];

        if (query.itemType) filtered = filtered.filter(i => i.itemType === query.itemType);
        if (query.isActive !== undefined) filtered = filtered.filter(i => i.isActive === query.isActive);
        if (query.search) {
            const s = query.search.toLowerCase();
            filtered = filtered.filter(i => i.name.toLowerCase().includes(s));
        }

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

    getActive: async (): Promise<{ success: boolean; data: Item[] }> => {
        await delay(100);
        return { success: true, data: mockItems.filter(i => i.isActive) };
    },

    getById: async (id: string): Promise<{ success: boolean; data: Item }> => {
        await delay(100);
        const item = mockItems.find(i => i._id === id);
        if (!item) throw new Error('Not found');
        return { success: true, data: item };
    },

    create: async (data: CreateItemRequest): Promise<{ success: boolean; data: Item }> => {
        await delay(300);
        const newItem: Item = {
            _id: `item-${nextId++}`,
            ...data,
            minStock: data.minStock ?? null,
            defaultUnitPrice: data.defaultUnitPrice ?? null,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockItems.unshift(newItem);
        return { success: true, data: newItem };
    },

    update: async (id: string, data: Partial<CreateItemRequest>): Promise<{ success: boolean; data: Item }> => {
        await delay(300);
        const idx = mockItems.findIndex(i => i._id === id);
        if (idx === -1) throw new Error('Not found');
        mockItems[idx] = { ...mockItems[idx], ...data, updatedAt: new Date().toISOString() };
        return { success: true, data: mockItems[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        mockItems = mockItems.filter(i => i._id !== id);
    },
};

export default itemsApi;
