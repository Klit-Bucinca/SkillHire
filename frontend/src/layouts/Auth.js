import React, { Suspense, lazy } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
const Login = lazy(() => import("views/auth/Login.js"));
const Register = lazy(() => import("views/auth/Register.js"));

export default function Auth() {
  return (
    <>
      <Suspense fallback={<div className="p-4 text-blueGray-600">Loading...</div>}>
        <Switch>
          <Route path="/auth/login" exact component={Login} />
          <Route path="/auth/register" exact component={Register} />
          <Redirect from="/auth" to="/auth/login" />
        </Switch>
      </Suspense>
    </>
  );
}
