// backend/services/generation/pdfCoverReplacer.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

class PdfCoverReplacer {
  constructor(productId, productData) {
    this.productId = productId;
    this.productData = productData;
  }

  async replaceCover(existingPdfPath, newCoverImageUrl) {
    console.log('📄 Replacing PDF cover page...');

    try {
      // Step 1: Read existing PDF
      const existingPdfBytes = fs.readFileSync(existingPdfPath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Step 2: Get total pages and page size
      const totalPages = pdfDoc.getPageCount();
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();
      console.log(`  📄 Existing PDF has ${totalPages} pages`);
      console.log(`  📐 Page size: ${width} x ${height}`);

      // Step 3: Download image
      let imageBuffer = await this._downloadImage(newCoverImageUrl);
      console.log(`  📥 Image size: ${imageBuffer.length} bytes`);

      // Step 4: Convert to PNG using sharp (most reliable)
      console.log('  🔄 Converting image to PNG...');
      try {
        imageBuffer = await sharp(imageBuffer)
          .png({
            compressionLevel: 6,
            adaptiveFiltering: true,
            force: true
          })
          .toBuffer();
        console.log(`  ✅ Image converted to PNG: ${imageBuffer.length} bytes`);
      } catch (convertError) {
        console.error('  ❌ Sharp conversion failed:', convertError.message);
        // Try fallback - just use as-is
      }

      // Step 5: Embed image as PNG
      let image;
      try {
        image = await pdfDoc.embedPng(imageBuffer);
        console.log(`  ✅ Image embedded: ${image.width}x${image.height}`);
      } catch (embedError) {
        console.error('  ❌ PNG embed failed:', embedError.message);
        // Try as JPEG as fallback
        try {
          const jpgBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();
          image = await pdfDoc.embedJpg(jpgBuffer);
          console.log(`  ✅ Image embedded as JPG: ${image.width}x${image.height}`);
        } catch (jpgError) {
          console.error('  ❌ JPG embed failed:', jpgError.message);
          throw new Error('Failed to embed image in any format');
        }
      }

      // Step 6: Create new PDF
      const newPdfDoc = await PDFDocument.create();
      
      // Add cover page with same size
      const coverPage = newPdfDoc.addPage([width, height]);
      
      // ✅ Draw image to fill page - CENTERED and COVERING
      const imgWidth = image.width;
      const imgHeight = image.height;
      const pageRatio = width / height;
      const imgRatio = imgWidth / imgHeight;
      
      let drawWidth, drawHeight, x, y;
      
      if (imgRatio > pageRatio) {
        // Image is wider, fit to height
        drawHeight = height;
        drawWidth = height * imgRatio;
        x = (width - drawWidth) / 2;
        y = 0;
      } else {
        // Image is taller, fit to width
        drawWidth = width;
        drawHeight = width / imgRatio;
        x = 0;
        y = (height - drawHeight) / 2;
      }
      
      console.log(`  📐 Drawing: x=${Math.round(x)}, y=${Math.round(y)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);
      
      coverPage.drawImage(image, {
        x: x,
        y: y,
        width: drawWidth,
        height: drawHeight,
        opacity: 1,
      });

      // Step 7: Copy remaining pages
      for (let i = 1; i < totalPages; i++) {
        try {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
          newPdfDoc.addPage(copiedPage);
        } catch (copyError) {
          console.warn(`  ⚠️ Could not copy page ${i + 1}: ${copyError.message}`);
        }
      }

      // Step 8: Save
      const newPdfBytes = await newPdfDoc.save();
      
      // Step 9: Save to file
      const newPdfPath = await this._savePDF(newPdfBytes);
      
      // Step 10: Verify
      const stats = fs.statSync(newPdfPath);
      console.log(`  ✅ PDF saved: ${newPdfPath} (${stats.size} bytes)`);
      console.log(`  📄 Pages: ${newPdfDoc.getPageCount()}`);
      
      // Verify PDF can be opened
      try {
        await PDFDocument.load(fs.readFileSync(newPdfPath));
        console.log('  ✅ PDF verified - valid');
      } catch (e) {
        console.warn('  ⚠️ PDF verification warning:', e.message);
      }
      
      return newPdfPath;

    } catch (error) {
      console.error('❌ Cover replacement failed:', error.message);
      console.error('  Stack:', error.stack);
      throw error;
    }
  }

  // ================================================================
  // DOWNLOAD IMAGE
  // ================================================================

  async _downloadImage(url) {
    console.log('  📥 Downloading cover image...');
    
    try {
      // Handle data URLs
      if (url.startsWith('data:image')) {
        console.log('  📥 Data URL detected');
        const matches = url.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          console.log(`  ✅ Base64 decoded: ${buffer.length} bytes`);
          return buffer;
        }
      }
      
      // Handle regular URLs
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`  ✅ Downloaded: ${response.data.byteLength} bytes`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      throw error;
    }
  }

  // ================================================================
  // SAVE PDF
  // ================================================================

  async _savePDF(buffer) {
    const filename = `product_${this.productId}_cover_${Date.now()}.pdf`;
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, filename);
    fs.writeFileSync(pdfPath, buffer);
    console.log(`  💾 Saved: ${pdfPath}`);
    
    return pdfPath;
  }
}

module.exports = PdfCoverReplacer;