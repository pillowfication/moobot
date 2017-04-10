// '_'-prefix variables to prevent accidental `eval` abuse
const _util = require('util');
const _winston = require('winston');

module.exports = {
  init(me) {
    const _regex = new RegExp(`^${me.prefix}eval\\s+\`\`\`([.\\n]*)\`\`\``);

    me.on('message', message => {
      if (message.author.id !== me.id || !message.content.startsWith(me.prefix))
        return;

      const _match = message.content.match(_regex);
      const _code = _match && _match[1];
      if (!_code)
        return;

      let _output;
      try {
        _output = eval(_code);
      } catch (err) {
        _output = err;
      }

      message
        .edit(
          `${me.prefix}eval` +
          `\`\`\`js\n${_code}\n\`\`\`` + // Don't put a '\n' here please
          `\`\`\`js\n${_util.inspect(_output)}\n\`\`\``
        )
        .catch(err =>
          _winston.error('Could not edit message.', err)
        );
    });
  }
};
