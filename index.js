const express = require('express');
const youtubedl = require('youtube-dl-exec');
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/cdn/:format(mp3|mp4)/:id', async (req, res) => {
  const { format, id } = req.params;
  const url = `https://www.youtube.com/watch?v=${id}`;

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
    });

    let selectedFormat;

    if (format === 'mp3') {
      selectedFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'webm' && f.asr);
    } else {
      selectedFormat = info.formats.find(f => f.ext === 'mp4' && f.height && f.url);
    }

    if (!selectedFormat || !selectedFormat.url) {
      return res.status(404).json({
        status: 'error',
        error: 'No se encontró una URL válida para este video/formato.'
      });
    }

    return res.redirect(selectedFormat.url);

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: err.message || 'Error interno'
    });
  }
});

app.get('/', (req, res) => {
  res.send('by: andres vpn');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
