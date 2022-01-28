import React from 'react';
import {
    Navigate,
    Routes,
    Route,
} from 'react-router-dom';

import { LEGAL_OFFICER_PATH, USER_PATH } from './RootPaths';
import LegalOfficerMain from './legal-officer/Main';
import UserMain from './wallet-user/Main';
import { useCommonContext } from './common/CommonContext';
import Login, { LOGIN_PATH } from './Login';
import RenderOrRedirectToLogin from './RenderOrRedirectToLogin';
import { useDirectoryContext } from './directory/DirectoryContext';

export default function RootRouter() {
    const { accounts } = useCommonContext();
    const directoryContext = useDirectoryContext();

    if(accounts === null || accounts.all.length === 0) {
        return null;
    }

    const isLegalOfficer = directoryContext.isLegalOfficer(accounts?.current?.address);
    let redirectTo;
    if(isLegalOfficer) {
        redirectTo = LEGAL_OFFICER_PATH;
    } else {
        redirectTo = USER_PATH;
    }

    return (
        <Routes>
            <Route
                path={ LEGAL_OFFICER_PATH + "/*" }
                element={ isLegalOfficer ? <RenderOrRedirectToLogin render={ () => <LegalOfficerMain /> }/> : <Navigate to={ USER_PATH } /> }
            />
            <Route
                path={ USER_PATH + "/*" }
                element={ !isLegalOfficer ? <RenderOrRedirectToLogin render={ () => <UserMain /> }/> : <Navigate to={ LEGAL_OFFICER_PATH } /> }
            />
            <Route
                path={ LOGIN_PATH }
                element={ <Login /> }
            />
            <Route path="/" element={ <Navigate to={ redirectTo } /> } />
        </Routes>
    );
}
