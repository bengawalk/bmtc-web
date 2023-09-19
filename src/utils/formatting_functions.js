export const formatRouteName = (route) => {
  const hasLongName = route.route_long_name !== '' && route.route_long_name !== null;

  if (hasLongName) {
    return route.route_long_name;
  }

  return route.route_short_name;
}

export const formatHtmlId = (id) => {
  return id.replace(/([^\w[\]{}.:-])\s?/g, '');
}

export const getNotesForTimetableLabel = (notes) => {
  return notes.filter((note) => !note.stop_id && !note.trip_id);
}

export const prepareMapData = (timetable) => {
  const routes = {}
  const minifiedGeojson = {
    type: 'FeatureCollection',
    features: []
  }

  for (const feature of timetable.geojson.features) {
    if (feature.geometry.type === 'LineString') {
      feature.properties = {
        route_color: feature.properties.route_color
      }
      minifiedGeojson.features.push(feature)
    } else if (feature.geometry.type === 'Point') {
      for (const route of feature.properties.routes) {
        routes[route.route_id] = route
      }

      feature.properties.routes = feature.properties.routes.map(route => route.route_id)

      minifiedGeojson.features.push(_.omit(feature, ['location_type', 'tts_stop_name']))
    }
  }

  return {
    id: `timetable_id_${formatHtmlId(timetable.timetable_id)}`,
    routes,
    geojson: minifiedGeojson
  }
}

export const getNotesForStop = (notes, stop) => {
  return notes.filter((note) => {
    // Don't show if note applies only to a specific trip.
    if (note.trip_id) {
      return false;
    }

    // Don't show if note applies only to a specific stop_sequence that is not found.
    if (
      note.stop_sequence &&
      !stop.trips.some((trip) => trip.stop_sequence === note.stop_sequence)
    ) {
      return false;
    }

    return note.stop_id === stop.stop_id;
  });
}

export const formatFrequencyWarning = (frequencies) => {
  let warning = 'Trip times shown below are an example only. ';
  frequencies.forEach((frequency, idx) => {
    if (idx === 0) {
      warning += 'This route runs every ';
    } else {
      warning += ' and ';
    }
    warning += `${frequency.headway_min} minutes between ${frequency.start_formatted_time} and ${frequency.end_formatted_time}`;
  });
  warning += '.';
  return warning;
}

/*
 * Return an array of all timetable notes for a specific stoptime.
 */
export const getNotesForStoptime = (notes, stoptime) => {
  return notes.filter((note) => {
    // Show notes that apply to all trips at this stop if `show_on_stoptime` is true.
    if (
      !note.trip_id &&
      note.stop_id === stoptime.stop_id &&
      note.show_on_stoptime === 1
    ) {
      return true;
    }

    // Show notes that apply to all stops of this trip if `show_on_stoptime` is true.
    if (
      !note.stop_id &&
      note.trip_id === stoptime.trip_id &&
      note.show_on_stoptime === 1
    ) {
      return true;
    }

    return (
      note.trip_id === stoptime.trip_id && note.stop_id === stoptime.stop_id
    );
  });
}