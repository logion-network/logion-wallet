import React from 'react';
import { Link } from 'react-router-dom';

import { FullWidthPane } from '../../common/Dashboard';
import Alert from '../../common/Alert';
import Button from '../../common/Button';

import { RECOVERY_PATH } from '../UserRouter';

export default function GoToTrustProtection() {

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
        >
            <Alert variant="info">
                Please go to Recovery in order to follow the status of recovery process.
            </Alert>

            <Button
                variant="primary"
            >
                <Link to={ RECOVERY_PATH }>Go to Recovery</Link>
            </Button>
        </FullWidthPane>
    );
}
