import { useState, useRef, useCallback } from 'react';
import { format, parse } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, FileText, FileSpreadsheet, FileDown, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthPicker } from '@/components/ui/month-picker';

import { PrintableReport } from '@/components/reports/PrintableReport';
import { exportToPdf, exportToWord, downloadExcel, ReportColumn, ReportMeta } from '@/utils/reportExportUtils';
import { useMonthlyBalances } from '@/hooks/queries/useStock';
import { MonthlyItemBalance } from '@/api/stock';
import { useAuthStore } from '@/stores/authStore';
import { formatQuantity } from '@/utils/unitConverter';
import { toast } from 'sonner';

// ─── Columns ──────────────────────────────────────────────

const COLUMNS: ReportColumn[] = [
    { key: 'itemName', header: 'Mahsulot' },
    { key: 'unit', header: 'Birlik', align: 'center' },
    { key: 'openingBalance', header: 'Oy boshiga', align: 'right' },
    { key: 'inQty', header: 'Kirim', align: 'right' },
    { key: 'outQty', header: 'Chiqim', align: 'right' },
    { key: 'closingBalance', header: 'Oy oxiriga', align: 'right' },
    { key: 'status', header: 'Holat', align: 'center' },
];

// ─── Transform ────────────────────────────────────────────

function transformRows(balances: MonthlyItemBalance[]): {
    rows: Record<string, string | number>[];
    totals: Record<string, string | number>;
} {
    const rows = balances.map(b => ({
        itemName: b.itemName,
        unit: b.unit,
        openingBalance: formatQuantity(b.openingBalance, b.unit),
        inQty: formatQuantity(b.inQty, b.unit),
        outQty: formatQuantity(b.outQty, b.unit),
        closingBalance: formatQuantity(b.closingBalance, b.unit),
        status: b.belowMinStock ? '⚠️ Kam' : '✅ Yetarli',
    }));

    // Totals row — count only
    const totals: Record<string, string | number> = {
        itemName: 'JAMI',
        unit: `${balances.length} ta`,
        openingBalance: '',
        inQty: '',
        outQty: '',
        closingBalance: '',
        status: `${balances.filter(b => b.belowMinStock).length} ta kam`,
    };

    return { rows, totals };
}

// ─── Component ────────────────────────────────────────────

export function MonthlyInventoryPage() {
    const { user } = useAuthStore();
    const printRef = useRef<HTMLDivElement>(null);

    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [isExporting, setIsExporting] = useState<string | null>(null);

    // Fetch monthly balances
    const { data, isLoading } = useMonthlyBalances(selectedMonth);
    const balances: MonthlyItemBalance[] = data?.data || [];
    const { rows, totals } = transformRows(balances);
    const lowStockCount = balances.filter(b => b.belowMinStock).length;

    const monthLabel = format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: uz });

    const meta: ReportMeta = {
        title: `Ombor Qoldiqlari — ${monthLabel}`,
        branchName: user?.branchName,
        dateRange: monthLabel,
    };

    // ── Print ──
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Ombor_Ostatka_${selectedMonth}`,
    });

    // ── PDF ──
    const handleExportPdf = useCallback(async () => {
        setIsExporting('pdf');
        try {
            exportToPdf(meta, COLUMNS, rows);
            toast.success('PDF muvaffaqiyatli yuklandi');
        } catch {
            toast.error('PDF yaratishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [meta, rows]);

    // ── Word ──
    const handleExportWord = useCallback(async () => {
        setIsExporting('word');
        try {
            await exportToWord(meta, COLUMNS, rows);
            toast.success('Word muvaffaqiyatli yuklandi');
        } catch {
            toast.error('Word yaratishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [meta, rows]);

    // ── Excel ──
    const handleExportExcel = useCallback(async () => {
        setIsExporting('excel');
        try {
            await downloadExcel('monthly-inventory', { month: selectedMonth });
            toast.success('Excel muvaffaqiyatli yuklandi');
        } catch {
            toast.error('Excel yuklab olishda xatolik');
        } finally {
            setIsExporting(null);
        }
    }, [selectedMonth]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/stock">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Ombor Ostatka</h1>
                        <p className="text-muted-foreground">Oylik ombor qoldiqlari hisoboti</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Davr tanlash</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label>Oy</Label>
                            <MonthPicker
                                date={parse(selectedMonth, 'yyyy-MM', new Date())}
                                setDate={(date) => setSelectedMonth(format(date, 'yyyy-MM'))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Low stock warning */}
            {lowStockCount > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Diqqat: {lowStockCount} ta mahsulot oy oxiriga kam qolgan
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

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

            {/* Report Preview */}
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
                            columns={COLUMNS}
                            rows={rows}
                            totals={totals}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default MonthlyInventoryPage;
