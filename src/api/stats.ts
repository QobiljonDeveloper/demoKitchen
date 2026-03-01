// ─── Mock Stats & Reports API ──────────────────────────────────
import { format, subDays, getDaysInMonth, parse } from 'date-fns';

export interface DailyStats {
    date: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
}

export interface MonthlyStats {
    month: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
    dailyBreakdown: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
        utilities: number;
    }>;
}

export interface YearlyStats {
    year: number;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
    monthlyBreakdown: Array<{
        month: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
        utilities: number;
    }>;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const statsApi = {
    getDaily: async (date: string): Promise<{ success: boolean; data: DailyStats }> => {
        await delay(200);
        const income = rand(3000000, 7000000);
        const purchases = rand(500000, 2000000);
        const salaries = rand(0, 500000);
        const utilities = rand(0, 200000);
        const expense = purchases + salaries + utilities;
        return {
            success: true,
            data: {
                date,
                incomeTotal: income,
                expenseTotal: expense,
                net: income - expense,
                purchasesTotal: purchases,
                salaryTotal: salaries,
                utilitiesTotal: utilities,
            },
        };
    },

    getMonthly: async (month: string): Promise<{ success: boolean; data: MonthlyStats }> => {
        await delay(300);
        const dt = parse(month, 'yyyy-MM', new Date());
        const days = getDaysInMonth(dt);
        let totalIncome = 0, totalExpense = 0, totalPurchases = 0, totalSalaries = 0, totalUtilities = 0;

        const dailyBreakdown = Array.from({ length: days }, (_, i) => {
            const income = rand(3000000, 7000000);
            const purchases = rand(500000, 2000000);
            const salaries = i === days - 1 ? rand(10000000, 15000000) : 0;
            const utilities = i % 10 === 0 ? rand(200000, 800000) : 0;
            const expense = purchases + salaries + utilities;

            totalIncome += income;
            totalExpense += expense;
            totalPurchases += purchases;
            totalSalaries += salaries;
            totalUtilities += utilities;

            const day = new Date(dt.getFullYear(), dt.getMonth(), i + 1);
            return {
                date: format(day, 'yyyy-MM-dd'),
                income,
                expense,
                net: income - expense,
                purchases,
                salaries,
                utilities,
            };
        });

        return {
            success: true,
            data: {
                month,
                incomeTotal: totalIncome,
                expenseTotal: totalExpense,
                net: totalIncome - totalExpense,
                purchasesTotal: totalPurchases,
                salaryTotal: totalSalaries,
                utilitiesTotal: totalUtilities,
                dailyBreakdown,
            },
        };
    },

    getYearly: async (year: number): Promise<{ success: boolean; data: YearlyStats }> => {
        await delay(300);
        let totalIncome = 0, totalExpense = 0, totalPurchases = 0, totalSalaries = 0, totalUtilities = 0;

        const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
            const income = rand(80000000, 150000000);
            const purchases = rand(20000000, 50000000);
            const salaries = rand(10000000, 20000000);
            const utilities = rand(3000000, 8000000);
            const expense = purchases + salaries + utilities;

            totalIncome += income;
            totalExpense += expense;
            totalPurchases += purchases;
            totalSalaries += salaries;
            totalUtilities += utilities;

            return {
                month: `${year}-${String(i + 1).padStart(2, '0')}`,
                income,
                expense,
                net: income - expense,
                purchases,
                salaries,
                utilities,
            };
        });

        return {
            success: true,
            data: {
                year,
                incomeTotal: totalIncome,
                expenseTotal: totalExpense,
                net: totalIncome - totalExpense,
                purchasesTotal: totalPurchases,
                salaryTotal: totalSalaries,
                utilitiesTotal: totalUtilities,
                monthlyBreakdown,
            },
        };
    },
};

