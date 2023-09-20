import React, {useEffect, useState} from "react";
import _ from "lodash";

import { formatRouteName } from "../../utils/formatting_functions.js";
import HomeMap from "./home_map";

const { timetablePages } = BACKEND_DATA;

const Homepage = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredPages, setFilteredPages] = useState(timetablePages);
  useEffect(() => {
    if(!searchText) {
      setFilteredPages(timetablePages);
    }
    const lowerText = _.toLower(searchText);
    const searchResults = _.filter(timetablePages, t => {
      const {
        routes,
      } = t.consolidatedTimetables[0];
      return _.some(routes, r => {
        const {
          route_long_name: shortName,
          route_short_name: longName,
          route_id: routeId,
        } = r;
        return _.some(_.map([shortName, longName, routeId], _.toLower), text => _.includes(text, lowerText));
      })
    });
    setFilteredPages(searchResults);
  }, [searchText]);

  return (
    <div className="overview-wrapper">
      <div className="overview-list flex-none md:overflow-y-scroll">
        <div id="overview-search">
          <input placeholder="Search routes..." id="overview-search-input" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} />
        </div>
        {
          filteredPages.map(t =>
          {
            const routes = _.uniqBy(_.flatMap(t.consolidatedTimetables, timetable => timetable.routes), 'route_id')
            return (
            <a
              className="block p-2 border-b border-slate-200 hover:bg-slate-200 hover:no-underline"
              href={`/routes/${routes[0].route_short_name}`} data-route-ids={t.route_ids ? t.route_ids.join(',') : ''}
              key={t.timetable_page_label}
            >
              <div className="text-lg text-gray-800 leading-none">
                { t.timetable_page_label }
              </div>
              {
                routes.map(r => (
                  <div className="flex my-1" key={r.route_short_name}>
                    <div className="route-color-swatch flex-none mr-2" style={{
                      backgroundColor: `#${r.route_color}`,
                      color: `#${r.route_text_color}`
                    }}>
                      {r.route_short_name || ''}
                    </div>
                    <div className="mt-1 text-gray-600 leading-7">
                      { formatRouteName(r) }
                    </div>
                  </div>
                ))
              }
              <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-slate-800 bg-slate-200 rounded-full">
                {
                  t.dayList
                }
              </div>
            </a>
          );
        })
        }
      </div>
      <HomeMap filteredPages={filteredPages} />
    </div>
  );
}

export default Homepage;
