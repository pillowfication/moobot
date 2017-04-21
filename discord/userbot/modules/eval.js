const _ = require('lodash');
const vm = require('vm');
const util = require('util');
const messageError = require('../../messageError');

module.exports = {
  defaults: {
    command: 'eval',
    timeout: 10 * 1000
  },

  init(me, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${me.config.prefix}${options.command}`;
    const regex = new RegExp(`^${command}\\s+\`\`\`(?:js\\s)?([\\s\\S]*)\`\`\``);
    let context = contextify();

    function contextify() {
      const context = vm.createContext(global);
      vm.runInContext('((a,b)=>{require=a;me=b})', context)(require, me);
      return context;
    }

    me.on('message', message => {
      if (message.author.id !== me.config.id || !message.content.startsWith(me.config.prefix)) {
        return;
      }

      // TODO
      // if (message.content === `${command} restart`) {
      //   context = contextify();
      //   return message.channel
      //     .sendMessage('Context reset.')
      //     .catch(messageError('send'));
      // }

      const match = message.content.match(regex);
      const code = match && match[1].trim();
      if (!code) {
        return;
      }

      let output;
      try {
        vm.runInContext('(a=>{message=a})', context)(message);
        output = util.inspect(vm.runInContext(code, context, {
          filename: 'Discord',
          lineOffset: 0,
          columnOffset: 0,
          displayErrors: true,
          timeout: options.timeout
        }));
      }
      catch (err) {
        if (/Script execution timed out/.test(err.message)) {
          output = err.toString();
        }

        else {
          const [message, ...stack] = err.stack.split('\n');
          const [, line, column] = stack[0].match(/Discord:([0-9]+):([0-9]+)/);
          output =
            `${code.split('\n')[+line-1]}\n` +
            `${' '.repeat(+column-1)}^\n` +
            `${message}\n` +
            stack.filter(desc => /Discord:[0-9]+:[0-9]+/.test(desc)).join('\n');
        }
      }

      message
        .edit(
          `${command}` +
          `\`\`\`js\n${code}\n\`\`\`` +
          `\`\`\`js\n${output}\n\`\`\``
        )
        .catch(messageError('edit'));
    });
  }
};
