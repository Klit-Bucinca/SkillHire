import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// views
import Login from "views/auth/Login";
import Register from "views/auth/Register";
import AdminDashboard from "views/admin/Dashboard";
import WorkerDashboard from "views/worker/Dashboard"; 
import Landing from "views/Landing";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/login" exact component={Login} />
      <Route path="/register" exact component={Register} />
      <Route path="/admin" exact component={AdminDashboard} />
      <Route path="/worker" exact component={WorkerDashboard} />
      <Route path="/" exact component={Landing} />
      <Redirect from="*" to="/" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
