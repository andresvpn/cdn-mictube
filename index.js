const express = require("express");
const { ytdown } = require("nayan-media-downloaders");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const app = express();
const port = process.env.PORT || 3000;

// Ruta principal con ?url=
app.get("/", async (req, res) => {
  let videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: "error",
      error: "Falta el parámetro ?url"
    });
  }

  // ✅ Convertir enlaces cortos de youtu.be a formato largo
  if (videoUrl.includes("youtu.be/")) {
    const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
    videoUrl = "https://www.youtube.com/watch?v=" + videoId;
  }

  try {
    const result = await ytdown(videoUrl);

    // ✅ Ordenar las claves del JSON alfabéticamente
    const sortedResult = {};
    Object.keys(result).sort().forEach(key => {
      sortedResult[key] = result[key];
    });

    res.json({
      status: "ok",
      video: sortedResult
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({
      status: "error",
      error: err.message || "Error procesando el video"
    });
  }
});

// ✅ Ruta proxy para evitar errores 403 con headers personalizados
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Falta el parámetro ?url");
  }

  try {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === "https:" ? https : http;

    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com/"
      }
    };

    client.get(targetUrl, options, (proxyRes) => {
      res.setHeader("Content-Type", proxyRes.headers["content-type"] || "application/octet-stream");
      res.setHeader("Content-Disposition", proxyRes.headers["content-disposition"] || "inline");
      proxyRes.pipe(res);
    }).on("error", (err) => {
      res.status(500).send("Error al conectar al proxy: " + err.message);
    });
  } catch (err) {
    res.status(400).send("URL inválida");
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
