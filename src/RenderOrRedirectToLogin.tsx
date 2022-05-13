import { Navigate, useLocation } from 'react-router-dom';

import { LOGIN_PATH, LocationState } from './Login';
import { useLogionChain } from './logion-chain';

export interface Props {
    render: () => JSX.Element;
}

export default function RenderOrRedirectToLogin(props: Props) {
    const { accounts } = useLogionChain();
    const location = useLocation();

    if(accounts !== null
            && accounts.all.find(address => address.token !== undefined) === undefined) {
        const state: LocationState = {
            referrer: location.pathname
        };
        return <Navigate to={ LOGIN_PATH } state={ state } />;
    } else {
        return props.render();
    }
}
