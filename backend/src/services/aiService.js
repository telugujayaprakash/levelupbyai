const cleanJsonString = (raw) => {
  let clean = raw.trim();
  if (clean.startsWith("```json")) {
    clean = clean.substring("```json".length);
  } else if (clean.startsWith("```")) {
    clean = clean.substring("```".length);
  }
  if (clean.endsWith("```")) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
};

const buildPrompt = (technology, difficulty, count, specificTopic) => {
  const topicConstraint = specificTopic 
    ? `Specifically focused on the topic: "${specificTopic}".` 
    : `Cover typical intermediate to advanced subtopics of ${technology} matching the difficulty level.`;

  return `
    Generate exactly ${count} multiple-choice questions for practicing ${technology}.
    Difficulty level: ${difficulty}.
    ${topicConstraint}

    Requirements:
    1. Exactly 4 option strings.
    2. One correct answer index only (either 0, 1, 2, or 3).
    3. No duplicate questions.
    4. Practical coding knowledge, focus on real scenarios and best practices.
    5. Include granular subtopic name in the "topic" field (must NOT be just the language name itself, use subtopics like 'React Hooks', 'Streams API', 'SQL Joins' etc.).
    6. Include explanation for the correct answer.
    7. Include "wrongExplanations" explaining why the other choices are incorrect for each index (0, 1, 2, 3), except the correct answer. For example, if correctAnswer is 1, elements "0", "2", "3" must explain why they are wrong, and "1" can be left as "Correct answer." or similar.

    Strictly output JSON in this format:
    {
      "questions": [
        {
          "question": "question text",
          "options": [
            "option 0",
            "option 1",
            "option 2",
            "option 3"
          ],
          "correctAnswer": 0,
          "topic": "topic name",
          "correctExplanation": "explanation text",
          "wrongExplanations": {
            "0": "Explanation for option 0",
            "1": "Explanation for option 1",
            "2": "Explanation for option 2",
            "3": "Explanation for option 3"
          }
        }
      ]
    }

    Provide JSON only. Do not wrap in markdown or any other text except raw JSON.
  `.trim();
};

const callGeminiApi = async (apiKey, prompt) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key is not configured.');
  }

  // Fallback chain in case of 503 (high demand) or 404 (model not found)
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  let lastError = null;
  let rateLimitError = null;

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        const error = new Error(`Gemini API error on ${model}: ${response.status} - ${errText}`);
        lastError = error;

        // If rate limit (429) or quota exceeded, save this error specifically
        if (response.status === 429 || errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('limit')) {
          rateLimitError = error;
        }
        
        // If high demand (503), rate limit (429), or model unavailable (404), fallback to next
        if ([503, 429, 404].includes(response.status)) {
          console.warn(`[AI Service] ${model} failed (${response.status}), falling back to next model...`);
          continue;
        }
        // For other auth/bad request errors, fail immediately
        throw error;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text;
    } catch (err) {
      lastError = err;
      // Network errors -> fallback to next
      console.warn(`[AI Service] Network or parsing error on ${model}, falling back...`, err.message);
      continue;
    }
  }

  throw rateLimitError || lastError || new Error('All Gemini fallback models failed.');
};

const callOpenAiApi = async (apiKey, prompt) => {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API key is not configured.');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return text;
};

const generateQuiz = async (provider, customApiKey, technology, difficulty, count, specificTopic) => {
  const prompt = buildPrompt(technology, difficulty, count, specificTopic);
  let responseText;

  if (provider?.toLowerCase() === 'openai') {
    responseText = await callOpenAiApi(customApiKey, prompt);
  } else {
    responseText = await callGeminiApi(customApiKey, prompt);
  }

  if (!responseText) {
    throw new Error('AI provider returned an empty response.');
  }

  const cleaned = cleanJsonString(responseText);
  const parsed = JSON.parse(cleaned);

  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error('AI response is not formatted as a valid quiz object.');
  }

  // Validate schema
  const validQuestions = parsed.questions.filter((q) => {
    return (
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer <= 3 &&
      q.topic &&
      q.correctExplanation &&
      q.wrongExplanations
    );
  });

  if (validQuestions.length === 0) {
    throw new Error('AI response contains no valid questions matching the practice schema.');
  }

  return { questions: validQuestions };
};

const testConnection = async (provider, apiKey) => {
  try {
    const res = await generateQuiz(provider, apiKey, 'CSS', 'Foundation', 1);
    return res !== null && res.questions?.length > 0;
  } catch (error) {
    console.error('Test connection failed:', error);
    return false;
  }
};

module.exports = {
  generateQuiz,
  testConnection
};
