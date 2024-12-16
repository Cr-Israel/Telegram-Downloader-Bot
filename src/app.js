require('dotenv').config();
const telegramBot = require('node-telegram-bot-api');
const youtubedl = require('youtube-dl-exec')
const fs = require('fs');

const token = process.env.TOKEN;
console.log(token)
const bot = new telegramBot(token, { polling: true });

bot.on('polling_error', (err) => {
  console.log(err, err.cause);
})

bot.getMe()
  .then((me) => console.log(`Bot conectado: ${me.username}`))
  .catch((err) => console.error('Erro de conexão com o Telegram:', err));


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Bem-vindo ao Bot de Download do YouTube!\nEnvie uma URL do YouTube para baixar o vídeo ou áudio.`
  );
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const url = msg.text;

  // if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
  //   return bot.sendMessage(chatId, 'Por favor, envie uma URL do YouTube válida.');
  // }

  while (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    bot.sendMessage(chatId, 'Por favor, envie uma URL do YouTube válida.');
    return;
  }

  bot.sendMessage(chatId, 'Você quer baixar vídeo ou áudio? Digite "video" ou "audio".');

  bot.once('message', (response) => {
    const choice = response.text.toLowerCase();

    if (choice === 'video') {
      bot.sendMessage(chatId, 'Baixando vídeo... Isso pode levar alguns minutos.');

      const fileSizeLimit = 50 * 1024 * 1024 //50MB

      // Obter informações do vídeo
      youtubedl(url, { dumpSingleJson: true })
        .then((data) => {
          const fileName = `${data.title}.mp4`; // Define o nome do arquivo

          // Baixar o vídeo com o nome correto
          youtubedl(url, {
            output: fileName,
            format: 'mp4',
          }).then(() => {
            const stats = fs.statSync(fileName)
            const fileSizeInBytes = stats.size

            if (fileSizeInBytes > fileSizeLimit) {
              bot.sendMessage(chatId, 'O vídeo é muito grande para ser enviado pelo Telegram (limite: 50 MB). Envie um vídeo menor.');
              return;
            }

            bot.sendMessage(chatId, 'Download concluído! Enviando o vídeo...');
            bot.sendVideo(chatId, fileName).then(() => {
              // Excluir o arquivo após o envio
              fs.unlinkSync(fileName);
            });
          })
        }).catch((error) => {
          console.error('Erro ao baixar o vídeo:', error);
          bot.sendMessage(chatId, 'Ocorreu um erro ao baixar o vídeo. Por favor, tente novamente.');
        });
    } else if (choice === 'audio') {
      bot.sendMessage(chatId, 'Baixando áudio... Isso pode levar alguns minutos.');

      const fileSizeLimit = 50 * 1024 * 1024 //50MB

      // Obter informações do vídeo
      youtubedl(url, { dumpSingleJson: true })
        .then((data) => {
          const fileName = `${data.title}.mp3`; // Define o nome do arquivo

          // Baixar o vídeo com o nome correto
          youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: fileName,
          }).then(() => {
            const stats = fs.statSync(fileName)
            const fileSizeInBytes = stats.size

            if (fileSizeInBytes > fileSizeLimit) {
              bot.sendMessage(chatId, 'O áudio é muito grande para ser enviado pelo Telegram (limite: 50 MB). Envie um vídeo menor.');
              return;
            }

            bot.sendMessage(chatId, 'Download concluído! Enviando o áudio...');
            bot.sendAudio(chatId, fileName).then(() => {
              // Excluir o arquivo após o envio
              fs.unlinkSync(fileName);
            });
          })
        }).catch((error) => {
          console.error('Erro ao baixar o áudio:', error);
          bot.sendMessage(chatId, 'Ocorreu um erro ao baixar o áudio. Por favor, tente novamente.');
        });
    } else {
      bot.sendMessage(chatId, 'Opção inválida. Por favor, digite "video" ou "audio".');
    }
  });
});
