const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

// Obtener info del video
app.get("/", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ status: "error", error: "Falta el parámetro ?url" });
  }

  try {
    const result = await ytdown(videoUrl);

    // Inyectar URLs de descarga con tu proxy
    result.download = result.download.map(item => ({
      ...item,
      proxiedUrl: `/proxy?url=${encodeURIComponent(item.url)}`
    }));

    res.json({ status: "ok", video: result });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ status: "error", error: err.message || "Error procesando el video" });
  }
});

// Proxy que reenvía los headers correctos
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Falta parámetro ?url");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Connection": "keep-alive"
      }
    });

    if (!response.ok) {
      return res.status(500).send("No se pudo obtener el video");
    }

    res.setHeader("Content-Disposition", "attachment");
    res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp4");

    response.body.pipe(res);
  } catch (err) {
    console.error("❌ Error en proxy:", err.message);
    res.status(500).send("Error en proxy");
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
