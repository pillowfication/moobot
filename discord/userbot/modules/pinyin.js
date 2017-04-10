const winston = require('winston');

const tones = {
  a: {1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à'},
  e: {1: 'ē', 2: 'é', 3: 'ě', 4: 'è'},
  i: {1: 'ī', 2: 'í', 3: 'ǐ', 4: 'ì'},
  o: {1: 'ō', 2: 'ó', 3: 'ǒ', 4: 'ò'},
  u: {1: 'ū', 2: 'ú', 3: 'ǔ', 4: 'ù'},
  ü: {1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ'},
  A: {1: 'Ā', 2: 'Á', 3: 'Ǎ', 4: 'À'},
  E: {1: 'Ē', 2: 'É', 3: 'Ě', 4: 'È'},
  I: {1: 'Ī', 2: 'Í', 3: 'Ǐ', 4: 'Ì'},
  O: {1: 'Ō', 2: 'Ó', 3: 'Ǒ', 4: 'Ò'},
  U: {1: 'Ū', 2: 'Ú', 3: 'Ǔ', 4: 'Ù'},
  Ü: {1: 'Ǖ', 2: 'Ǘ', 3: 'Ǚ', 4: 'Ǜ'}
};

function addTone(word) {
  const chars = Array.from(word);
  const tone = chars.pop();
  if (tone !== '1' && tone !== '2' && tone !== '3' && tone !== '4')
    return word;

  // 1. 'A' and 'E' always take the tone mark
  for (let i = 0; i < chars.length; ++i) {
    const char = chars[i];
    if (char === 'a' || char === 'A' || char === 'e' || char === 'E') {
      chars[i] = tones[char][tone];
      return chars.join('');
    }
  }

  // 2. In 'OU', 'O' takes the tone mark
  for (let i = 0; i < chars.length - 1; ++i) {
    const [curr, next] = [chars[i], chars[i + 1]];
    if ((curr === 'o' || curr === 'O') && (next === 'u' || next === 'U')) {
      chars[i] = tones[curr][tone];
      return chars.join('');
    }
  }

  // 3. The final vowel takes the tone mark
  for (let i = chars.length - 1; i >= 0; --i) {
    const map = tones[chars[i]];
    if (map) {
      chars[i] = map[tone];
      return chars.join('');
    }
  }

  return word;
}

module.exports = {
  init(me) {
    const command = `${me.prefix}mand`;
    const regex = new RegExp(`^${command}\\s+(.*)`);

    me.on('message', message => {
      if (message.author.id !== me.id)
        return;
      const content = message.content.match(regex);
      if (!content || !content[1])
        return;

      winston.info(message.content);

      message
        .edit(
          content[1]
            .replace(/u:/g, 'ü')
            .replace(/U:/g, 'Ü')
            .split(/([a-zü]+[0-9]+)/gi)
            .map(addTone)
            .join('')
        )
        .catch(err => {
          winston.error('Could not edit message', err);
          message.edit(
            `${message.content}\n` +
            `\`\`\`${err.message}\`\`\``
          );
        });
    });
  }
};
