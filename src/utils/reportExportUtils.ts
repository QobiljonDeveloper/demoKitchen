import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────

export interface ReportColumn {
    key: string;
    header: string;
    align?: 'left' | 'center' | 'right';
}

export interface ReportMeta {
    title: string;
    branchName?: string;
    dateRange?: string;
    generatedAt?: string;
}

// ─── PDF Export ────────────────────────────────────────────

export function exportToPdf(
    meta: ReportMeta,
    columns: ReportColumn[],
    rows: Record<string, string | number>[],
): void {
    try {
        const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' });

        // Header
        doc.setFontSize(16);
        doc.text(meta.title, 14, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);

        let yPos = 22;
        if (meta.branchName) {
            doc.text(`Filial: ${meta.branchName}`, 14, yPos);
            yPos += 6;
        }
        if (meta.dateRange) {
            doc.text(`Davr: ${meta.dateRange}`, 14, yPos);
            yPos += 6;
        }
        const now = meta.generatedAt || new Date().toLocaleString('uz-UZ');
        doc.text(`Yaratilgan: ${now}`, 14, yPos);
        yPos += 8;

        doc.setTextColor(0);

        // Table
        const headers = columns.map(c => c.header);
        const body = rows.map(row => columns.map(c => String(row[c.key] ?? '')));

        autoTable(doc, {
            startY: yPos,
            head: [headers],
            body,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: {
                fillColor: [30, 41, 59], // slate-800
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
            columnStyles: columns.reduce((acc, col, i) => {
                if (col.align === 'right') acc[i] = { halign: 'right' as const };
                else if (col.align === 'center') acc[i] = { halign: 'center' as const };
                return acc;
            }, {} as Record<number, { halign: 'left' | 'center' | 'right' }>),
        });

        // Footer — page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Sahifa ${i} / ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        const fileName = `${meta.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error('PDF yaratishda xatolik yuz berdi');
    }
}

// ─── Word Export ──────────────────────────────────────────

export async function exportToWord(
    meta: ReportMeta,
    columns: ReportColumn[],
    rows: Record<string, string | number>[],
): Promise<void> {
    try {
        const now = meta.generatedAt || new Date().toLocaleString('uz-UZ');

        // Build table header row
        const headerRow = new TableRow({
            tableHeader: true,
            children: columns.map(col =>
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: col.header, bold: true, color: 'FFFFFF', size: 20 })],
                        alignment: AlignmentType.CENTER,
                    })],
                    shading: { fill: '1E293B' },
                    width: { size: Math.floor(100 / columns.length), type: WidthType.PERCENTAGE },
                })
            ),
        });

        // Build data rows
        const dataRows = rows.map((row, idx) =>
            new TableRow({
                children: columns.map(col =>
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: String(row[col.key] ?? ''), size: 18 })],
                            alignment: col.align === 'right' ? AlignmentType.RIGHT
                                : col.align === 'center' ? AlignmentType.CENTER
                                    : AlignmentType.LEFT,
                        })],
                        shading: idx % 2 === 1 ? { fill: 'F8FAFC' } : undefined,
                    })
                ),
            })
        );

        const table = new Table({
            rows: [headerRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
            },
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: meta.title,
                        heading: HeadingLevel.HEADING_1,
                        spacing: { after: 200 },
                    }),
                    ...(meta.branchName ? [new Paragraph({
                        children: [new TextRun({ text: `Filial: ${meta.branchName}`, color: '64748B', size: 20 })],
                        spacing: { after: 100 },
                    })] : []),
                    ...(meta.dateRange ? [new Paragraph({
                        children: [new TextRun({ text: `Davr: ${meta.dateRange}`, color: '64748B', size: 20 })],
                        spacing: { after: 100 },
                    })] : []),
                    new Paragraph({
                        children: [new TextRun({ text: `Yaratilgan: ${now}`, color: '64748B', size: 20 })],
                        spacing: { after: 300 },
                    }),
                    table,
                    new Paragraph({ text: '', spacing: { before: 600 } }),
                    new Paragraph({
                        children: [new TextRun({ text: 'Imzo: ________________________', size: 20 })],
                        alignment: AlignmentType.RIGHT,
                    }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const fileName = `${meta.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
        saveAs(blob, fileName);
    } catch (error) {
        console.error('Word export error:', error);
        throw new Error('Word yaratishda xatolik yuz berdi');
    }
}

// ─── Excel Download (mock — no backend) ──────────────────

export async function downloadExcel(
    reportType: string,
    _params: Record<string, string>,
): Promise<void> {
    toast.info(`Demo rejimda Excel eksport qo'llab-quvvatlanmaydi. PDF yoki Word formatini tanlang.`);
    console.log('Demo mode: Excel export skipped for', reportType);
}

