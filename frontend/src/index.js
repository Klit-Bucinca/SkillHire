import React from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/index.css";

// layouts
import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import Client from "layouts/Client.js";
import Worker from "layouts/Worker.js";

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/auth" component={Auth} />
      <Route path="/client" component={Client} />
      <Route path="/worker" component={Worker} />

      <Redirect from="*" to="/auth/login" />
    </Switch>
  </BrowserRouter>
);
