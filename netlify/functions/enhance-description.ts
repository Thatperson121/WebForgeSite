import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { description } = JSON.parse(event.body || '{}');

    if (!description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Description is required' }),
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional project manager and technical writer. Your task is to take a project description and enhance it into a clear, professional, and comprehensive project specification. Focus on technical details, key features, and business value. Keep the tone professional and concise."
          },
          {
            role: "user",
            content: `Please enhance this project description into a professional project specification: ${description}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate enhanced description');
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        enhancedDescription: data.choices[0].message.content.trim() 
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
    };
  }
};

export { handler }; 