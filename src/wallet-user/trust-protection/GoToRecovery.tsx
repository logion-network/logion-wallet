import { useNavigate } from 'react-router';

import { FullWidthPane } from '../../common/Dashboard';
import Alert from '../../common/Alert';
import Button from '../../common/Button';

import { RECOVERY_PATH } from '../UserRouter';

export default function GoToRecovery() {
    const navigate = useNavigate();

    return (
        <FullWidthPane
            mainTitle="My Logion Protection"
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
                onClick={ () => navigate(RECOVERY_PATH) }
            >
                Go to Recovery
            </Button>
        </FullWidthPane>
    );
}
