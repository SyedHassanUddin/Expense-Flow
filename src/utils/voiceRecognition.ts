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
  
  // Extract date first (before removing numbers)
  const dateResult = extractDate(cleanTranscript);
  if (dateResult) {
    result.date = dateResult;
  }
  
  // Extract amount (look for numbers followed by currency words or standalone numbers)
  const amountRegex = /(\d+(?:\.\d+)?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|\$|₹|€|£)/gi;
  const amountMatches = cleanTranscript.match(amountRegex);
  
  if (amountMatches) {
    const amountMatch = amountMatches[0];
    const amount = parseFloat(amountMatch.replace(/[^\d.]/g, ''));
    if (!isNaN(amount) && amount > 0) {
      result.amount = amount;
    }
  } else {
    // Look for standalone numbers that might be amounts
    const standaloneNumberRegex = /\b(\d+(?:\.\d+)?)\b/g;
    const numbers = cleanTranscript.match(standaloneNumberRegex);
    if (numbers) {
      const potentialAmounts = numbers
        .map(num => parseFloat(num))
        .filter(num => num > 0 && num < 100000); // Reasonable amount range
      
      if (potentialAmounts.length > 0) {
        result.amount = potentialAmounts[0];
        
        // If there's a second reasonable number, it might be quantity
        if (potentialAmounts.length > 1 && potentialAmounts[1] <= 50) {
          result.quantity = potentialAmounts[1];
        }
      }
    }
  }
  
  // Extract quantity specifically (look for quantity keywords)
  const quantityRegex = /(\d+)\s*(?:quantity|quantities|pieces?|items?|nos?|pcs?|units?)/gi;
  const quantityMatch = cleanTranscript.match(quantityRegex);
  
  if (quantityMatch) {
    const qtyNum = parseInt(quantityMatch[0].replace(/[^\d]/g, ''));
    if (!isNaN(qtyNum) && qtyNum > 0 && qtyNum <= 100) {
      result.quantity = qtyNum;
    }
  }
  
  // Extract description (remove numbers, currency, quantity, and date expressions)
  let description = cleanTranscript
    // Remove currency expressions
    .replace(/(\d+(?:\.\d+)?)\s*(?:rupees?|dollars?|euros?|pounds?|rs|usd|eur|gbp|\$|₹|€|£)/gi, '')
    // Remove quantity expressions
    .replace(/(\d+)\s*(?:quantity|quantities|pieces?|items?|nos?|pcs?|units?)/gi, '')
    // Remove date expressions
    .replace(/\b(?:today|yesterday|tomorrow)\b/gi, '')
    .replace(/\b(?:on\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi, '')
    .replace(/\b(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(?:last|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi, '')
    .replace(/\b\d{1,2}-\d{1,2}-\d{2,4}\b/gi, '')
    // Remove action words and prepositions
    .replace(/\b(?:bought|paid|spend|spent|for|of|on|with|from|to|in|at|the|a|an|and|bill|visit)\b/gi, '')
    // Remove standalone numbers
    .replace(/\b\d+(?:\.\d+)?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Clean up description further
  if (description.length > 0) {
    // Capitalize first letter and clean up
    description = description
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    result.description = description;
  }
  
  return result;
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
  
  // Handle specific dates like "June 25th", "June 25", "25th June"
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const monthRegex = new RegExp(`\\b(?:on\\s+)?(${monthNames.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');
  const monthMatch = transcript.match(monthRegex);
  
  if (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const day = parseInt(monthMatch[2]);
    const monthIndex = monthNames.indexOf(monthName);
    
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
  const reverseDateRegex = new RegExp(`\\b(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames.join('|')})\\b`, 'i');
  const reverseDateMatch = transcript.match(reverseDateRegex);
  
  if (reverseDateMatch) {
    const day = parseInt(reverseDateMatch[1]);
    const monthName = reverseDateMatch[2].toLowerCase();
    const monthIndex = monthNames.indexOf(monthName);
    
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      const date = new Date(today.getFullYear(), monthIndex, day);
      // If the date is in the future, assume it's for the previous year
      if (date > today) {
        date.setFullYear(today.getFullYear() - 1);
      }
      return date.toISOString().split('T')[0];
    }
  }
  
  // Handle day names like "last Monday", "next Friday"
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayRegex = new RegExp(`\\b(?:last|previous)\\s+(${dayNames.join('|')})\\b`, 'i');
  const dayMatch = transcript.match(dayRegex);
  
  if (dayMatch) {
    const targetDayName = dayMatch[1].toLowerCase();
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
  
  // Handle next day names like "next Monday"
  const nextDayRegex = new RegExp(`\\bnext\\s+(${dayNames.join('|')})\\b`, 'i');
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
    
    // Assume MM/DD format if first number > 12, otherwise DD/MM
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
      return date.toISOString().split('T')[0];
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
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    onStart();
  };
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log('Voice transcript:', transcript); // For debugging
    const result = parseVoiceInput(transcript);
    console.log('Parsed result:', result); // For debugging
    onResult(result);
  };
  
  recognition.onerror = (event: any) => {
    let errorMessage = 'Speech recognition error';
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not accessible. Please check permissions.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone access.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }
    onError(errorMessage);
  };
  
  recognition.onend = () => {
    onEnd();
  };
  
  try {
    recognition.start();
  } catch (error) {
    onError('Failed to start speech recognition. Please try again.');
  }
  
  return () => {
    try {
      recognition.stop();
    } catch (error) {
      // Ignore errors when stopping
    }
  };
}