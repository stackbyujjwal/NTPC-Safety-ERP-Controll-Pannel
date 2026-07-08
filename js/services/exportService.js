/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Export & Printing Utility Service (Excel CSV, Print Layouts)
 */

class ExportService {
    exportToCSV(headers, rows, filename) {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\r\n";

        rows.forEach(row => {
            const escapedRow = row.map(val => {
                const str = String(val !== null && val !== undefined ? val : "");
                return `"${str.replace(/"/g, '""')}"`;
            });
            csvContent += escapedRow.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    printPrintableView(title, contentHTML) {
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        printWindow.document.write(`
            <html>
            <head>
                <title>${title} - NTPC Safety Portal</title>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; padding: 30px; color: #1E293B; }
                    .print-header { text-align: center; border-bottom: 3px solid #0A2647; padding-bottom: 15px; margin-bottom: 25px; }
                    .print-header h1 { color: #0A2647; margin: 0; font-size: 24px; text-transform: uppercase; }
                    .print-header h3 { color: #144272; margin: 5px 0 0; font-size: 14px; font-weight: 500; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                    th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
                    th { background-color: #F8F9FA; color: #0A2647; font-weight: 700; text-transform: uppercase; }
                    .print-footer { margin-top: 40px; border-top: 1px solid #CBD5E1; padding-top: 15px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>NTPC Limited - Safety & Fire Services Management System</h1>
                    <h3>${title} | Generated on: ${new Date().toLocaleString()}</h3>
                </div>
                ${contentHTML}
                <div class="print-footer">
                    <div>System: NTPC Safety Portal v4.8.0</div>
                    <div>Authorized Safety Signatory: _______________________</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    }
}

export const exportService = new ExportService();
