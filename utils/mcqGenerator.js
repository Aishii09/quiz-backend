// MCQ Generator with proper PDF text parsing
// Uses regex to cleanly split question text, options, and answers

const parseMCQFromText = (rawText) => {
  // Step 1: Extract answer first (e.g., "Answer: C" or "Answer: C 18")
  const answerMatch = rawText.match(/Answer:\s*([A-D])/i);
  const correctAnswerLetter = answerMatch ? answerMatch[1].toUpperCase() : null;
  
  // Step 2: Remove answer and question number from text
  let cleanText = rawText
    .replace(/Answer:\s*[A-D][\s\d]*/gi, '')
    .replace(/\s*\d+\s*$/, '')  // Remove trailing question number
    .trim();
  
  // Step 3: Extract options using improved regex
  const optionPattern = /([A-D])[\.\)]\s*([^\n]*?)(?=\s*[A-D][\.\)]|$)/gi;
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
    const firstOptionPatterns = [
      cleanText.indexOf(options[0].letter + ')'),
      cleanText.indexOf(options[0].letter + '.'),
      cleanText.indexOf(options[0].letter + ' ')
    ].filter(idx => idx !== -1);
    
    if (firstOptionPatterns.length > 0) {
      const firstOptionIndex = Math.min(...firstOptionPatterns);
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
    
    // Only add if we have valid question and options
    if (parsed.question && parsed.question.length > 5 && parsed.options.length >= 2) {
      mcqs.push({
        question: parsed.question,
        options: parsed.options,
        explanation: `The correct answer is ${parsed.correctAnswer}.`
      });
    }
  });
  
  // If no questions parsed, fallback to simple sentence-based generation
  if (mcqs.length < 10) {
    console.log('Falling back to sentence-based generation');
    return generateFromSentences(pdfText);
  }
  
  // Ensure exactly 60 questions
  while (mcqs.length < 60) {
    const originalIndex = mcqs.length % Math.max(1, mcqs.length);
    const original = mcqs[originalIndex];
    
    mcqs.push({
      ...original,
      question: original.question + ` (Variation ${Math.floor(mcqs.length / Math.max(1, mcqs.length)) + 1})`
    });
  }
  
  console.log('Generated MCQs count:', mcqs.length);
  return mcqs.slice(0, 60);
};

// Fallback: Simple sentence-based generation
const generateFromSentences = (pdfText) => {
  const sentences = pdfText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  console.log('Total sentences found:', sentences.length);
  
  if (sentences.length === 0) return [];
  
  const mcqs = [];
  
  for (let i = 0; i < 60; i++) {
    const sentenceIndex = i % sentences.length;
    const questionSentence = sentences[sentenceIndex].trim();
    
    const words = questionSentence.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) continue;
    
    const mainWord = words[Math.floor(words.length / 2)];
    
    const questionText = questionSentence
      .replace(mainWord, "___________")
      .replace(/^\s+/, '');
    
    const options = [
      { text: mainWord, isCorrect: true },
      { text: words[Math.floor(Math.random() * words.length)] || "Alternative A", isCorrect: false },
      { text: words[Math.floor(Math.random() * words.length)] || "Alternative B", isCorrect: false },
      { text: "Alternative C", isCorrect: false }
    ];
    
    options.sort(() => Math.random() - 0.5);
    
    mcqs.push({
      question: questionText,
      options: options,
      explanation: `The correct answer is "${mainWord}" based on context.`
    });
  }
  
  console.log('Generated MCQs count (fallback):', mcqs.length);
  return mcqs;
};

module.exports = { generateMCQsFromText, parseMCQFromText };