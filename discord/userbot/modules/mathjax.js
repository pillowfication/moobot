const _ = require('lodash');
const mathjax = require('mathjax-node');
const svg2png = require('svg2png');
const winston = require('winston');
const messageError = require('../../messageError');

mathjax.config({displayErrors: true});
mathjax.start();

function typeset(math, exSize) {
  return new Promise((resolve, reject) => {
    mathjax.typeset({
      math: math,
      ex: exSize,
      svg: true
    }, result => {
      if (result.errors) {
        reject(new Error(result.errors.join('\n')));
      }
      else {
        resolve({
          svg: result.svg,
          width: parseFloat(result.width) * exSize || 10,
          height: parseFloat(result.height) * exSize || 10
        });
      }
    });
  });
}

module.exports = {
  defaults: {
    command: 'math',
    exSize: 12
  },

  init(me, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${me.config.prefix}${options.command}`;
    const regex = new RegExp(`^${command}\\s+\`(.*)\``);

    me.on('message', message => {
      if (message.author.id !== me.config.id || !message.content.startsWith(me.config.prefix)) {
        return;
      }

      const match = message.content.match(regex);
      const math = match && match[1];
      if (!math) {
        return;
      }

      typeset(math, options.exSize)
        .then(({svg, width, height}) => svg2png(svg, {width, height}))
        .then(buffer =>
          message.channel
            .sendFile(buffer)
            .catch(err => winston.error('Could not send buffer.', err))
        )
        .catch(err => {
          winston.error('Could not generate TeX.', err);
          message.channel
            .sendMessage(`Could not generate TeX. ${err.message}.`)
            .catch(messageError('send'));
        });
    });
  }
};
