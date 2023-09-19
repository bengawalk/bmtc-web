import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { map } from 'lodash-es';
import { openDb } from 'gtfs';

import express from 'express';
import logger from 'morgan';
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";

import { formatTimetableLabel } from './lib/formatters.mjs';
import {
  setDefaultConfig,
  getTimetablePagesForAgency,
  getFormattedTimetablePage,
  generateOverviewHTML,
  generateTimetableHTML, getTimetablesListData,
} from './lib/utils.mjs';
import webpackConfig from "../webpack/dev.mjs";
import {getAgencyGeoJSON} from "./lib/geojson-utils.mjs";
import {config, selectedConfig} from "./lib/constants.mjs";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const webpackCompiler = webpack(webpackConfig);

const app = express();
const router = new express.Router();

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, ''));

try {
  openDb(config);
} catch (error) {
  if (error instanceof Error && error.code === 'SQLITE_CANTOPEN') {
    config.logError(
      `Unable to open sqlite database "${config.sqlitePath}" defined as \`sqlitePath\` config.json. Ensure the parent directory exists or remove \`sqlitePath\` from config.json.`
    );
  }

  throw error;
}

/*
 * Show all timetable pages
 */
router.get('/', async (request, response, next) => {
  try {
    response.render("frontend_template", {
      backendData: {
        timetablePages: await getTimetablesListData(config),
        geojson: getAgencyGeoJSON(config),
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
 * Show a specific timetable page
 */
router.get('/timetables/:timetablePageId', async (request, response, next) => {
  const { timetablePageId } = request.params;

  if (!timetablePageId) {
    return next(new Error('No timetablePageId provided'));
  }

  try {
    const timetablePage = await getFormattedTimetablePage(
      timetablePageId,
      config
    );

    const html = await generateTimetableHTML(timetablePage, config);
    response.send(html);
  } catch (error) {
    next(error);
  }
});

app.use(webpackDevMiddleware(webpackCompiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);

app.use(logger('dev'));

app.use('/', router);
app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});
