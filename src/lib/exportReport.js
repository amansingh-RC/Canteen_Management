import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const cell = (row, col) => {
  const v = row[col.key];
  return v === undefined || v === null ? "" : v;
};

export function exportToExcel(filename, sheetName, columns, rows) {
  const header = columns.map((c) => c.label);
  const body = rows.map((r) => columns.map((c) => cell(r, c)));
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf(filename, title, subtitle, columns, rows) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize?.(14);
  doc.text(title, 14, 16);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(subtitle, 14, 22);
    doc.setTextColor(0);
  }
  autoTable(doc, {
    startY: subtitle ? 26 : 22,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => String(cell(r, c)))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [31, 45, 61] },
  });
  doc.save(`${filename}.pdf`);
}
