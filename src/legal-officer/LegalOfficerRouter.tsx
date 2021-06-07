import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { TOKENIZATION_REQUESTS_PATH } from './LegalOfficerPaths';

import TokenizationRequests from './TokenizationRequests';

export default function LegalOfficerRouter() {

    return (
        <>
            <Switch>
                <Route path={ TOKENIZATION_REQUESTS_PATH }>
                    <TokenizationRequests />
                </Route>
                <Route path="">
                    <Redirect to={ TOKENIZATION_REQUESTS_PATH } />
                </Route>
            </Switch>
        </>
    );
}
