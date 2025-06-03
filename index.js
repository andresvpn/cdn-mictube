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
    const data = await ytdown(videoUrl);

    // Extraemos los campos que queremos renombrar
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

    // Imprimimos por consola el resultado limpio
    console.log("📦 Resultado limpio:");
    console.log(JSON.stringify(result, null, 2));

    // Respondemos al cliente con formato limpio
    res.json({
      status: "ok",
      result: result
    });
  } catch (err) {
    console.error("❌ Error al obtener el video:", err);
    res.status(500).json({
      status: "error",
      error: "No se pudo procesar el video"
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
