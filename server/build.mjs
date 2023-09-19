import gtfsToHtml from 'gtfs-to-html';
import ejs from "ejs";
import {config} from "./lib/constants.mjs";
import {getTimetablesListData} from "./lib/utils.mjs";
import {getAgencyGeoJSON} from "./lib/geojson-utils.mjs";
import {openDb} from "gtfs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import fs from 'fs/promises';
import webpack from 'webpack';
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

const renderTemplates = async () => {
  const homepageContent = await ejs.renderFile(path.join(__dirname, "frontend_template.ejs"), {
    backendData: {
      timetablePages: await getTimetablesListData(config),
      geojson: getAgencyGeoJSON(config),
    }
  });
  await fs.writeFile(path.join(__dirname, "../dist/index.html"), homepageContent);
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

// gtfsToHtml(config)
//   .then(() => {
//     console.log('HTML Generation Successful');
//     process.exit();
//   })
//   .catch((err) => {
//     console.error(err);
//     process.exit(1);
//   });