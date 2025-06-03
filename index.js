Utiliza este agrega la respuesta del JSON Entonces has agrega header user agent todo bien ya funcional y que la respuesta JSON la muestre ordenaba en el navegador ejemplo

Uso: usuario,
Has:Jajaj
No 
Jaja: jaja, jaja: hijo

const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

// Ruta con parámetro GET ?url=
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
    res.json({
      status: "ok",
      video: result
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
  Mejor solo dame el resultado en JSON ordenando y ya 
