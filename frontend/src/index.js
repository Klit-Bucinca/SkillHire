import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/index.css";

// layouts (lazy-loaded to reduce CRA dev startup work)
const Admin = lazy(() => import("layouts/Admin.js"));
const Auth = lazy(() => import("layouts/Auth.js"));
const Client = lazy(() => import("layouts/Client.js"));
const Worker = lazy(() => import("layouts/Worker.js"));

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Suspense fallback={<div className="p-4 text-blueGray-600">Loading...</div>}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/auth" component={Auth} />
        <Route path="/client" component={Client} />
        <Route path="/worker" component={Worker} />

        <Redirect from="*" to="/auth/login" />
      </Switch>
    </Suspense>
  </BrowserRouter>
);
