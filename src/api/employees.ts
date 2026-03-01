// ─── Mock Employees & Salaries API ─────────────────────────────

export interface Employee {
    _id: string;
    fullName: string;
    baseMonthlySalary: number;
    isActive: boolean;
    createdAt: string;
}

export interface SalaryPayment {
    _id: string;
    employeeId: {
        _id: string;
        fullName: string;
    };
    month: string;
    datePaid: string;
    amountPaid: number;
    bonus: number;
    penalty: number;
    note: string | null;
    createdAt: string;
}

export interface CreateEmployeeRequest {
    fullName: string;
    baseMonthlySalary: number;
    isActive?: boolean;
}

export interface CreateSalaryRequest {
    employeeId: string;
    month: string;
    datePaid: string;
    amountPaid: number;
    bonus?: number;
    penalty?: number;
    note?: string;
}

const now = new Date().toISOString();

let mockEmployees: Employee[] = [
    { _id: 'emp-1', fullName: 'Alisher Karimov', baseMonthlySalary: 3500000, isActive: true, createdAt: now },
    { _id: 'emp-2', fullName: "Dilshod Rahimov", baseMonthlySalary: 3000000, isActive: true, createdAt: now },
    { _id: 'emp-3', fullName: 'Nodira Usmanova', baseMonthlySalary: 2800000, isActive: true, createdAt: now },
    { _id: 'emp-4', fullName: "Sardor To'xtasinov", baseMonthlySalary: 4000000, isActive: true, createdAt: now },
    { _id: 'emp-5', fullName: 'Malika Azimova', baseMonthlySalary: 2500000, isActive: true, createdAt: now },
    { _id: 'emp-6', fullName: 'Jasur Toshmatov', baseMonthlySalary: 2200000, isActive: false, createdAt: now },
];

let mockSalaries: SalaryPayment[] = [
    { _id: 'sal-1', employeeId: { _id: 'emp-1', fullName: 'Alisher Karimov' }, month: '2026-02', datePaid: '2026-02-28T10:00:00Z', amountPaid: 3500000, bonus: 500000, penalty: 0, note: 'Oylik maosh', createdAt: now },
    { _id: 'sal-2', employeeId: { _id: 'emp-2', fullName: "Dilshod Rahimov" }, month: '2026-02', datePaid: '2026-02-28T10:00:00Z', amountPaid: 3000000, bonus: 200000, penalty: 0, note: null, createdAt: now },
    { _id: 'sal-3', employeeId: { _id: 'emp-3', fullName: 'Nodira Usmanova' }, month: '2026-02', datePaid: '2026-02-28T10:00:00Z', amountPaid: 2800000, bonus: 0, penalty: 100000, note: "Kechikish uchun jarima", createdAt: now },
    { _id: 'sal-4', employeeId: { _id: 'emp-4', fullName: "Sardor To'xtasinov" }, month: '2026-02', datePaid: '2026-02-28T10:00:00Z', amountPaid: 4000000, bonus: 300000, penalty: 0, note: 'Bosh oshpaz', createdAt: now },
    { _id: 'sal-5', employeeId: { _id: 'emp-5', fullName: 'Malika Azimova' }, month: '2026-02', datePaid: '2026-02-28T10:00:00Z', amountPaid: 2500000, bonus: 0, penalty: 0, note: null, createdAt: now },
    { _id: 'sal-6', employeeId: { _id: 'emp-1', fullName: 'Alisher Karimov' }, month: '2026-01', datePaid: '2026-01-31T10:00:00Z', amountPaid: 3500000, bonus: 0, penalty: 0, note: null, createdAt: now },
    { _id: 'sal-7', employeeId: { _id: 'emp-2', fullName: "Dilshod Rahimov" }, month: '2026-01', datePaid: '2026-01-31T10:00:00Z', amountPaid: 3000000, bonus: 0, penalty: 0, note: null, createdAt: now },
];

