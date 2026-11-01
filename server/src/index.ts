import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { loadEnvFiles } from './loadEnv.js';

loadEnvFiles();

const config = loadConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`AEGIS server listening on ${config.port}`);
});
