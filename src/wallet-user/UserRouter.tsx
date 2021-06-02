import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import MyTokens from './MyTokens';
import TokenizationRequests from "./TokenizationRequests";

export const MY_TOKENS_PATH = USER_PATH + '/tokens/:address';

export default function UserRouter() {
    return (
        <>
            <Switch>
                <Route path={ MY_TOKENS_PATH }>
                    <MyTokens />
                </Route>
                <Route path="">
                    <TokenizationRequests />
                </Route>
            </Switch>
        </>
    );
}
