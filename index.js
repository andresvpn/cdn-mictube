const express = require('express');
const youtubedl = require('youtube-dl-exec');
const https = require('https');

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
      selectedFormat = info.formats.find(f => (f.ext === 'm4a' || f.ext === 'webm') && f.asr);
    } else {
      selectedFormat = info.formats.find(f => f.ext === 'mp4' && f.height && f.url);
    }

    if (!selectedFormat || !selectedFormat.url) {
      return res.status(404).json({
        status: 'error',
        error: 'No se encontró una URL válida para este video/formato.'
      });
    }

    const filename = `${info.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    // Hacer proxy del contenido
    https.get(selectedFormat.url, (stream) => {
      stream.pipe(res);
    }).on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ status: 'error', error: 'Error al descargar el archivo' });
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: err.message || 'Error interno'
    });
  }
});

app.get('/', (req, res) => {
  res.send('🎬 by: andres vpn - YouTube Downloader');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
