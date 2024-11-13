const { Command } = require('commander');
const express = require('express');

const program = new Command();
program
  .requiredOption('-h, --host <type>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'шлях до директорії для кешування');

program.parse(process.argv);

const options = program.opts();
console.log('Опції:', options);

const app = express();

app.get('/', (req, res) => {
  res.send('Веб-сервер працює!');
});

app.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
