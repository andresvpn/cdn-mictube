const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: "error",
      error: "Falta el parámetro ?url"
    });
  }

  try {
    const data = await ytdown(videoUrl);

    const result = {
      titulo: data.data.title,
      imagen: data.data.thumb,
      video: data.data.video,
      video_hd: data.data.video_hd,
      audio: data.data.audio,
      calidad: data.data.quality,
      canal: data.data.channel,
      descripcion: data.data.desc
    };

    console.log("📦 Resultado limpio:");
    console.log(JSON.stringify(result, null, 2));

    res.set({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    });

    res.send(JSON.stringify({
      status: "ok",
      result: result
    }, null, 2));

  } catch (err) {
    console.error("❌ Error al obtener el video:", err);
    res.status(500).json({
      status: "error",
      error: "No se pudo procesar el video"
    });
  }
});

// Ruta para descargar video mp4
app.get("/mp4/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const videoLink = data.data.video_hd || data.data.video;

    if (!videoLink) {
      return res.status(404).send("Video no disponible para descarga");
    }

    // Fetch video stream desde url externa
    const response = await fetch(videoLink);
    if (!response.ok) {
      return res.status(404).send("No se pudo descargar el video");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${id}.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    // Stream directo al cliente
    response.body.pipe(res);

  } catch (err) {
    console.error("Error descargando mp4:", err);
    res.status(500).send("Error interno al descargar mp4");
  }
});

// Ruta para descargar audio mp3
app.get("/mp3/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const audioLink = data.data.audio;

    if (!audioLink) {
      return res.status(404).send("Audio no disponible para descarga");
    }

    const response = await fetch(audioLink);
    if (!response.ok) {
      return res.status(404).send("No se pudo descargar el audio");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${id}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    response.body.pipe(res);

  } catch (err) {
    console.error("Error descargando mp3:", err);
    res.status(500).send("Error interno al descargar mp3");
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
