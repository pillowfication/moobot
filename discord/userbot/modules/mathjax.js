const mathjax = require('mathjax-node');
const svg2png = require('svg2png');
const winston = require('winston');

const EX = 12;

mathjax.config({displayErrors: true});

function typeset(math) {
  return new Promise((resolve, reject) => {
    mathjax.typeset({
      math: math,
      ex: EX,
      svg: true
    }, result => {
      if (result.errors)
        reject(new Error(result.errors.join('\n')));
      else
        resolve({
          svg: result.svg,
          width: parseFloat(result.width) * EX || 10,
          height: parseFloat(result.height) * EX || 10
        });
    });
  });
}

module.exports = {
  init(me) {
    const regex = new RegExp(`^${me.prefix}math\\s+\`(.*)\``);

    me.on('message', message => {
      if (message.author.id !== me.id)
        return;
      const math = message.content.match(regex);
      if (!math || !math[1])
        return;

      typeset(math[1])
        .then(result =>
          svg2png(result.svg, {width: result.width, height: result.height})
        )
        .then(buffer =>
          message.channel.sendFile(buffer)
        )
        .catch(err => {
          winston.error('Could not generate TeX or send it', err);
          message.edit(
            `${message.content}\n` +
            `\`\`\`${err.message}\`\`\``
          );
        });
    });
  }
};
