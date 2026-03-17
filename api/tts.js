module.exports = async (req, res) => {
  const { q, tl } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing text query' });
  }

  const lang = tl || 'vi';
  // Use client=tw-ob for better compatibility with Google TTS
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(q)}`;

  try {
    // Note: No 'require' needed, using global fetch available in Node 18+
    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS responded with ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Send the audio buffer
    res.status(200).send(buffer);

  } catch (error) {
    console.error('TTS Proxy Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch TTS from Google',
      details: error.message 
    });
  }
};
