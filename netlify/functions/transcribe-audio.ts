import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { audioData, mimeType } = JSON.parse(event.body || '{}');

    if (!audioData || !mimeType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Audio data and MIME type are required' }),
      };
    }

    // Convert base64 to Blob
    const binaryData = Buffer.from(audioData, 'base64');
    
    const formData = new FormData();
    formData.append('file', new Blob([binaryData], { type: mimeType }));
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ text: data.text }),
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