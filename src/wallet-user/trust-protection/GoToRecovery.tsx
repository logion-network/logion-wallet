import React from 'react';
import { Link } from 'react-router-dom';

import { FullWidthPane } from '../../common/Dashboard';
import Alert from '../../common/Alert';
import Button from '../../common/Button';

import { useUserContext } from '../UserContext';
import { RECOVERY_PATH } from '../UserRouter';

export default function GoToTrustProtection() {
    const { colorTheme } = useUserContext();

    return (
        <FullWidthPane
            mainTitle="My Logion Trust Protection"
            subTitle="Recovery in progress"
            titleIcon={{
                icon: {
                    id: 'shield',
                    hasVariants: true,
                },
            }}
            colors={ colorTheme }
        >
            <Alert variant="info">
                Please go to Recovery in order to follow the status of recovery process.
            </Alert>

            <Button
                variant="primary"
                colors={ colorTheme.buttons }
            >
                <Link to={ RECOVERY_PATH }>Go to Recovery</Link>
            </Button>
        </FullWidthPane>
    );
}
