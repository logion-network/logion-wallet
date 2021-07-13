import React from 'react';
import { Link } from 'react-router-dom';

import { useRootContext } from '../../RootContext';
import { FullWidthPane } from '../../component/Dashboard';
import Alert from '../../component/Alert';
import Button from '../../component/Button';

import { useUserContext } from '../UserContext';
import { TRUST_PROTECTION_PATH } from '../UserRouter';

export default function GoToTrustProtection() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            mainTitle="Recovery"
            subTitle="No recovery possible"
            titleIcon={{
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.bottomMenuItems.iconGradient,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Alert variant="info">
                A Trust Protection process is already in progress with this address or it is already protected.
                If you want to start a recovery process, please create a new address using the extension and then
                go to "Recovery".
            </Alert>

            <Button
                variant="primary"
                colors={ colorTheme.buttons }
            >
                <Link to={ TRUST_PROTECTION_PATH }>Go to My Logion Trust Protection</Link>
            </Button>
        </FullWidthPane>
    );
}
