# Imagen base con Node y herramientas necesarias
FROM node:18-slim

# Instala python3, ffmpeg, y otras dependencias básicas
RUN apt-get update && \
    apt-get install -y python3 ffmpeg curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crea directorio de app
WORKDIR /app

# Copia los archivos del proyecto
COPY . .

# Instala dependencias
RUN npm install

# Expone el puerto
EXPOSE 3000

# Comando por defecto
CMD ["node", "index.js"]
