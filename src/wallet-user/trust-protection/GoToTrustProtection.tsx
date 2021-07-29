import React from 'react';
import { Link } from 'react-router-dom';

import { FullWidthPane } from '../../common/Dashboard';
import Alert from '../../common/Alert';
import Button from '../../common/Button';
import { useCommonContext } from '../../common/CommonContext';

import { TRUST_PROTECTION_PATH } from '../UserRouter';

export default function GoToTrustProtection() {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            mainTitle="Recovery"
            subTitle="No recovery possible"
            titleIcon={{
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.recoveryItems.iconGradient,
            }}
        >
            <Alert variant="info">
                A Trust Protection process is already in progress with this address or it is already protected.
                If you want to start a recovery process, please create a new address using the extension and then
                go to "Recovery".
            </Alert>

            <Button
                variant="primary"
            >
                <Link to={ TRUST_PROTECTION_PATH }>Go to My Logion Trust Protection</Link>
            </Button>
        </FullWidthPane>
    );
}
