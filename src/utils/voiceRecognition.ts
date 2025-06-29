export interface VoiceResult {
  amount?: number;
  quantity?: number;
  description?: string;
  date?: string;
}

export function parseVoiceInput(transcript: string): VoiceResult {
  const result: VoiceResult = {};
  
  // Clean up the transcript
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing transcript:', cleanTranscript);
  
  // Extract date first (before removing numbers)
  const dateResult = extractDate(cleanTranscript);
  if (dateResult) {
    result.date = dateResult;
    console.log('Extracted date:', dateResult);
  }
  
  // Enhanced amount extraction with better currency recognition
  const amountResult = extractAmount(cleanTranscript);
  if (amountResult) {
    result.amount = amountResult;
    console.log('Extracted amount:', amountResult);
  }
  
  // Enhanced quantity extraction
  const quantityResult = extractQuantity(cleanTranscript);
  if (quantityResult) {
    result.quantity = quantityResult;
    console.log('Extracted quantity:', quantityResult);
  }
  
  // Enhanced description extraction
  const descriptionResult = extractDescription(cleanTranscript);
  if (descriptionResult) {
    result.description = descriptionResult;
    console.log('Extracted description:', descriptionResult);
  }
  
  return result;
}

function extractAmount(text: string): number | undefined {
  // Enhanced patterns for amount extraction with better word boundaries
  const amountPatterns = [
    // Direct currency mentions with amounts - more specific patterns
    /(?:for|of|paid|cost|costs|worth|price|amount|total|bill|spent)\s+(?:of|is|was|about|around)?\s*(\d+(?:\.\d{1,2})?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|bucks?)\b/gi,
    /(\d+(?:\.\d{1,2})?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|bucks?)\b/gi,
    
    // Currency symbols with better positioning
    /(?:\$|₹|€|£)\s*(\d+(?:\.\d{1,2})?)\b/gi,
    /(\d+(?:\.\d{1,2})?)\s*(?:\$|₹|€|£)\b/gi,
    
    // Contextual amount extraction
    /(?:spent|paid|cost|costs|bill|price|amount|total|worth)\s+(?:of|is|was|about|around)?\s*(\d+(?:\.\d{1,2})?)\b/gi,
    /(\d+(?:\.\d{1,2})?)\s*(?:only|each|per|total|altogether|exactly)\b/gi,
    
    // Common phrases
    /(?:it\s+)?(?:was|is|costs?)\s+(\d+(?:\.\d{1,2})?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|bucks?)\b/gi,
    /(?:around|about|approximately)\s+(\d+(?:\.\d{1,2})?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|bucks?)\b/gi
  ];

  for (const pattern of amountPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0 && amount < 1000000) { // Reasonable range
        return amount;
      }
    }
  }

  // Enhanced fallback: look for reasonable numbers in context
  const contextualNumberPattern = /\b(\d+(?:\.\d{1,2})?)\b/g;
  const numbers = Array.from(text.matchAll(contextualNumberPattern))
    .map(match => parseFloat(match[1]))
    .filter(num => num > 0 && num < 100000) // Reasonable expense range
    .filter(num => {
      // Filter out years, times, and other non-monetary numbers
      return !(num >= 1900 && num <= 2030) && // Not a year
             !(num >= 100 && num <= 2400 && num % 100 === 0) && // Not likely a time
             num !== 1; // Not just "1" without context
    });

  if (numbers.length > 0) {
    // Return the most reasonable number (prefer numbers with decimals for currency)
    const decimalNumbers = numbers.filter(num => num % 1 !== 0);
    if (decimalNumbers.length > 0) {
      return decimalNumbers[0];
    }
    return numbers[0];
  }

  return undefined;
}

