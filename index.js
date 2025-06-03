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

// Ruta para descargar video mp4 (redirige al navegador)
app.get("/mp4/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const videoLink = data.data.video_hd || data.data.video;

    if (!videoLink) {
      return res.status(404).send("Video no disponible para descarga");
    }

    // Redirigir al navegador con headers de descarga
    res.setHeader("Content-Disposition", `attachment; filename="${id}.mp4"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.redirect(videoLink); // El navegador hará la descarga

  } catch (err) {
    console.error("Error al redirigir MP4:", err);
    res.status(500).send("Error interno al procesar MP4");
  }
});

// Ruta para descargar audio mp3 (redirige al navegador)
app.get("/mp3/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const audioLink = data.data.audio;

    if (!audioLink) {
      return res.status(404).send("Audio no disponible para descarga");
    }

    // Detectar si es webm
    const isWebm = audioLink.includes(".webm") || audioLink.includes("mime=audio/webm");

    // Usar extensión real
    const ext = isWebm ? "webm" : "mp3";

    res.setHeader("Content-Disposition", `attachment; filename="${id}.${ext}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.redirect(audioLink); // Descarga directa

  } catch (err) {
    console.error("Error al redirigir MP3:", err);
    res.status(500).send("Error interno al procesar MP3");
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
