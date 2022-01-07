import { useNavigate } from 'react-router';

import { FullWidthPane } from '../../common/Dashboard';
import Alert from '../../common/Alert';
import Button from '../../common/Button';
import { useCommonContext } from '../../common/CommonContext';

import { TRUST_PROTECTION_PATH } from '../UserRouter';

import './GoToTrustProtection.css';
import Frame from '../../common/Frame';

export default function GoToTrustProtection() {
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();

    return (
        <FullWidthPane
            className="GoToTrustProtection"
            mainTitle="Recovery"
            subTitle="No recovery possible"
            titleIcon={{
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.recoveryItems.iconGradient,
            }}
        >
            <Frame
                fullHeight
            >
                <Alert variant="info">
                    A Trust Protection process is already in progress with this address or it is already protected.
                    If you want to start a recovery process, please create a new address using the extension and then
                    go to "Recovery".
                </Alert>

                <Button
                    variant="primary"
                    onClick={ () => navigate(TRUST_PROTECTION_PATH) }
                >
                    Go to My Logion Protection
                </Button>
                <div className="recovery-process-footer">
                    <img className="recovery-process-footer-image"
                            src={ process.env.PUBLIC_URL + "/assets/recovery-process.png" }
                            alt="legal officer giving key" />
                </div>
            </Frame>
        </FullWidthPane>
    );
}
