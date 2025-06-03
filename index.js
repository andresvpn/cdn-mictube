const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

// Ruta JSON principal
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

 const https = require("https"); // mejor para URLs HTTPS externas
app.get("/mp3/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const audioUrl = data.data.audio;

    if (!audioUrl) return res.status(404).send("Audio no disponible");

    const isWebm = audioUrl.includes(".webm") || audioUrl.includes("mime=audio/webm");
    const ext = isWebm ? "webm" : "mp3";
    const filename = `${id}.${ext}`;

    // Cabeceras para forzar descarga
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "audio/mpeg");

    // Pipeo del audio remoto al usuario
    https.get(audioUrl, (stream) => {
      stream.pipe(res);
    }).on("error", (err) => {
      console.error("❌ Error al descargar audio:", err);
      res.status(500).send("Error al descargar audio");
    });

  } catch (err) {
    console.error("❌ Error procesando MP3:", err);
    res.status(500).send("Error interno");
  }
});

app.get("/mp4/:id_video", async (req, res) => {
  const id = req.params.id_video;
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  try {
    const data = await ytdown(videoUrl);
    const videoUrlFinal = data.data.video_hd || data.data.video;

    if (!videoUrlFinal) return res.status(404).send("Video no disponible");

    const filename = `${id}.mp4`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "video/mp4");

    https.get(videoUrlFinal, (stream) => {
      stream.pipe(res);
    }).on("error", (err) => {
      console.error("❌ Error al descargar video:", err);
      res.status(500).send("Error al descargar video");
    });

  } catch (err) {
    console.error("❌ Error procesando MP4:", err);
    res.status(500).send("Error interno");
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
