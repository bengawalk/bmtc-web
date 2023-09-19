import {setDefaultConfig} from "./utils.mjs";

export const selectedConfig = {
  "agencies": [
    {
      "agency_key": "bmtc",
      "path": "./data.zip"
    }
  ],
  "allowEmptyTimetables": false,
  "beautify": true,
  "csvOptions": {
  },
  "defaultOrientation": "vertical",
  "mapboxAccessToken": process.env.MAPBOX_TOKEN,
  "showMap": true,
  "sqlitePath": "dist/bmtc.sqlite",
  "skipImport": false
};

const config = setDefaultConfig(selectedConfig);
// Override noHead config option so full HTML pages are generated
config.noHead = false;
config.assetPath = '/';
config.log = console.log;
config.logWarning = console.warn;
config.logError = console.error;

export { config };