let nextEmpId = 7;
let nextSalId = 8;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const employeesApi = {
    getAll: async (query: { page?: number; limit?: number; isActive?: boolean; search?: string } = {}) => {
        await delay(200);
        let filtered = [...mockEmployees];
        if (query.isActive !== undefined) filtered = filtered.filter(e => e.isActive === query.isActive);
        if (query.search) {
            const s = query.search.toLowerCase();
            filtered = filtered.filter(e => e.fullName.toLowerCase().includes(s));
        }
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

    getActive: async (): Promise<{ success: boolean; data: Employee[] }> => {
        await delay(100);
        return { success: true, data: mockEmployees.filter(e => e.isActive) };
    },

    create: async (data: CreateEmployeeRequest): Promise<{ success: boolean; data: Employee }> => {
        await delay(300);
        const emp: Employee = {
            _id: `emp-${nextEmpId++}`,
            ...data,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
        };
        mockEmployees.unshift(emp);
        return { success: true, data: emp };
    },

    update: async (id: string, data: Partial<CreateEmployeeRequest>): Promise<{ success: boolean; data: Employee }> => {
        await delay(300);
        const idx = mockEmployees.findIndex(e => e._id === id);
        if (idx === -1) throw new Error('Not found');
        mockEmployees[idx] = { ...mockEmployees[idx], ...data } as Employee;
        return { success: true, data: mockEmployees[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        mockEmployees = mockEmployees.filter(e => e._id !== id);
    },
};

export const salariesApi = {
    getAll: async (query: { page?: number; limit?: number; month?: string; employeeId?: string } = {}) => {
        await delay(200);
        let filtered = [...mockSalaries];
        if (query.month) filtered = filtered.filter(s => s.month === query.month);
        if (query.employeeId) filtered = filtered.filter(s => s.employeeId._id === query.employeeId);

        filtered.sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime());

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

    getMonthlyStats: async (month: string) => {
        await delay(200);
        const monthSalaries = mockSalaries.filter(s => s.month === month);
        const totalPaid = monthSalaries.reduce((s, p) => s + p.amountPaid, 0);
        const totalBonus = monthSalaries.reduce((s, p) => s + p.bonus, 0);
        const totalPenalty = monthSalaries.reduce((s, p) => s + p.penalty, 0);

        return {
            success: true,
            data: {
                month,
                totalPaid,
                totalBonus,
                totalPenalty,
                paymentsCount: monthSalaries.length,
                employeesCount: new Set(monthSalaries.map(s => s.employeeId._id)).size,
            },
        };
    },

    create: async (data: CreateSalaryRequest): Promise<{ success: boolean; data: SalaryPayment }> => {
        await delay(300);
        const emp = mockEmployees.find(e => e._id === data.employeeId);
        const sal: SalaryPayment = {
            _id: `sal-${nextSalId++}`,
            employeeId: { _id: data.employeeId, fullName: emp?.fullName || 'Nomaʼlum' },
            month: data.month,
            datePaid: data.datePaid,
            amountPaid: data.amountPaid,
            bonus: data.bonus || 0,
            penalty: data.penalty || 0,
            note: data.note || null,
            createdAt: new Date().toISOString(),
        };
        mockSalaries.unshift(sal);
        return { success: true, data: sal };
    },

    update: async (id: string, data: Partial<CreateSalaryRequest>): Promise<{ success: boolean; data: SalaryPayment }> => {
        await delay(300);
        const idx = mockSalaries.findIndex(s => s._id === id);
        if (idx === -1) throw new Error('Not found');
        if (data.employeeId) {
            const emp = mockEmployees.find(e => e._id === data.employeeId);
            mockSalaries[idx].employeeId = { _id: data.employeeId, fullName: emp?.fullName || 'Nomaʼlum' };
        }
        mockSalaries[idx] = { ...mockSalaries[idx], ...data, employeeId: mockSalaries[idx].employeeId } as SalaryPayment;
        return { success: true, data: mockSalaries[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        mockSalaries = mockSalaries.filter(s => s._id !== id);
    },
};
