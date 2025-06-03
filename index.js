const express = require("express");
const { ytdown } = require("nayan-media-downloaders");

const app = express();
const port = process.env.PORT || 3000;

// Ruta raíz
app.get("/", async (req, res) => {
  try {
    const result = await ytdown("https://youtu.be/aRSuyrZFu_Q?si=bsfzgeeGmRpsHqnF");
    
    res.json({
      status: "ok",
      video: result
    });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🟢 Servidor activo en http://localhost:${port}`);
});
