// MCQ Generator with proper PDF text parsing
// Uses regex to cleanly split question text, options, and answers

const parseMCQFromText = (rawText) => {
  // Step 1: Extract answer first (e.g., "Answer: C" or "Answer: C 18")
  const answerMatch = rawText.match(/Answer:\s*([A-D])/i);
  const correctAnswerLetter = answerMatch ? answerMatch[1].toUpperCase() : null;
  
  // Step 2: Remove answer and question number from text
  let cleanText = rawText
    .replace(/Answer:\s*[A-D][\s\d]*/gi, '')
    .replace(/^\d+\.\s*/, '')  // Remove leading question number
    .trim();
  
  // Step 3: Extract options using improved regex for A) B) C) D) format
  const optionPattern = /([A-D])\)\s*([^\n]*?)(?=\s*[A-D]\)|$)/gi;
  const options = [];
  let match;
  
  while ((match = optionPattern.exec(cleanText)) !== null) {
    const optionLetter = match[1].toUpperCase();
    const optionText = match[2].trim();
    options.push({
      letter: optionLetter,
      text: optionText
    });
  }
  
  // Step 4: Extract question text (everything before first option)
  let questionText = cleanText;
  if (options.length > 0) {
    const firstOptionIndex = cleanText.search(/[A-D]\)/);
    if (firstOptionIndex !== -1) {
      questionText = cleanText.substring(0, firstOptionIndex).trim();
    }
  }
  
  // Clean up question text
  questionText = questionText
    .replace(/^[A-D][\.\)]\s*/, '')  // Remove any leading option letter
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim();
  
  // Step 5: Build proper options array with isCorrect flag
  const parsedOptions = options.map(opt => ({
    text: opt.text,
    isCorrect: opt.letter === correctAnswerLetter
  }));
  
  // If no correct answer found, mark first option as correct (fallback)
  if (!correctAnswerLetter && parsedOptions.length > 0) {
    parsedOptions[0].isCorrect = true;
  }
  
  return {
    question: questionText,
    options: parsedOptions,
    correctAnswer: correctAnswerLetter
  };
};

// Main function to generate MCQs from PDF text
const generateMCQsFromText = (pdfText) => {
  console.log('PDF text length:', pdfText.length);
  console.log('PDF text sample:', pdfText.substring(0, 500));
  
  // Split by question numbers (1. 2. 3. etc.)
  const questionBlocks = pdfText.split(/\d+\.\s+/).filter(block => block.trim().length > 20);
  
  const mcqs = [];
  
  questionBlocks.forEach((block, index) => {
    if (!block.trim() || block.trim().length < 20) return;
    
    // Try to parse each block as an MCQ
    const parsed = parseMCQFromText(block.trim());
    
    // Only add if we have valid question and exactly 4 options
    if (parsed.question && parsed.question.length > 5 && parsed.options.length === 4) {
      mcqs.push({
        question: parsed.question,
        options: parsed.options
      });
    }
  });
  
  console.log('Valid MCQs parsed:', mcqs.length);
  
  // Return only valid questions (no fallback to sample questions)
  return mcqs;
};

module.exports = { generateMCQsFromText, parseMCQFromText };