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
    console.log('Starting OCR processing for file:', imageFile.name);
    
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (JPG, PNG, WebP)');
    }
    
    // Validate file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image file is too large. Please select a file smaller than 10MB');
    }
    
    // Initialize Tesseract worker with enhanced settings
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        console.log('OCR Progress:', m);
        if (onProgress) {
          onProgress({
            status: m.status || 'processing',
            progress: m.progress || 0
          });
        }
      }
    });

    try {
      // Set parameters for better receipt recognition
      await worker.setParameters({
        'tessedit_char_whitelist': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$₹€£:-/ ()',
        'tessedit_pageseg_mode': Tesseract.PSM.SINGLE_BLOCK,
        'preserve_interword_spaces': '1',
        'tessedit_do_invert': '0'
      });

      // Process the image
      const { data: { text, confidence } } = await worker.recognize(imageFile);
      
      console.log('OCR completed with confidence:', confidence);
      console.log('Raw OCR text:', text);
      
      // Check if OCR was successful
      if (confidence < 30) {
        throw new Error('Poor image quality detected. Please ensure the receipt is well-lit, flat, and in focus');
      }
      
      if (!text || text.trim().length < 10) {
        throw new Error('Could not extract text from image. Please try with a clearer image');
      }
      
      // Parse the extracted text with enhanced algorithms
      const receiptData = parseReceiptText(text);
      receiptData.rawText = text;

      console.log('Parsed receipt data:', receiptData);
      
      // Validate parsed data
      if (!receiptData.amount && !receiptData.description && !receiptData.date) {
        throw new Error('Could not extract expense information from receipt. Please try manual entry or a clearer image');
      }
      
      return receiptData;
    } finally {
      // Always terminate worker to free memory
      await worker.terminate();
    }
  } catch (error) {
    console.error('OCR processing failed:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to process receipt image. Please ensure the image is clear and try again.');
  }
}

function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const result: ReceiptData = {};

  console.log('Parsing receipt lines:', lines);

  try {
    // Extract amount with enhanced patterns
    result.amount = extractAmount(text);
    
    // Extract date with better recognition
    result.date = extractDate(text);
    
    // Extract description (merchant name or meaningful identifier)
    result.description = extractDescription(lines);
    
    // Extract items (optional, for detailed receipts)
    result.items = extractItems(lines);
  } catch (error) {
    console.error('Error parsing receipt text:', error);
  }

  return result;
}

function extractAmount(text: string): number | undefined {
  const cleanText = text.toLowerCase();
  
  // Enhanced patterns for total amounts with better regex
  const totalPatterns = [
    // Common total patterns with word boundaries
    /(?:total|amount|sum|grand\s*total|final\s*total|balance|due)\s*:?\s*(?:\$|₹|€|£)?\s*(\d+\.?\d*)\b/gi,
    /(?:\$|₹|€|£)\s*(\d+\.?\d*)\s*(?:total|amount|sum|due)\b/gi,
    
    // Subtotal patterns (fallback)
    /(?:subtotal|sub\s*total)\s*:?\s*(?:\$|₹|€|£)?\s*(\d+\.?\d*)\b/gi,
    
    // Amount patterns
    /(?:amount|amt)\s*:?\s*(?:\$|₹|€|£)?\s*(\d+\.?\d*)\b/gi,
    
    // Payment patterns
    /(?:paid|payment|pay)\s*:?\s*(?:\$|₹|€|£)?\s*(\d+\.?\d*)\b/gi,
    
    // Net amount patterns
    /(?:net|final)\s*(?:amount|total)\s*:?\s*(?:\$|₹|€|£)?\s*(\d+\.?\d*)\b/gi
  ];

  // Try to find total amount first
  for (const pattern of totalPatterns) {
    const matches = Array.from(cleanText.matchAll(pattern));
    for (const match of matches) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0 && amount < 100000) { // Reasonable range
        console.log('Found total amount:', amount, 'from pattern:', pattern.source);
        return amount;
      }
    }
  }

  // Enhanced currency symbol patterns
  const currencyPatterns = [
    /\$\s*(\d+\.?\d*)\b/g,
    /₹\s*(\d+\.?\d*)\b/g,
    /€\s*(\d+\.?\d*)\b/g,
    /£\s*(\d+\.?\d*)\b/g,
    /(\d+\.?\d*)\s*(?:rs|rupees|dollars?|euros?|pounds?|usd|eur|gbp)\b/gi,
    // Decimal amounts that look like prices
    /\b(\d+\.\d{2})\b/g,
    // Whole number amounts in reasonable range
    /\b(\d{2,5})\b/g
  ];

  const amounts: number[] = [];
  
  for (const pattern of currencyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0 && amount < 100000) {
        amounts.push(amount);
      }
    }
  }

  if (amounts.length > 0) {
    // Return the largest amount found (likely to be the total)
    const maxAmount = Math.max(...amounts);
    console.log('Found max amount from currency patterns:', maxAmount);
    return maxAmount;
  }

  return undefined;
}

