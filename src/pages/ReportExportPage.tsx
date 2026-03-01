import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, FileText, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/ui/date-input';
import { MonthPicker } from '@/components/ui/month-picker';
import { Skeleton } from '@/components/ui/skeleton';

import { PrintableReport } from '@/components/reports/PrintableReport';
import { exportToPdf, exportToWord, downloadExcel, ReportColumn, ReportMeta } from '@/utils/reportExportUtils';
import { reportsApi, statsApi, MonthlyStats } from '@/api/stats';
import { ItemBalance } from '@/api/stock';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatQuantity } from '@/utils/unitConverter';
import { toast } from 'sonner';

type ReportType = 'financial' | 'stock-balances' | 'cash' | 'salaries' | 'utilities';

interface ReportConfig {
    label: string;
    columns: ReportColumn[];
}

const REPORT_CONFIGS: Record<ReportType, ReportConfig> = {
    financial: {
        label: 'Moliyaviy Hisobot',
        columns: [
            { key: 'date', header: 'Sana' },
            { key: 'income', header: 'Kirim', align: 'right' },
            { key: 'expense', header: 'Chiqim', align: 'right' },
            { key: 'net', header: 'Sof Foyda', align: 'right' },
            { key: 'purchases', header: 'Xaridlar', align: 'right' },
            { key: 'salaries', header: 'Maoshlar', align: 'right' },
            { key: 'utilities', header: 'Kommunal', align: 'right' },
        ],
    },
    'stock-balances': {
        label: 'Ombor Qoldiqlari',
        columns: [
            { key: 'itemName', header: 'Mahsulot' },
            { key: 'balance', header: 'Qoldiq', align: 'right' },
            { key: 'unit', header: 'Birlik', align: 'center' },
            { key: 'minStock', header: 'Min. Zaxira', align: 'right' },
            { key: 'status', header: 'Holat', align: 'center' },
        ],
    },
    cash: {
        label: 'Kassa Hisoboti',
        columns: [
            { key: 'date', header: 'Sana' },
            { key: 'type', header: 'Turi', align: 'center' },
            { key: 'category', header: 'Kategoriya' },
            { key: 'amount', header: 'Summa', align: 'right' },
            { key: 'note', header: 'Izoh' },
        ],
    },
    salaries: {
        label: 'Maosh Hisoboti',
        columns: [
            { key: 'employeeName', header: 'Xodim' },
            { key: 'amountPaid', header: 'Maosh', align: 'right' },
            { key: 'bonus', header: 'Bonus', align: 'right' },
            { key: 'penalty', header: 'Jarima', align: 'right' },
            { key: 'total', header: 'Jami', align: 'right' },
            { key: 'datePaid', header: 'Sana' },
            { key: 'note', header: 'Izoh' },
        ],
    },
    utilities: {
        label: 'Kommunal Hisobot',
        columns: [
            { key: 'date', header: 'Sana' },
            { key: 'utilityType', header: 'Turi' },
            { key: 'providerName', header: 'Provayder' },
            { key: 'consumption', header: 'Sarfiyot', align: 'right' },
            { key: 'amount', header: 'Summa', align: 'right' },
            { key: 'note', header: 'Izoh' },
        ],
    },
};

// ─── Data Transformers ────────────────────────────────────

function transformFinancialRows(stats: MonthlyStats): { rows: Record<string, string | number>[]; totals: Record<string, string | number> } {
    const rows = stats.dailyBreakdown.map(d => ({
        date: format(new Date(d.date), 'dd.MM.yyyy'),
        income: formatCurrency(d.income),
        expense: formatCurrency(d.expense),
        net: formatCurrency(d.net),
        purchases: formatCurrency(d.purchases),
        salaries: formatCurrency(d.salaries),
        utilities: formatCurrency(d.utilities),
    }));

    const totals = {
        date: 'JAMI',
        income: formatCurrency(stats.incomeTotal),
        expense: formatCurrency(stats.expenseTotal),
        net: formatCurrency(stats.net),
        purchases: formatCurrency(stats.purchasesTotal),
        salaries: formatCurrency(stats.salaryTotal),
        utilities: formatCurrency(stats.utilitiesTotal),
    };

    return { rows, totals };
}

function transformStockRows(balances: ItemBalance[]): { rows: Record<string, string | number>[]; totals: undefined } {
    const rows = balances.map(b => ({
        itemName: b.itemName,
        balance: formatQuantity(b.balance, b.unit),
        unit: b.unit,
        minStock: b.minStock ? formatQuantity(b.minStock, b.unit) : '—',
        status: b.belowMinStock ? '⚠️ Kam' : '✅ Yetarli',
    }));
    return { rows, totals: undefined };
}