function extractQuantity(text: string): number | undefined {
  // Enhanced quantity patterns with better word boundaries
  const quantityPatterns = [
    /(\d+)\s*(?:quantity|quantities|pieces?|items?|nos?|pcs?|units?|counts?|times?)\b/gi,
    /(?:quantity|pieces?|items?|nos?|pcs?|units?|counts?)\s+(?:of|is|was)?\s*(\d+)\b/gi,
    /(\d+)\s*(?:of|x|×)\s*(?:them|these|those|items?)\b/gi,
    /(?:bought|got|ordered|purchased|had)\s+(\d+)\s*(?:of|pieces?|items?)?\b/gi,
    /(\d+)\s*(?:cups?|bottles?|plates?|bowls?|glasses?)\b/gi,
    /(?:for|with)\s+(\d+)\s+(?:people|persons?|friends?)\b/gi
  ];

  for (const pattern of quantityPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const qty = parseInt(match[1]);
      if (!isNaN(qty) && qty > 1 && qty <= 100) { // Reasonable quantity range, must be > 1
        return qty;
      }
    }
  }

  return undefined;
}

function extractDescription(text: string): string | undefined {
  let description = text
    // Remove currency and amount expressions more precisely
    .replace(/(\d+(?:\.\d{1,2})?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|bucks?|\$|₹|€|£)\b/gi, '')
    .replace(/(?:\$|₹|€|£)\s*(\d+(?:\.\d{1,2})?)\b/gi, '')
    
    // Remove quantity expressions
    .replace(/(\d+)\s*(?:quantity|quantities|pieces?|items?|nos?|pcs?|units?|counts?|times?)\b/gi, '')
    .replace(/(?:quantity|pieces?|items?|nos?|pcs?|units?|counts?)\s+(?:of|is|was)?\s*(\d+)\b/gi, '')
    
    // Remove date expressions
    .replace(/\b(?:today|yesterday|tomorrow)\b/gi, '')
    .replace(/\b(?:on\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi, '')
    .replace(/\b(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(?:last|next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi, '')
    .replace(/\b\d{1,2}-\d{1,2}-\d{2,4}\b/gi, '')
    
    // Remove action words and prepositions more selectively
    .replace(/\b(?:bought|paid|spend|spent|for|of|on|with|from|to|in|at|the|a|an|and|bill|visit|got|purchased|ordered|cost|costs|worth|price|amount|total|was|is|it)\b/gi, ' ')
    
    // Remove standalone numbers but preserve words with numbers
    .replace(/\b\d+(?:\.\d+)?\b/g, ' ')
    
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Enhanced description cleaning and formatting
  if (description.length > 0) {
    // Split into words and filter meaningful ones
    const words = description
      .split(' ')
      .filter(word => word.length > 1) // Remove single characters
      .filter(word => !/^\d+$/.test(word)) // Remove pure numbers
      .filter(word => word.length < 25) // Remove very long words (likely errors)
      .filter(word => /[a-zA-Z]/.test(word)); // Must contain at least one letter

    if (words.length > 0) {
      // Capitalize first letter of each word for better presentation
      description = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Enhanced expense type mappings for better categorization
      const expenseMap: Record<string, string> = {
        'coffee': 'Coffee',
        'tea': 'Tea',
        'chai': 'Chai',
        'pizza': 'Pizza',
        'burger': 'Burger',
        'sandwich': 'Sandwich',
        'lunch': 'Lunch',
        'dinner': 'Dinner',
        'breakfast': 'Breakfast',
        'snack': 'Snacks',
        'uber': 'Uber Ride',
        'ola': 'Ola Ride',
        'taxi': 'Taxi Ride',
        'auto': 'Auto Rickshaw',
        'bus': 'Bus Fare',
        'metro': 'Metro Ticket',
        'train': 'Train Ticket',
        'gas': 'Gas/Fuel',
        'petrol': 'Petrol',
        'diesel': 'Diesel',
        'groceries': 'Groceries',
        'grocery': 'Groceries',
        'shopping': 'Shopping',
        'clothes': 'Clothes',
        'shirt': 'Shirt',
        'shoes': 'Shoes',
        'movie': 'Movie Tickets',
        'cinema': 'Cinema Tickets',
        'doctor': 'Doctor Visit',
        'medicine': 'Medicine',
        'pharmacy': 'Pharmacy',
        'electricity': 'Electricity Bill',
        'internet': 'Internet Bill',
        'phone': 'Phone Bill',
        'mobile': 'Mobile Recharge',
        'recharge': 'Mobile Recharge',
        'book': 'Books',
        'books': 'Books',
        'stationery': 'Stationery'
      };

      // Check if description matches common expense types
      const lowerDesc = description.toLowerCase();
      for (const [key, value] of Object.entries(expenseMap)) {
        if (lowerDesc.includes(key)) {
          return value;
        }
      }

      // If description is too short or generic, try to enhance it
      if (description.length < 3) {
        return undefined;
      }

      return description;
    }
  }

  return undefined;
}

function extractDate(transcript: string): string | null {
  const today = new Date();
  
  // Handle "today"
  if (/\btoday\b/i.test(transcript)) {
    return today.toISOString().split('T')[0];
  }
  
  // Handle "yesterday"
  if (/\byesterday\b/i.test(transcript)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  
  // Handle "tomorrow"
  if (/\btomorrow\b/i.test(transcript)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Enhanced date patterns
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const monthShortNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];
  
  // Handle specific dates like "June 25th", "June 25", "25th June"
  const allMonthNames = [...monthNames, ...monthShortNames];
  const monthRegex = new RegExp(`\\b(?:on\\s+)?(${allMonthNames.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');
  const monthMatch = transcript.match(monthRegex);
  
  if (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const day = parseInt(monthMatch[2]);
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = monthShortNames.indexOf(monthName);
    }
    
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      const date = new Date(today.getFullYear(), monthIndex, day);
      // If the date is in the future, assume it's for the previous year
      if (date > today) {
        date.setFullYear(today.getFullYear() - 1);
      }
      return date.toISOString().split('T')[0];
    }
  }
  
  // Handle reverse format "25th June", "25 June"
  const reverseDateRegex = new RegExp(`\\b(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${allMonthNames.join('|')})\\b`, 'i');
  const reverseDateMatch = transcript.match(reverseDateRegex);
  
  if (reverseDateMatch) {
    const day = parseInt(reverseDateMatch[1]);
    const monthName = reverseDateMatch[2].toLowerCase();
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = monthShortNames.indexOf(monthName);
    }
    
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      const date = new Date(today.getFullYear(), monthIndex, day);
      // If the date is in the future, assume it's for the previous year
      if (date > today) {
        date.setFullYear(today.getFullYear() - 1);
      }
      return date.toISOString().split('T')[0];
    }
  }
  
  // Enhanced day names handling
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Handle "last Monday", "previous Friday"
  const lastDayRegex = new RegExp(`\\b(?:last|previous)\\s+(${dayNames.join('|')})\\b`, 'i');
  const lastDayMatch = transcript.match(lastDayRegex);
  
  if (lastDayMatch) {
    const targetDayName = lastDayMatch[1].toLowerCase();
    const targetDayIndex = dayNames.indexOf(targetDayName);
    const currentDayIndex = today.getDay();
    
    let daysBack = currentDayIndex - targetDayIndex;
    if (daysBack <= 0) {
      daysBack += 7; // Go to previous week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysBack);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle "next Monday", "this Friday"
  const nextDayRegex = new RegExp(`\\b(?:next|this)\\s+(${dayNames.join('|')})\\b`, 'i');
  const nextDayMatch = transcript.match(nextDayRegex);
  
  if (nextDayMatch) {
    const targetDayName = nextDayMatch[1].toLowerCase();
    const targetDayIndex = dayNames.indexOf(targetDayName);
    const currentDayIndex = today.getDay();
    
    let daysForward = targetDayIndex - currentDayIndex;
    if (daysForward <= 0) {
      daysForward += 7; // Go to next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysForward);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle numeric dates like "12/25", "25/12", "12-25"
  const numericDateRegex = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/;
  const numericMatch = transcript.match(numericDateRegex);
  
  if (numericMatch) {
    const part1 = parseInt(numericMatch[1]);
    const part2 = parseInt(numericMatch[2]);
    const year = numericMatch[3] ? parseInt(numericMatch[3]) : today.getFullYear();
    
    // Determine date format based on values
    let month, day;
    if (part1 > 12) {
      day = part1;
      month = part2 - 1; // Month is 0-indexed
    } else if (part2 > 12) {
      month = part1 - 1;
      day = part2;
    } else {
      // Ambiguous, assume MM/DD (US format)
      month = part1 - 1;
      day = part2;
    }
    
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(year < 100 ? 2000 + year : year, month, day);
      if (date.getMonth() === month) { // Validate date
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  return null;
}

export function startVoiceRecognition(
  onResult: (result: VoiceResult) => void,
  onError: (error: string) => void,
  onStart: () => void,
  onEnd: () => void
): () => void {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    return () => {};
  }
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Enhanced recognition settings
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 5; // Get more alternatives for better parsing
  
  recognition.onstart = () => {
    console.log('Voice recognition started');
    onStart();
  };
  
  recognition.onresult = (event: any) => {
    console.log('Voice recognition results received:', event.results);
    
    // Try multiple alternatives for better accuracy
    let bestResult: VoiceResult = {};
    let bestScore = 0;
    let allTranscripts: string[] = [];
    
    for (let i = 0; i < event.results[0].length; i++) {
      const transcript = event.results[0][i].transcript.trim();
      const confidence = event.results[0][i].confidence || 0.5;
      
      allTranscripts.push(transcript);
      console.log(`Alternative ${i + 1}: "${transcript}" (confidence: ${confidence})`);
      
      const result = parseVoiceInput(transcript);
      const score = calculateResultScore(result) * confidence;
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
      }
    }
    
    // If no good result found, try combining information from all alternatives
    if (bestScore < 2) {
      console.log('Low confidence results, trying to combine alternatives...');
      bestResult = combineAlternatives(allTranscripts);
    }
    
    console.log('Best voice result:', bestResult);
    
    // Validate result before returning
    if (!bestResult.amount && !bestResult.description) {
      onError('Could not understand the expense details. Please try speaking more clearly. Example: "Coffee 50 rupees today"');
      return;
    }
    
    onResult(bestResult);
  };
  
  recognition.onerror = (event: any) => {
    console.error('Voice recognition error:', event.error);
    let errorMessage = 'Speech recognition error';
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again and speak clearly. Example: "Pizza 200 rupees yesterday"';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not accessible. Please check permissions and try again.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
      case 'aborted':
        errorMessage = 'Voice recognition was cancelled.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Speech recognition service not allowed. Please try again.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}. Please try again with clear speech.`;
    }
    onError(errorMessage);
  };
  
  recognition.onend = () => {
    console.log('Voice recognition ended');
    onEnd();
  };
  
  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start voice recognition:', error);
    onError('Failed to start speech recognition. Please ensure you have a microphone connected and try again.');
  }
  
  return () => {
    try {
      recognition.stop();
    } catch (error) {
      console.warn('Error stopping voice recognition:', error);
    }
  };
}

// Calculate a score for voice recognition results to pick the best one
function calculateResultScore(result: VoiceResult): number {
  let score = 0;
  
  if (result.amount && result.amount > 0) score += 4;
  if (result.description && result.description.length > 2) score += 3;
  if (result.date) score += 2;
  if (result.quantity && result.quantity > 1) score += 1;
  
  return score;
}

// Combine information from multiple alternatives when individual results are poor
function combineAlternatives(transcripts: string[]): VoiceResult {
  const combined: VoiceResult = {};
  
  for (const transcript of transcripts) {
    const result = parseVoiceInput(transcript);
    
    // Take the first valid value found for each field
    if (!combined.amount && result.amount) combined.amount = result.amount;
    if (!combined.description && result.description) combined.description = result.description;
    if (!combined.date && result.date) combined.date = result.date;
    if (!combined.quantity && result.quantity) combined.quantity = result.quantity;
  }
  
  return combined;
}