const vm = require('vm');
const util = require('util');
const winston = require('winston');

module.exports = {
  init(me) {
    const regex = new RegExp(`^${me.prefix}eval\\s+\`\`\`(?:js\\s)?([\\s\\S]*)\`\`\``);
    let context;

    function contextify() {
      context = vm.createContext(global);
    }
    contextify();

    me.on('message', message => {
      if (message.author.id !== me.id || !message.content.startsWith(me.prefix))
        return;

      if (message.content === `${me.prefix}eval restart`) {
        contextify();
        return message.channel
          .sendMessage('Context reset.')
          .catch(err =>
            winston.error('Could not send message.', err)
          );
      }

      const match = message.content.match(regex);
      const code = match && match[1];
      if (!code)
        return;

      let output;
      try {
        vm.runInContext('((a,b,c)=>{require=a;me=b;message=c})', context)(require, me, message);
        output = vm.runInContext(code, context, {
          filename: 'Discord',
          lineOffset: 0,
          columnOffset: 0,
          displayErrors: true,
          timeout: 10000
        });
      } catch (err) {
        output = err;
      }

      message
        .edit(
          `${me.prefix}eval` +
          `\`\`\`js\n${code.trim()}\n\`\`\`` +
          `\`\`\`js\n${util.inspect(output)}\n\`\`\``
        )
        .catch(err =>
          winston.error('Could not edit message.', err)
        );
    });
  }
};
