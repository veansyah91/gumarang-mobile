import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatIDR } from '@/src/utils/currency';

export type TransactionPdfRow = {
  date: string;
  description: string;
  debit: number;
  credit: number;
};

type ExportPdfOptions = {
  title: string;
  startDate?: string;
  endDate?: string;
  rows: TransactionPdfRow[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildHtml({
  title,
  startDate,
  endDate,
  rows,
}: ExportPdfOptions) {
  const bodyRows = rows
    .map(
      (row, index) => `
        <tr>
          <td style="text-align:center">${index + 1}</td>
          <td style="text-align:center">${escapeHtml(formatDateLabel(row.date))}</td>
          <td>${escapeHtml(row.description)}</td>
          <td style="text-align:right">${formatIDR(row.debit)}</td>
          <td style="text-align:right">${formatIDR(row.credit)}</td>
        </tr>
      `,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 12px;
        color: #0f172a;
        margin: 24px;
      }
      h1 {
        font-size: 18px;
        margin: 0 0 12px;
      }
      .meta {
        margin: 2px 0;
        color: #475569;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      th, td {
        border: 1px solid #94a3b8;
        padding: 6px 8px;
        font-size: 12px;
      }
      th {
        background-color: #f1f5f9;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Tanggal Awal: ${escapeHtml(startDate ? formatDateLabel(startDate) : '')}</p>
    <p class="meta">Tanggal Akhir: ${escapeHtml(endDate ? formatDateLabel(endDate) : '')}</p>
    <table>
      <thead>
        <tr>
          <th style="width:40px">No.</th>
          <th style="width:110px">Tanggal</th>
          <th>Deskripsi</th>
          <th style="width:130px">Debit</th>
          <th style="width:130px">Kredit</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;
}

export async function exportTransactionsToPdf(options: ExportPdfOptions) {
  const html = buildHtml(options);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: options.title,
      UTI: 'com.adobe.pdf',
    });
  }
}
