// src/layouts/Worker.js
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Sidebar from "components/Sidebar/WorkerSidebar.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import HeaderStats from "components/Headers/WorkerHeaderStats";
import FooterAdmin from "components/Footers/FooterAdmin.js";

import MyServices from "views/worker/MyServices.js";
import MyClients from "views/worker/MyClients.js";
import WorkerProfile from "views/worker/WorkerProfile.js";
import MyPhotos from "views/worker/MyPhotos";

export default function Worker() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/worker/MyServices" exact component={MyServices} />
            <Route path="/worker/MyClients" exact component={MyClients} />
            <Route path="/worker/WorkerProfile" exact component={WorkerProfile} />
            <Route path="/worker/MyPhotos" exact component={MyPhotos} />
            <Redirect from="/MyPhotos" to="/worker/MyPhotos" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