function transformCashRows(data: any[]): { rows: Record<string, string | number>[]; totals: Record<string, string | number> } {
    let totalIncome = 0;
    let totalExpense = 0;

    const rows = data.map(tx => {
        if (tx.type === 'INCOME') totalIncome += tx.amount;
        else totalExpense += tx.amount;

        return {
            date: format(new Date(tx.date), 'dd.MM.yyyy'),
            type: tx.type === 'INCOME' ? 'Kirim' : 'Chiqim',
            category: tx.category || '—',
            amount: formatCurrency(tx.amount),
            note: tx.note || '—',
        };
    });

    const totals = {
        date: 'JAMI',
        type: '',
        category: '',
        amount: `Kirim: ${formatCurrency(totalIncome)} | Chiqim: ${formatCurrency(totalExpense)}`,
        note: '',
    };

    return { rows, totals };
}

function transformSalaryRows(data: any): { rows: Record<string, string | number>[]; totals: Record<string, string | number> } {
    const payments = data.payments || [];
    const rows = payments.map((p: any) => ({
        employeeName: p.employeeId?.fullName || '—',
        amountPaid: formatCurrency(p.amountPaid),
        bonus: formatCurrency(p.bonus || 0),
        penalty: formatCurrency(p.penalty || 0),
        total: formatCurrency((p.amountPaid || 0) + (p.bonus || 0) - (p.penalty || 0)),
        datePaid: format(new Date(p.datePaid), 'dd.MM.yyyy'),
        note: p.note || '—',
    }));

    const totals = {
        employeeName: 'JAMI',
        amountPaid: formatCurrency(data.totalPaid || 0),
        bonus: formatCurrency(data.totalBonus || 0),
        penalty: formatCurrency(data.totalPenalty || 0),
        total: formatCurrency((data.totalPaid || 0) + (data.totalBonus || 0) - (data.totalPenalty || 0)),
        datePaid: '',
        note: `${data.paymentsCount || 0} ta to'lov`,
    };

    return { rows, totals };
}

function transformUtilityRows(data: any): { rows: Record<string, string | number>[]; totals: Record<string, string | number> } {
    const list = data.list || [];
    const rows = list.map((u: any) => ({
        date: format(new Date(u.date), 'dd.MM.yyyy'),
        utilityType: u.utilityType === 'OTHER' ? (u.customTypeLabel || 'Boshqa') : u.utilityType,
        providerName: u.providerName || '—',
        consumption: u.consumption != null ? `${u.consumption} ${u.unit}` : '—',
        amount: formatCurrency(u.amount),
        note: u.note || '—',
    }));

    const totals = {
        date: 'JAMI',
        utilityType: '',
        providerName: '',
        consumption: '',
        amount: formatCurrency(data.totals?.totalAmount || 0),
        note: `${list.length} ta yozuv`,
    };

    return { rows, totals };
}

// ─── Component ────────────────────────────────────────────

