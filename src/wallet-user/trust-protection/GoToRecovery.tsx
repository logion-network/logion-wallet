import React from 'react';
import { Link } from 'react-router-dom';

import { useRootContext } from '../../RootContext';
import { FullWidthPane } from '../../component/Dashboard';
import Alert from '../../component/Alert';
import Button from '../../component/Button';

import { useUserContext } from '../UserContext';
import { RECOVERY_PATH } from '../UserRouter';

export default function GoToTrustProtection() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            mainTitle="My Logion Trust Protection"
            subTitle="Recovery in progress"
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Alert variant="info">
                Please go to Recovery in order to follow the status of recovery process.
            </Alert>

            <Button
                variant="primary"
                backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
            >
                <Link to={ RECOVERY_PATH }>Go to Recovery</Link>
            </Button>
        </FullWidthPane>
    );
}
