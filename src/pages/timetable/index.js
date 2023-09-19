import React from "react";
import _ from "lodash";
import {
  formatHtmlId,
  getNotesForStop,
  getNotesForStoptime,
  getNotesForTimetableLabel,
  prepareMapData,
} from "../../utils/formatting_functions";
import { createMap } from "../../utils/map_utils";

const {
  config,
  pageData
} = BACKEND_DATA;

class TimetablePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mapContainer = React.createRef();
  }
  componentDidMount() {
    this.initMap();
  }

  initMap = () => {
    const container = this.mapContainer.current;
    const { geojson, routes } = prepareMapData(_.values(pageData.consolidatedTimetables)[0]);
    console.log(routes);
    createMap(container, geojson, routes);
  }

  render() {
    const routes = _.uniqBy(_.flatMap(pageData.consolidatedTimetables, timetable => timetable.routes), 'route_id');

    const groupedTimetables = pageData.consolidatedTimetables.reduce((memo, timetable) => {
      if (!memo.hasOwnProperty(timetable.dayList)) {
        memo[timetable.dayList] = []
      }
      memo[timetable.dayList].push(timetable);
      return memo;
    }, {});

    console.log(groupedTimetables);

    return (
      <div className="timetable-page menu-type-jump">
        <div className="container mx-4 md:mx-auto">
          {
            config.showRouteTitle && (
              <h1 className="timetable-page-label text-2xl pt-4 flex items-center">
                {
                  routes.map(r => (
                    <div className="route-color-swatch-large.mr-2.flex-none" style={{
                      backgroundColor: `#${r.route_color}`,
                      color: `#${r.route_text_color}`,
                    }}>
                      { r.route_short_name || ''}
                    </div>
                  ))
                }
                <div>
                  { pageData.timetable_page_label }
                </div>
              </h1>
            )
          }
          {/*<div className="grid grid-cols-1 gap-4 md:grid-cols-3">*/}
          {/*  {*/}
          {/*    _.map(groupedTimetables, (group, dayList) => (*/}
          {/*      <div>*/}
          {/*        <h3 className="font-bold">*/}
          {/*          { dayList }*/}
          {/*        </h3>*/}
          {/*        {*/}
          {/*          group.map(timetable => (*/}
          {/*            <a*/}
          {/*              className="mb-2 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"*/}
          {/*              href={`#timetable_id_${timetable.timetable_id}`}*/}
          {/*            >*/}
          {/*              {timetable.timetable_label}*/}
          {/*            </a>*/}
          {/*          ))*/}
          {/*        }*/}
          {/*      </div>*/}
          {/*    ))*/}
          {/*  }*/}
          {/*</div>*/}

          {
            _.map(pageData.consolidatedTimetables, timetable => {
              let columnCount = timetable.stops.length;
              if (config.showStopCity) {
                columnCount += timetable.stops.reduce((memo, stop, index) => {
                  if (index === 0 || stop.stop_city !== timetable.stops[index - 1].stop_city) {
                    memo += 1;
                  }
                  return memo;
                }, 0);
              }
              let previousCity = null;
              return (
                <div
                  className="timetable mb-10"
                  id={`timetable_id_${formatHtmlId(timetable.timetable_id)}`}
                  data-day-list={timetable.dayList}
                  data-direction-name={timetable.direction_name}
                  data-timetable-id={timetable.timetable_id}
                  data-direction-id={timetable.direction_id}
                  data-route-id={timetable.route_ids.join('_')}
                >
                  {
                    config.showRouteTitle && (
                      <>
                        <h2 className="text-xl">
                          {timetable.timetable_label} | {timetable.dayListLong}
                          {
                            getNotesForTimetableLabel(timetable.notes).map(note => (
                              // TODO: Separate to a note component
                              <a
                                className={`symbol timetable-note-${note.note_id}`}
                                href={`#note-${timetable.timetable_id}-${note.note_id}`}
                              >
                                <sup className="symbol">{ note }</sup>
                              </a>
                            ))
                          }
                        </h2>
                        {
                          (timetable.service_notes !== null) && (
                            <div className="service-notes">
                              { timetable.service_notes }
                            </div>
                          )
                        }
                      </>
                    )
                  }
                  <div ref={this.mapContainer} id={`map_timetable_id_${formatHtmlId(timetable.timetable_id)}`} className="map" />
                  <div className="table-container">
                    <table data-orientation="vertical">
                      <caption className="sr-only">
                        {timetable.timetable_label} | {timetable.dayList}
                      </caption>
                      <colgroup>
                        {
                          _.map(timetable.stops, (stop, idx) => (
                            <col
                              id={`stop_id_${formatHtmlId(stop.stop_id)}`}
                              className={`stop-${idx}`}
                              data-stop-id={`${stop.stop_id}`}
                            >
                            </col>
                          ))
                        }
                      </colgroup>
                      <thead>
                      <tr>
                        {
                          timetable.has_continues_from_route && (
                            <th className="stop-header continues-from">
                              Continues from route
                            </th>
                          )
                        }

                        {
                          _.map(timetable.stops, (stop, idx) => {
                            const stopName = `${stop.stop_name}${stop.type === 'arrival' ? ' (Arrival)' : stop.type === 'departure' ? ' (Departure)' : ''}`;
                            let prevStopJsx = "";
                            if (stop.stop_city !== '' && previousCity !== stop.stop_city && config.showStopCity) {
                              previousCity = stop.stop_city;
                              prevStopJsx = <th className="city-column">{ stop.stop_city }</th>
                            }
                            return (
                              <>
                                { prevStopJsx }
                                <th className="stop-header" scope="col" width={`${(100 / columnCount).toFixed(2)}%`}>
                                  <div className="stop-name">
                                    { stopName }
                                    {
                                      getNotesForStop(timetable.notes, stop).map(note => (
                                        // TODO: Separate to a note component
                                        <a
                                          className={`symbol timetable-note-${note.note_id}`}
                                          href={`#note-${timetable.timetable_id}-${note.note_id}`}
                                        >
                                          <sup className="symbol">{ note }</sup>
                                        </a>
                                      ))
                                    }
                                  </div>
                                  <div className="stop-code">
                                    { stop.stop_code }
                                  </div>
                                </th>
                              </>
                            )
                          })
                        }

                        {
                          timetable.has_continues_as_route && (
                            <th className="stop-header.continues-as">
                              Continues as route
                            </th>
                          )
                        }
                      </tr>
                      </thead>
                      <tbody>
                      {
                        timetable.frequencies && !timetable.frequencyExactTimes && (
                          <tr className="trip-row">
                            {
                              timetable.has_continues_from_route && (<td />)
                            }
                            <td
                              className="trip-frequency"
                              colspan={columnCount}
                            >
                              {
                                formatFrequencyWarning(timetable.frequencies)
                              }
                            </td>
                            {
                              timetable.has_continues_as_route && <td />
                            }
                          </tr>
                        )
                      }
                      {
                        _.map(timetable.orderedTrips, (trip, idx) => (
                          <tr className="trip-row" id={`trip_id_${formatHtmlId(trip.trip_id)}`}>
                            {
                              _.map(timetable.stops, stop => {
                                let prevStopJsx = "";

                                if(stop.stop_city !== '' && previousCity !== stop.stop_city && config.showStopCity) {
                                  prevStopJsx = <td />;
                                  previousCity = stop.stop_city
                                }
                                const stoptime = stop.trips[idx];
                                return (
                                  <td className={`stop-time ${stoptime.classes.join(' ')}`}>
                                    {
                                      (config.showStoptimesForRequestStops || (!stoptime.requestDropoff && !stoptime.requestPickup)) && (
                                        <span className="stop-time-text">{ stoptime.formatted_time }</span>
                                      )
                                    }
                                    {
                                      stoptime.skipped && timetable.noServiceSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-no-service`} className="symbol">{ timetable.noServiceSymbol }</a>
                                      )
                                    }
                                    {
                                      stoptime.interpolated && timetable.interpolatedStopSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-interpolated-stop`} className="symbol">{ timetable.interpolatedStopSymbol }</a>
                                      )
                                    }
                                    {
                                      stoptime.requestPickup && timetable.requestPickupSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-request-pickup`} className="symbol">{ timetable.requestPickupSymbol }</a>
                                      )
                                    }
                                    {
                                      stoptime.noPickup && timetable.noPickupSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-no-pickup`} className="symbol">{ timetable.noPickupSymbol }</a>
                                      )
                                    }
                                    {
                                      stoptime.requestDropoff && timetable.requestDropoffSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-request-dropoff`} className="symbol">{ timetable.requestDropoffSymbol }</a>
                                      )
                                    }
                                    {
                                      stoptime.noDropoff && timetable.noDropoffSymbol !== null && (
                                        <a href={`#note-${timetable.timetable_id}-no-dropoff`} className="symbol">{ timetable.noDropoffSymbol }</a>
                                      )
                                    }
                                    {
                                      getNotesForStoptime(timetable.notes, stoptime).map(note => (
                                        // TODO: Separate to a note component
                                        <a
                                          className={`symbol timetable-note-${note.note_id}`}
                                          href={`#note-${timetable.timetable_id}-${note.note_id}`}
                                        >
                                          <sup className="symbol">{ note }</sup>
                                        </a>
                                      ))
                                    }
                                  </td>
                                );
                              })
                            }
                          </tr>
                        ))
                      }
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default TimetablePage;
