import Tesseract from 'tesseract.js';

export interface ReceiptData {
  amount?: number;
  date?: string;
  description?: string;
  items?: string[];
  rawText?: string;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export async function processReceiptImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<ReceiptData> {
  try {
    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (onProgress) {
          onProgress({
            status: m.status,
            progress: m.progress || 0
          });
        }
      }
    });

    // Process the image
    const { data: { text } } = await worker.recognize(imageFile);
    
    // Terminate worker to free memory
    await worker.terminate();

    // Parse the extracted text
    const receiptData = parseReceiptText(text);
    receiptData.rawText = text;

    return receiptData;
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to process receipt image. Please try again.');
  }
}

function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const result: ReceiptData = {};

  // Extract amount (look for total, subtotal, amount patterns)
  result.amount = extractAmount(text);
  
  // Extract date
  result.date = extractDate(text);
  
  // Extract description (merchant name or first meaningful line)
  result.description = extractDescription(lines);
  
  // Extract items (optional)
  result.items = extractItems(lines);

  return result;
}

function extractAmount(text: string): number | undefined {
  const cleanText = text.toLowerCase();
  
  // Patterns for total amounts
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /subtotal[:\s]*\$?(\d+\.?\d*)/i,
    /grand total[:\s]*\$?(\d+\.?\d*)/i,
    /final total[:\s]*\$?(\d+\.?\d*)/i,
    /balance[:\s]*\$?(\d+\.?\d*)/i
  ];

  // Try to find total amount first
  for (const pattern of totalPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // If no total found, look for currency symbols with amounts
  const currencyPatterns = [
    /\$(\d+\.?\d*)/g,
    /₹(\d+\.?\d*)/g,
    /€(\d+\.?\d*)/g,
    /£(\d+\.?\d*)/g,
    /(\d+\.?\d*)\s*(?:rs|rupees|dollars?|euros?|pounds?)/gi
  ];

  const amounts: number[] = [];
  
  for (const pattern of currencyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount);
      }
    }
  }

  // Return the largest amount found (likely to be the total)
  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  return undefined;
}

function extractDate(text: string): string | undefined {
  const today = new Date();
  
  // Date patterns to match
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // MM/DD/YY or MM-DD-YY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/g,
    // Month DD, YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/gi,
    // DD Month YYYY
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      let day: number, month: number, year: number;
      
      if (pattern.source.includes('january|february')) {
        // Month name patterns
        if (match[2] && match[3]) {
          // Month DD, YYYY format
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'];
          month = monthNames.indexOf(match[1].toLowerCase()) + 1;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else {
          // DD Month YYYY format
          day = parseInt(match[1]);
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'];
          month = monthNames.indexOf(match[2].toLowerCase()) + 1;
          year = parseInt(match[3]);
        }
      } else {
        // Numeric date patterns
        const part1 = parseInt(match[1]);
        const part2 = parseInt(match[2]);
        let yearPart = parseInt(match[3]);
        
        // Handle 2-digit years
        if (yearPart < 100) {
          yearPart += yearPart < 50 ? 2000 : 1900;
        }
        
        // Determine if it's MM/DD or DD/MM based on values
        if (part1 > 12) {
          // Must be DD/MM
          day = part1;
          month = part2;
        } else if (part2 > 12) {
          // Must be MM/DD
          month = part1;
          day = part2;
        } else {
          // Ambiguous - assume MM/DD (US format) for receipts
          month = part1;
          day = part2;
        }
        
        year = yearPart;
      }
      
      // Validate date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= today.getFullYear() + 1) {
        const date = new Date(year, month - 1, day);
        if (date.getMonth() === month - 1) { // Valid date
          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  return undefined;
}

function extractDescription(lines: string[]): string | undefined {
  // Skip common receipt headers and look for merchant name
  const skipPatterns = [
    /^\d+$/,
    /^receipt$/i,
    /^invoice$/i,
    /^bill$/i,
    /^tax$/i,
    /^total$/i,
    /^subtotal$/i,
    /^amount$/i,
    /^date$/i,
    /^time$/i,
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
    /^\d{1,2}:\d{2}/,
    /^thank you/i,
    /^visit us/i,
    /^www\./i,
    /^tel:/i,
    /^phone:/i
  ];

  for (const line of lines) {
    if (line.length < 3 || line.length > 50) continue;
    
    // Skip lines that match common patterns
    if (skipPatterns.some(pattern => pattern.test(line))) continue;
    
    // Skip lines that are mostly numbers or symbols
    if (/^[\d\s\.\-\$₹€£,]+$/.test(line)) continue;
    
    // This is likely the merchant name or description
    return line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
  }

  return undefined;
}

function extractItems(lines: string[]): string[] {
  const items: string[] = [];
  
  for (const line of lines) {
    // Look for lines that might be items (have text and possibly a price)
    if (line.length > 3 && line.length < 100) {
      // Check if line contains both text and numbers (potential item with price)
      const hasText = /[a-zA-Z]{3,}/.test(line);
      const hasPrice = /\d+\.?\d*/.test(line);
      
      if (hasText && hasPrice && !line.toLowerCase().includes('total')) {
        // Clean up the item name (remove prices and extra symbols)
        const cleanItem = line
          .replace(/\$?\d+\.?\d*/g, '')
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanItem.length > 2) {
          items.push(cleanItem);
        }
      }
    }
  }

  return items.slice(0, 5); // Limit to first 5 items
}