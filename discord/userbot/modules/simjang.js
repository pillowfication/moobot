const path = require('path');
const url = require('url');
const RichEmbed = require('discord.js').RichEmbed;
const winston = require('winston');

const 심장 = '❤';
const board = '296712646559006721';

const extensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/w-_\.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

module.exports = {
  init(me) {
    me.on('messageReactionAdd', (messageReaction, user) => {
      if (user.id !== me.id && user.id !== '179314569594929152') // TODO: Eva
        return;
      if (messageReaction.emoji.name !== 심장)
        return;

      winston.info('Simjang\'d a message');

      const message = messageReaction.message;
      const embed = new RichEmbed();

      embed.setAuthor(
        `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
        message.author.displayAvatarURL
      );
      embed.setColor(
        message.member && message.member.highestRole.color
      );

      if (message.guild) {
        embed.addField(
          'Guild',
          `${message.guild.name}\n${message.guild.id}`,
          true
        );
        embed.addField(
          'Channel',
          `#${message.channel.name}\n${message.channel.id}`,
          true
        );
      } else {
        embed.addField(
          'DMChannel',
          message.channel.recipient
            ? `${message.channel.recipient.username} (${message.channel.recipient.id})`
            : message.channel.recipients.map(recipient =>
              `${recipient.username} (${recipient.id})`
            ).join('\n')
        );
      }

      embed.addField(
        `Message (${message.id})`,
        message.content ? message.cleanContent.substring(0, 1000) : '\u200B'
      );

      let image;

      if (message.attachments.some(attachment => {
        try {
          return extensions.has(path.extname((new url.URL(attachment.url)).pathname));
        } catch (err) {
          winston.error('Image attachment had bad URL', err);
          return false;
        }
      }))
        image = message.attachments.first().url;

      if (!image) {
        const link = message.content.match(linkRegex);
        if (link)
          try {
            if (extensions.has(path.extname((new url.URL(link[0])).pathname)))
              image = link[0];
          } catch (err) {
            winston.error('Link found had bad URL', err);
          }
      }

      embed.setImage(
        image ? image.toString() : undefined
      );

      me.channels.get(board)
        .sendEmbed(embed)
        .catch(err => {
          winston.error('Couldn\'t send embed to #simjang', err);
        });
    });
  }
};
