process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import FileRoute from '@routes/file.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new FileRoute()]);

app.listen();