export const reportsApi = {
    getStockBalances: async () => {
        await delay(200);
        const items = [
            { itemId: 'item-1', itemName: 'Un', unit: 'kg', balance: 85000, minStock: 50000, belowMinStock: false },
            { itemId: 'item-2', itemName: 'Shakar', unit: 'kg', balance: 15000, minStock: 20000, belowMinStock: true },
            { itemId: 'item-4', itemName: "Go'sht (mol)", unit: 'kg', balance: 18000, minStock: 30000, belowMinStock: true },
            { itemId: 'item-5', itemName: "Go'sht (tovuq)", unit: 'kg', balance: 22000, minStock: 20000, belowMinStock: false },
            { itemId: 'item-6', itemName: 'Guruch', unit: 'kg', balance: 42000, minStock: 40000, belowMinStock: false },
            { itemId: 'item-7', itemName: "O'simlik yog'i", unit: 'liter', balance: 12000, minStock: 15000, belowMinStock: true },
            { itemId: 'item-8', itemName: 'Sabzi', unit: 'kg', balance: 30000, minStock: 25000, belowMinStock: false },
            { itemId: 'item-9', itemName: 'Piyoz', unit: 'kg', balance: 28000, minStock: 20000, belowMinStock: false },
            { itemId: 'item-10', itemName: 'Kartoshka', unit: 'kg', balance: 25000, minStock: 30000, belowMinStock: true },
        ];
        return { success: true, data: items };
    },

    getStockTransactions: async (_query: { from?: string; to?: string; type?: string; itemId?: string }) => {
        await delay(200);
        const txs = Array.from({ length: 15 }, (_, i) => ({
            _id: `rtx-${i}`,
            type: i % 3 === 0 ? 'OUT' : 'IN',
            itemId: { _id: `item-${(i % 9) + 1}`, name: ['Un', 'Shakar', 'Tuz', "Go'sht (mol)", "Go'sht (tovuq)", 'Guruch', "O'simlik yog'i", 'Sabzi', 'Piyoz'][i % 9], unit: 'kg' },
            date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
            quantity: rand(5000, 50000),
            unitPrice: i % 3 === 0 ? null : rand(5, 50),
            totalPrice: i % 3 === 0 ? null : rand(100000, 1000000),
            supplier: i % 3 === 0 ? null : 'Bozor',
            note: i % 3 === 0 ? 'Ishlatildi' : null,
        }));
        return { success: true, data: txs };
    },

    getCashReport: async (_query: { from?: string; to?: string; type?: string; category?: string }) => {
        await delay(200);
        const txs = Array.from({ length: 10 }, (_, i) => ({
            _id: `crpt-${i}`,
            type: i % 2 === 0 ? 'INCOME' : 'EXPENSE',
            amount: rand(500000, 5000000),
            date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
            category: i % 2 === 0 ? 'Savdo' : ['Xarid', 'Kommunal', 'Maosh'][i % 3],
            note: i % 2 === 0 ? 'Kunlik tushum' : 'Xarajat',
        }));
        return { success: true, data: txs };
    },

    getSalariesReport: async (month: string) => {
        await delay(200);
        const payments = [
            { employeeId: { _id: 'emp-1', fullName: 'Alisher Karimov' }, amountPaid: 3500000, bonus: 500000, penalty: 0, datePaid: `${month}-28`, note: null },
            { employeeId: { _id: 'emp-2', fullName: "Dilshod Rahimov" }, amountPaid: 3000000, bonus: 200000, penalty: 0, datePaid: `${month}-28`, note: null },
            { employeeId: { _id: 'emp-3', fullName: 'Nodira Usmanova' }, amountPaid: 2800000, bonus: 0, penalty: 100000, datePaid: `${month}-28`, note: "Jarima" },
            { employeeId: { _id: 'emp-4', fullName: "Sardor To'xtasinov" }, amountPaid: 4000000, bonus: 300000, penalty: 0, datePaid: `${month}-28`, note: null },
            { employeeId: { _id: 'emp-5', fullName: 'Malika Azimova' }, amountPaid: 2500000, bonus: 0, penalty: 0, datePaid: `${month}-28`, note: null },
        ];
        return {
            success: true,
            data: {
                payments,
                totalPaid: payments.reduce((s, p) => s + p.amountPaid, 0),
                totalBonus: payments.reduce((s, p) => s + p.bonus, 0),
                totalPenalty: payments.reduce((s, p) => s + p.penalty, 0),
                paymentsCount: payments.length,
            },
        };
    },

    getUtilitiesReport: async (_query: { from?: string; to?: string; utilityType?: string; providerName?: string }) => {
        await delay(200);
        const list = [
            { _id: 'ur-1', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), utilityType: 'ELECTRICITY', customTypeLabel: null, providerName: 'Hududiy elektr', consumption: 350, unit: 'kWh', amount: 350000, note: null },
            { _id: 'ur-2', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), utilityType: 'GAS', customTypeLabel: null, providerName: 'Hududgaz', consumption: 160, unit: 'm3', amount: 180000, note: null },
            { _id: 'ur-3', date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), utilityType: 'WATER', customTypeLabel: null, providerName: "Suv ta'minoti", consumption: 30, unit: 'm3', amount: 45000, note: null },
            { _id: 'ur-4', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), utilityType: 'INTERNET', customTypeLabel: null, providerName: 'Uztelecom', consumption: null, unit: 'month', amount: 150000, note: null },
            { _id: 'ur-5', date: format(new Date(), 'yyyy-MM-dd'), utilityType: 'RENT', customTypeLabel: null, providerName: 'Bino egasi', consumption: null, unit: 'month', amount: 5000000, note: null },
        ];
        return {
            success: true,
            data: {
                list,
                totals: { totalAmount: list.reduce((s, u) => s + u.amount, 0) },
            },
        };
    },
};

export default statsApi;
