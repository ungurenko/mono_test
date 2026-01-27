
import { jsPDF } from "jspdf";
import { PdfStyle } from "../types";

const cleanMarkdown = (text: string): string => {
  let clean = text.replace(/\*\*/g, '');
  clean = clean.replace(/(^|[^\\])\*/g, '$1'); 
  return clean.trim();
};

const loadFont = async (): Promise<string> => {
  const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error("Failed to load font");
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (e) {
    console.error("Font loading failed", e);
    return "";
  }
};

export const generatePDF = async (content: string, originalFileName: string, style: PdfStyle = PdfStyle.CLASSIC): Promise<void> => {
  const fontPromise = loadFont();

  return new Promise((resolve) => {
    setTimeout(async () => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const fontBase64 = await fontPromise;
      if (fontBase64) {
        doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto'); 
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      // Style Configurations
      const config = {
        [PdfStyle.CLASSIC]: {
          accentColor: [230, 230, 250], // Lavender
          headerColor: [74, 74, 74],
          lineWeight: 0.8,
          showSidebar: false
        },
        [PdfStyle.ACADEMIC]: {
          accentColor: [40, 40, 40], // Dark Grey/Black
          headerColor: [0, 0, 0],
          lineWeight: 0.3,
          showSidebar: false
        },
        [PdfStyle.CREATIVE]: {
          accentColor: [176, 224, 230], // Powder Blue
          headerColor: [0, 128, 128], // Teal
          lineWeight: 1.5,
          showSidebar: true
        }
      }[style];

      const renderPageDecorations = () => {
        if (config.showSidebar) {
          doc.setFillColor(216, 243, 220); // Sage
          doc.rect(0, 0, 5, pageHeight, 'F');
        }
      };

      renderPageDecorations();

      // Title
      doc.setFontSize(26);
      doc.setTextColor(config.headerColor[0], config.headerColor[1], config.headerColor[2]);
      doc.text("Конспект", margin, y);
      y += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      const dateStr = new Date().toLocaleDateString('ru-RU');
      doc.text(`Источник: ${originalFileName} • ${dateStr} • Стиль: ${style}`, margin, y);
      y += 12;

      // Separator
      doc.setDrawColor(config.accentColor[0], config.accentColor[1], config.accentColor[2]);
      doc.setLineWidth(config.lineWeight);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      const lines = content.split('\n');

      lines.forEach((line) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          renderPageDecorations();
          y = margin;
        }

        const trimmed = line.trim();

        if (line.startsWith('## ')) {
          y += 5;
          doc.setFontSize(18);
          doc.setTextColor(config.headerColor[0], config.headerColor[1], config.headerColor[2]);
          const text = cleanMarkdown(line.replace('## ', ''));
          const splitText = doc.splitTextToSize(text, contentWidth);
          doc.text(splitText, margin, y);
          y += (splitText.length * 8) + 3;
        } 
        else if (line.startsWith('### ')) {
          y += 3;
          doc.setFontSize(14);
          doc.setTextColor(80, 80, 80);
          const text = cleanMarkdown(line.replace('### ', ''));
          const splitText = doc.splitTextToSize(text, contentWidth);
          doc.text(splitText, margin, y);
          y += (splitText.length * 7) + 2;
        }
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
           doc.setFontSize(11);
           doc.setTextColor(60, 60, 60);
           const contentRaw = trimmed.substring(2);
           const text = '• ' + cleanMarkdown(contentRaw);
           const splitText = doc.splitTextToSize(text, contentWidth - 8);
           doc.text(splitText, margin + 5, y);
           y += (splitText.length * 6) + 1;
        }
        else if (trimmed.length > 0) {
           doc.setFontSize(11);
           doc.setTextColor(60, 60, 60);
           const text = cleanMarkdown(line);
           const splitText = doc.splitTextToSize(text, contentWidth);
           doc.text(splitText, margin, y);
           y += (splitText.length * 6) + 2;
        } else {
          y += 4;
        }
      });

      const cleanName = originalFileName.replace('.txt', '').replace(/\s+/g, '_');
      doc.save(`${cleanName}_конспект_${style.toLowerCase()}.pdf`);
      resolve();
    }, 1000); 
  });
};