export function ReportExportPage() {
    const { user } = useAuthStore();
    const printRef = useRef<HTMLDivElement>(null);

    const [reportType, setReportType] = useState<ReportType>('financial');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const config = REPORT_CONFIGS[reportType];

    // ── Queries ──
    const { data: financialData, isLoading: isFinancialLoading } = useQuery({
        queryKey: ['report-export', 'financial', selectedMonth],
        queryFn: () => statsApi.getMonthly(selectedMonth),
        enabled: reportType === 'financial',
    });

    const { data: stockData, isLoading: isStockLoading } = useQuery({
        queryKey: ['report-export', 'stock-balances'],
        queryFn: reportsApi.getStockBalances,
        enabled: reportType === 'stock-balances',
    });

    const { data: cashData, isLoading: isCashLoading } = useQuery({
        queryKey: ['report-export', 'cash', dateFrom, dateTo],
        queryFn: () => reportsApi.getCashReport({ from: dateFrom, to: dateTo }),
        enabled: reportType === 'cash',
    });

    const { data: salaryData, isLoading: isSalaryLoading } = useQuery({
        queryKey: ['report-export', 'salaries', selectedMonth],
        queryFn: () => reportsApi.getSalariesReport(selectedMonth),
        enabled: reportType === 'salaries',
    });

    const { data: utilityData, isLoading: isUtilityLoading } = useQuery({
        queryKey: ['report-export', 'utilities', dateFrom, dateTo],
        queryFn: () => reportsApi.getUtilitiesReport({ from: dateFrom, to: dateTo }),
        enabled: reportType === 'utilities',
    });

    // ── Transform data ──
    const getTransformedData = (): { rows: Record<string, string | number>[]; totals?: Record<string, string | number> } => {
        switch (reportType) {
            case 'financial':
                if (!financialData?.data) return { rows: [] };
                return transformFinancialRows(financialData.data);
            case 'stock-balances':
                if (!stockData?.data) return { rows: [] };
                return transformStockRows(stockData.data);
            case 'cash':
                if (!cashData?.data) return { rows: [] };
                return transformCashRows(cashData.data);
            case 'salaries':
                if (!salaryData?.data) return { rows: [] };
                return transformSalaryRows(salaryData.data);
            case 'utilities':
                if (!utilityData?.data) return { rows: [] };
                return transformUtilityRows(utilityData.data);
            default:
                return { rows: [] };
        }
    };

    const { rows, totals } = getTransformedData();
    const isLoading = isFinancialLoading || isStockLoading || isCashLoading || isSalaryLoading || isUtilityLoading;

    const getDateRange = (): string => {
        if (reportType === 'financial' || reportType === 'salaries') {
            return format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: uz });
        }
        if (reportType === 'stock-balances') {
            return format(new Date(), 'dd.MM.yyyy');
        }
        return `${format(new Date(dateFrom), 'dd.MM.yyyy')} — ${format(new Date(dateTo), 'dd.MM.yyyy')}`;
    };

    const meta: ReportMeta = {
        title: config.label,
        branchName: user?.branchName,
        dateRange: getDateRange(),
    };

    // ── Print handler ──
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${config.label}_${new Date().toISOString().split('T')[0]}`,
    });

    // ── Export handlers ──
    const handleExportPdf = useCallback(async () => {
        setIsExporting('pdf');
        try {
            exportToPdf(meta, config.columns, rows);
            toast.success('PDF muvaffaqiyatli yuklandi');
        } catch {
            toast.error('PDF yaratishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [meta, config.columns, rows]);

    const handleExportWord = useCallback(async () => {
        setIsExporting('word');
        try {
            await exportToWord(meta, config.columns, rows);
            toast.success('Word muvaffaqiyatli yuklandi');
        } catch {
            toast.error('Word yaratishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [meta, config.columns, rows]);

    const handleExportExcel = useCallback(async () => {
        setIsExporting('excel');
        try {
            const params: Record<string, string> = {};
            if (reportType === 'financial' || reportType === 'salaries') {
                params.month = selectedMonth;
            } else if (reportType !== 'stock-balances') {
                params.from = dateFrom;
                params.to = dateTo;
            }
            await downloadExcel(reportType, params);
            toast.success('Excel muvaffaqiyatli yuklandi');
        } catch {
            toast.error('Excel yuklab olishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [reportType, selectedMonth, dateFrom, dateTo]);

    const usesMonthPicker = reportType === 'financial' || reportType === 'salaries';
    const usesDateRange = reportType === 'cash' || reportType === 'utilities';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/reports">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Hisobot Eksport</h1>
                        <p className="text-muted-foreground">Chop etish, PDF, Word va Excel formatlarida yuklash</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Hisobot sozlamalari</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Report Type */}
                        <div className="space-y-2">
                            <Label>Hisobot turi</Label>
                            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(REPORT_CONFIGS).map(([key, cfg]) => (
                                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Month picker for financial/salaries */}
                        {usesMonthPicker && (
                            <div className="space-y-2">
                                <Label>Oy</Label>
                                <MonthPicker
                                    date={parse(selectedMonth, 'yyyy-MM', new Date())}
                                    setDate={(date) => setSelectedMonth(format(date, 'yyyy-MM'))}
                                />
                            </div>
                        )}

                        {/* Date range for cash/utilities */}
                        {usesDateRange && (
                            <>
                                <div className="space-y-2">
                                    <Label>Boshlanish sanasi</Label>
                                    <DateInput
                                        date={dateFrom ? new Date(dateFrom + 'T00:00:00') : undefined}
                                        setDate={(d) => setDateFrom(d ? format(d, 'yyyy-MM-dd') : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'))}
                                        placeholder="Boshlanish sanasi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tugash sanasi</Label>
                                    <DateInput
                                        date={dateTo ? new Date(dateTo + 'T00:00:00') : undefined}
                                        setDate={(d) => setDateTo(d ? format(d, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))}
                                        placeholder="Tugash sanasi"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={() => handlePrint()}
                    disabled={isLoading || rows.length === 0}
                    className="gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Chop etish
                </Button>
                <Button
                    variant="outline"
                    onClick={handleExportPdf}
                    disabled={isLoading || rows.length === 0 || isExporting === 'pdf'}
                    className="gap-2"
                >
                    {isExporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    PDF yuklash
                </Button>
                <Button
                    variant="outline"
                    onClick={handleExportWord}
                    disabled={isLoading || rows.length === 0 || isExporting === 'word'}
                    className="gap-2"
                >
                    {isExporting === 'word' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                    Word yuklash
                </Button>
                <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    disabled={isLoading || rows.length === 0 || isExporting === 'excel'}
                    className="gap-2"
                >
                    {isExporting === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                    Excel yuklash
                </Button>
            </div>

            {/* Preview */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Ko'rinish</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : (
                        <PrintableReport
                            ref={printRef}
                            meta={meta}
                            columns={config.columns}
                            rows={rows}
                            totals={totals}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ReportExportPage;