function extractDate(text: string): string | undefined {
  const today = new Date();
  
  // Enhanced date patterns with better validation
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // DD/MM/YYYY or DD-MM-YYYY (European format)
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // MM/DD/YY or MM-DD-YY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/g,
    // Month DD, YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})/gi,
    // DD Month YYYY
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/gi,
    // YYYY-MM-DD (ISO format)
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    // DD.MM.YYYY (European format)
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/g
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      try {
        let day: number, month: number, year: number;
        
        if (pattern.source.includes('january|february')) {
          // Month name patterns
          if (match[2] && match[3]) {
            // Month DD, YYYY format
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                              'july', 'august', 'september', 'october', 'november', 'december',
                              'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                              'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const monthIndex = monthNames.indexOf(match[1].toLowerCase());
            month = (monthIndex % 12) + 1;
            day = parseInt(match[2]);
            year = parseInt(match[3]);
          } else {
            // DD Month YYYY format
            day = parseInt(match[1]);
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                              'july', 'august', 'september', 'october', 'november', 'december',
                              'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                              'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const monthIndex = monthNames.indexOf(match[2].toLowerCase());
            month = (monthIndex % 12) + 1;
            year = parseInt(match[3]);
          }
        } else if (pattern.source.includes('(\\d{4})-(\\d{1,2})-(\\d{1,2})')) {
          // ISO format YYYY-MM-DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // Numeric date patterns
          const part1 = parseInt(match[1]);
          const part2 = parseInt(match[2]);
          let yearPart = parseInt(match[3]);
          
          // Handle 2-digit years
          if (yearPart < 100) {
            yearPart += yearPart < 50 ? 2000 : 1900;
          }
          
          // Smart date format detection
          if (part1 > 12 && part2 <= 12) {
            // Must be DD/MM format
            day = part1;
            month = part2;
          } else if (part2 > 12 && part1 <= 12) {
            // Must be MM/DD format
            month = part1;
            day = part2;
          } else if (part1 <= 12 && part2 <= 12) {
            // Ambiguous - use context or default to MM/DD
            // Check if we're in US context (dollar signs) vs European context
            const hasDollar = /\$/.test(text);
            const hasEuro = /€/.test(text);
            
            if (hasEuro || pattern.source.includes('\\.')) {
              // European format DD/MM
              day = part1;
              month = part2;
            } else {
              // US format MM/DD
              month = part1;
              day = part2;
            }
          } else {
            continue; // Invalid date
          }
          
          year = yearPart;
        }
        
        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= today.getFullYear() + 1) {
          const date = new Date(year, month - 1, day);
          if (date.getMonth() === month - 1 && date.getDate() === day) { // Valid date
            const dateString = date.toISOString().split('T')[0];
            console.log('Extracted date:', dateString);
            return dateString;
          }
        }
      } catch (error) {
        console.warn('Error parsing date:', error);
        continue;
      }
    }
  }

  return undefined;
}

function extractDescription(lines: string[]): string | undefined {
  // Enhanced patterns to skip
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
    /^phone:/i,
    /^address/i,
    /^location/i,
    /^store/i,
    /^cashier/i,
    /^server/i,
    /^table/i,
    /^order/i,
    /^transaction/i,
    /^ref/i,
    /^reference/i,
    /^customer/i,
    /^copy/i
  ];

  // Look for merchant name or business identifier
  for (const line of lines) {
    if (line.length < 2 || line.length > 50) continue;
    
    // Skip lines that match common patterns
    if (skipPatterns.some(pattern => pattern.test(line))) continue;
    
    // Skip lines that are mostly numbers, symbols, or currency
    if (/^[\d\s\.\-\$₹€£,\/:]+$/.test(line)) continue;
    
    // Skip lines with too many special characters
    if ((line.match(/[^\w\s]/g) || []).length > line.length * 0.4) continue;
    
    // Look for lines that seem like business names
    if (/^[A-Z][a-zA-Z\s&'\-\.]+$/.test(line) || 
        /\b(?:restaurant|cafe|coffee|shop|store|market|pharmacy|gas|station|hotel|bar|pub|mall|center|ltd|inc|corp|co)\b/i.test(line)) {
      const cleaned = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
      console.log('Extracted description:', cleaned);
      return cleaned;
    }
  }

  // Fallback: use the first meaningful line
  for (const line of lines) {
    if (line.length >= 3 && line.length <= 30) {
      if (!skipPatterns.some(pattern => pattern.test(line)) && 
          !/^[\d\s\.\-\$₹€£,]+$/.test(line) &&
          /[a-zA-Z]{2,}/.test(line)) {
        const cleaned = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
        console.log('Fallback description:', cleaned);
        return cleaned;
      }
    }
  }

  return undefined;
}

function extractItems(lines: string[]): string[] {
  const items: string[] = [];
  
  for (const line of lines) {
    // Look for lines that might be items (have text and possibly a price)
    if (line.length > 3 && line.length < 100) {
      // Check if line contains both text and numbers (potential item with price)
      const hasText = /[a-zA-Z]{2,}/.test(line);
      const hasPrice = /\d+\.?\d*/.test(line);
      
      if (hasText && hasPrice && 
          !line.toLowerCase().includes('total') && 
          !line.toLowerCase().includes('subtotal') &&
          !line.toLowerCase().includes('tax') &&
          !line.toLowerCase().includes('change') &&
          !line.toLowerCase().includes('balance')) {
        
        // Clean up the item name (remove prices and extra symbols)
        let cleanItem = line
          .replace(/\$?\d+\.?\d*/g, '') // Remove prices
          .replace(/[^\w\s]/g, ' ') // Remove special characters
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
        
        // Further cleaning
        cleanItem = cleanItem
          .split(' ')
          .filter(word => word.length > 1 && !/^\d+$/.test(word))
          .join(' ');
        
        if (cleanItem.length > 2 && cleanItem.length < 50) {
          const formattedItem = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1).toLowerCase();
          items.push(formattedItem);
        }
      }
    }
  }

  console.log('Extracted items:', items);
  return items.slice(0, 5); // Limit to first 5 items
}