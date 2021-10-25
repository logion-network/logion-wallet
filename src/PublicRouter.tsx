import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Certificate from "./certificate/Certificate";
import React from "react";
import { CERTIFICATE_PATH } from "./PublicPaths";

export default function PublicRouter() {
    return (
        <Router>
            <Switch>
                <Route path={ CERTIFICATE_PATH }>
                    <Certificate />
                </Route>
            </Switch>
        </Router>
    )
}
