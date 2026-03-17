const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { q, tl } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing text query' });
  }

  const lang = tl || 'vi';
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(q)}`;

  try {
    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS responded with ${response.status}`);
    }

    // Set headers to allow browser to play the audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Stream the audio back to the client
    response.body.pipe(res);
  } catch (error) {
    console.error('TTS Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch TTS from Google' });
  }
};
