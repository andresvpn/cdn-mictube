const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

// Ruta principal: http://localhost:3000/?url=https://youtube.com/...
app.get("/", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: "error",
      error: "Falta el parámetro ?url"
    });
  }

  try {
    const result = await ytdown(videoUrl);

    // Ordenar las claves alfabéticamente
    const sortedResult = {};
    Object.keys(result)
      .sort()
      .forEach((key) => {
        sortedResult[key] = result[key];
      });

    // Imprimir en consola
    console.log("🎬 Resultados ordenados:");
    console.log(JSON.stringify(sortedResult, null, 2));

    // Respuesta ordenada
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

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
