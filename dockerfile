# Use a imagem base com a versão específica do Node.js
FROM node:22.12.0-bullseye

# Instale dependências adicionais necessárias para o yt-dlp
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Instale o yt-dlp
RUN pip install yt-dlp

# Defina o diretório raiz como o diretório de trabalho
WORKDIR /

# Copie todos os arquivos do projeto para o container
COPY . /

# Instale as dependências do Node.js
RUN npm install

# Especifique o comando para iniciar o bot
CMD ["node", "src/app.js"]
