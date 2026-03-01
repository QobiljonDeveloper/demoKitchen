import { forwardRef } from 'react';
import type { ReportColumn, ReportMeta } from '@/utils/reportExportUtils';

interface PrintableReportProps {
    meta: ReportMeta;
    columns: ReportColumn[];
    rows: Record<string, string | number>[];
    totals?: Record<string, string | number>;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
    ({ meta, columns, rows, totals }, ref) => {
        const now = meta.generatedAt || new Date().toLocaleString('uz-UZ');

        return (
            <div ref={ref} className="print-report">
                {/* ── Print-only styles ── */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-report, .print-report * { visibility: visible; }
                        .print-report {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                        }
                        .no-print { display: none !important; }
                    }
                    @media screen {
                        .print-report {
                            background: white;
                            color: #1e293b;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 24px;
                        }
                    }
                    .print-report table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    .print-report thead {
                        display: table-header-group;
                    }
                    .print-report thead th {
                        background: #1e293b;
                        color: #fff;
                        padding: 8px 12px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 2px solid #0f172a;
                    }
                    .print-report tbody td {
                        padding: 6px 12px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .print-report tbody tr:nth-child(even) {
                        background: #f8fafc;
                    }
                    .print-report tfoot td {
                        padding: 8px 12px;
                        font-weight: 700;
                        border-top: 2px solid #1e293b;
                        background: #f1f5f9;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                `}</style>

                {/* ── Header ── */}
                <div style={{ marginBottom: '16px', borderBottom: '2px solid #1e293b', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                Kitchen ERP
                            </h1>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '4px 0 0', color: '#334155' }}>
                                {meta.title}
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                            {meta.branchName && <div>Filial: <strong>{meta.branchName}</strong></div>}
                            {meta.dateRange && <div>Davr: {meta.dateRange}</div>}
                            <div>Yaratilgan: {now}</div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }} className="text-center">#</th>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                    Ma'lumotlar topilmadi
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="text-center" style={{ color: '#94a3b8' }}>{idx + 1}</td>
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                                        >
                                            {row[col.key] ?? ''}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {totals && (
                        <tfoot>
                            <tr>
                                <td className="text-center">—</td>
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                                    >
                                        {totals[col.key] ?? ''}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>

                {/* ── Footer / Signature ── */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <div>
                        <div>Sana: ________________________</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>Imzo: ________________________</div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableReport.displayName = 'PrintableReport';
