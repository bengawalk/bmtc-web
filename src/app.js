import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Home from "./pages/home/index.js";
import TimetablePage from "./pages/timetable/index.js";

import 'mapbox-gl/dist/mapbox-gl.css';
import "./style/index.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/timetables/:timetable_id",
    element: <TimetablePage />,
  },
  {
    path: "/routes/:route_id",
    element: <TimetablePage />,
  },
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;