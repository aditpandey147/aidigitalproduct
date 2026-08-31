// backend/services/generation/excelGenerator.js
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelGenerator {
  constructor(productData, spec) {
    this.productData = productData;
    this.spec = spec;
  }

  async generateExcel() {
    console.log('📊 Generating Excel file from specification...');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.productData.authorName || 'AI Digital Product Factory';
    workbook.created = new Date();

    const sheets = this.spec.sheets || [];

    for (const sheetData of sheets) {
      const sheet = workbook.addWorksheet(sheetData.name, {
        properties: { tabColor: { argb: 'FF4CAF50' } },
        pageSetup: { orientation: 'portrait', fitToPage: true }
      });

      // Add columns
      const columns = sheetData.columns || [];
      sheet.columns = columns.map(col => ({
        header: col.header,
        key: col.header.toLowerCase().replace(/\s/g, '_'),
        width: col.width || 20,
      }));

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;

      // Add rows
      const rows = sheetData.rows || [];
      for (const rowData of rows) {
        const row = sheet.addRow(rowData);
        row.alignment = { vertical: 'middle' };
        row.height = 20;
      }

      // Add formulas
      if (sheetData.formulas) {
        for (const [cell, formula] of Object.entries(sheetData.formulas)) {
          const cellRef = sheet.getCell(cell);
          cellRef.value = { formula: formula };
          cellRef.font = { bold: true, color: { argb: 'FF2196F3' } };
        }
      }

      // Apply formatting to specific columns
      for (const col of sheet.columns) {
        if (col.type === 'number') {
          const column = sheet.getColumn(col.header);
          column.numFmt = '#,##0.00';
        }
        if (col.type === 'date') {
          const column = sheet.getColumn(col.header);
          column.numFmt = 'yyyy-mm-dd';
        }
      }

      // Add borders
      const lastRow = sheet.rowCount;
      const lastCol = sheet.columnCount;
      
      for (let i = 1; i <= lastRow; i++) {
        for (let j = 1; j <= lastCol; j++) {
          const cell = sheet.getCell(i, j);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
          };
        }
      }

      // Auto-filter for header row
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: lastCol }
      };

      // Freeze header row
      sheet.views = [
        { state: 'frozen', ySplit: 1 }
      ];
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    console.log(`  ✅ Excel file generated: ${buffer.length} bytes`);
    return buffer;
  }

  async saveExcel(buffer) {
    const filename = `spreadsheet_${this.productData.productId || Date.now()}.xlsx`;
    const excelDir = path.join(__dirname, '../../uploads/excel');
    
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const excelPath = path.join(excelDir, filename);
    fs.writeFileSync(excelPath, buffer);
    console.log(`  💾 Excel saved: ${excelPath} (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    return excelPath;
  }
}

module.exports = ExcelGenerator;