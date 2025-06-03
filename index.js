const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/cdn/:format/:id', async (req, res) => {
  const { format, id } = req.params;

  try {
    if (!['mp3', 'mp4'].includes(format)) {
      throw new Error('Formato inválido. Usa mp3 o mp4.');
    }

    if (!ytdl.validateID(id)) {
      throw new Error('ID de video inválido.');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    if (format === 'mp4') {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      ytdl(videoUrl, {
        quality: 'highest',
        filter: (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio,
      }).pipe(res);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      ytdl(videoUrl, {
        quality: 'highestaudio',
        filter: 'audioonly',
      }).pipe(res);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(400).json({
      status: 'error',
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
