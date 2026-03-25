// This is a simple MCQ generator using text extraction
// For production, use an AI API like OpenAI, Hugging Face, or Gemini

const generateMCQsFromText = (pdfText) => {
  // Split text into sentences
  const sentences = pdfText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Generate MCQs from sentences (simple implementation)
  const mcqs = [];
  
  for (let i = 0; i < Math.min(10, sentences.length - 3); i++) {
    const questionSentence = sentences[i].trim();
    
    // Extract key terms (simplified - in production use NLP)
    const words = questionSentence.split(/\s+/);
    const mainWord = words[Math.floor(words.length / 2)];
    
    // Create question by blanking out a word
    const questionText = questionSentence
      .replace(mainWord, "___________")
      .replace(/^\s+/, '');
    
    // Create options
    const options = [
      { text: mainWord, isCorrect: true },
      { text: "Random option 1", isCorrect: false },
      { text: "Random option 2", isCorrect: false },
      { text: "Random option 3", isCorrect: false }
    ];
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    mcqs.push({
      question: questionText,
      options: options,
      explanation: `The correct answer is "${mainWord}" based on the context.`
    });
  }
  
  return mcqs;
};

module.exports = { generateMCQsFromText };