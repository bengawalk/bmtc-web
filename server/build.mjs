import gtfsToHtml from 'gtfs-to-html';
import ejs from "ejs";
import {config} from "./lib/constants.mjs";
import {getFormattedTimetablePage, getTimetablePagesForAgency, getTimetablesListData} from "./lib/utils.mjs";
import {getAgencyGeoJSON} from "./lib/geojson-utils.mjs";
import {openDb} from "gtfs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import fs from "fs";
import fsPromise from 'fs/promises';
import webpack from 'webpack';
import _ from "lodash";
import webpackConfig from "../webpack/prod.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const createFolderIfDoesntExist = (folderName) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
  } catch (err) {
    console.error(err);
  }
}

const renderTemplates = async () => {
  // Index page
  const homepageContent = await ejs.renderFile(path.join(__dirname, "frontend_template.ejs"), {
    backendData: {
      timetablePages: await getTimetablesListData(config),
      geojson: getAgencyGeoJSON(config),
    }
  });
  await fsPromise.writeFile(path.join(__dirname, "../dist/index.html"), homepageContent);

  // Copy static folder to dist
  fs.cpSync(path.join(__dirname, "../public"), path.join(__dirname, "../dist"), {recursive: true});

  // Individual timetable pages
  const timetableIds = _.uniq(_.map(getTimetablePagesForAgency(config), "timetable_page_id"));
  _.each(timetableIds, async (timetablePageId) => {
    const timetablePage = await getFormattedTimetablePage(
      timetablePageId,
      config
    );
    const routeName = timetablePage?.timetables[0]?.routes[0]?.route_short_name;

    const pageContent = await ejs.renderFile(path.join(__dirname, "frontend_template.ejs"), {
      backendData: {
        pageData: timetablePage,
        config,
      }
    });

    const timetableFolderName = path.join(__dirname, `../dist/timetables/${timetablePageId}`);
    const routeFolderName = path.join(__dirname, `../dist/routes/${routeName}`);

    [timetableFolderName, routeFolderName].forEach(createFolderIfDoesntExist);

    await fsPromise.writeFile(path.join(__dirname, `../dist/timetables/${timetablePageId}/index.html`), pageContent);
    await fsPromise.writeFile(path.join(__dirname, `../dist/routes/${routeName}/index.html`), pageContent);
  });
};

const renderWebpackApp = () => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
  });
};

await renderTemplates();
renderWebpackApp();
