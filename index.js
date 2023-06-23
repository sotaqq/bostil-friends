const express = require('express');
const { Client, GatewayIntentBits } = require("discord.js");
const app = express();
const port = process.env.port || 80
const config = require('./config.js')

//PEGANDO TODAS AS INTENTS
const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a]
  }),
});

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('./public'));


//aviso de bot on
client.on('ready', async () => {
  console.log(`[+] bot on como ${client.user.username}`)
})

/* ROTA PRINCIPAL */
app.get('/', async (req, res) => {
  var users = {};
  var server = null;
  var sv = config.server
  if (sv.ativado == true) {
    server = await client.guilds.fetch(sv.id).catch(err => null)
  }
  for (const userId in config.usuarios) {
    var usuario;
    try {
      usuario = await client.users.fetch(userId, { force: true });
    } catch (error) {
      console.error(`${userId} é um id inválido`);
      continue;
    }

    var flags = usuario.flags.toArray();
    var boostLevel = config.usuarios[userId];
    var badges = [];

    for (const flag of flags) {
      badges.push(config.badges[flag]);
    }
    if (boostLevel !== null) {
      badges.push(config.badges.nitro);
    }
    if (boostLevel !== null) {
      var boostImage = config.boost[boostLevel];
      if (boostImage) {
        badges.push(boostImage);
      } else {
        console.log(`o level do boost foi setado de forma errada para o usuario com o id ${userId}`)
      }
    }

    if (usuario.discriminator === '0') {
      badges.push(config.badges.novo_nick);
    }

    users[userId] = {
      info_user: {
        id: usuario.id,
        username: usuario.username,
        discriminator: usuario.discriminator,
        avatar: usuario.displayAvatarURL({ dynamic: true, size: 4096, extension: 'png' })
      },
      badges: badges,

    };
  }
  var site_config = config.pagina

  res.render('index', { users, site_config, server, sv });
});

client.login(config.bot.token)
app.listen(port, () => {
  console.log(`[+] Servidor iniciado e rodando na porta: ${port}`);
});