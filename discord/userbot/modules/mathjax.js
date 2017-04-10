const mathjax = require('mathjax-node');
const svg2png = require('svg2png');
const winston = require('winston');

const EX_SIZE = 12;

mathjax.config({displayErrors: true});
mathjax.start();

function typeset(math) {
  return new Promise((resolve, reject) => {
    mathjax.typeset({
      math: math,
      ex: EX_SIZE,
      svg: true
    }, result => {
      if (result.errors)
        reject(new Error(result.errors.join('\n')));
      else
        resolve({
          svg: result.svg,
          width: parseFloat(result.width) * EX_SIZE || 10,
          height: parseFloat(result.height) * EX_SIZE || 10
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

      const match = message.content.match(regex);
      const math = match && match[1];
      if (!math)
        return;

      typeset(math)
        .then(result =>
          svg2png(result.svg, {width: result.width, height: result.height})
        )
        .then(buffer =>
          message.channel.sendFile(buffer)
        )
        .catch(err =>
          winston.error('Could not generate TeX or send it.', err)
        );
    });
  }
};
