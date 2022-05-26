import { Props as WalletProps, Content as WalletContent } from "../../common/Wallet"
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import './Vault.css';
import { useUserContext } from "../UserContext";
import { Row, Col } from "../../common/Grid";
import CopyPasteButton from "../../common/CopyPasteButton";
import Frame from "../../common/Frame";
import Icon from "../../common/Icon";
import IconTextRow from "../../common/IconTextRow";

export interface Props extends WalletProps {
}

export default function Vault(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            className="Vault"
            mainTitle="Vault"
            titleIcon={ {
                icon: {
                    id: 'vault'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <Header />
            <WalletContent { ...props } type="Vault" />
        </FullWidthPane>
    );
}

function Header() {
    const { vaultState } = useUserContext();

    if(!vaultState) {
        return null;
    }

    return (
        <div className="col-xxxl-12 header">
            <Frame>
                <Row>
                    <Col className="vault-address">
                        <p className="title">Your logion Vault public address:</p>
                        <Row className="content">
                            <span>{ vaultState.vaultAddress }</span>
                            <CopyPasteButton value={ vaultState.vaultAddress } className="small" />
                        </Row>
                    </Col>
                    <Col className="vault-tip">
                        <IconTextRow
                            icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                            text={ <p>
                                You can use this Vault public address to transfer assets directly to your Vault.<br />
                                Once transferred, your assets will be immediately protected by a Legal Officer
                                signature-based transfer protocol.
                            </p> }
                        />
                    </Col>
                </Row>
            </Frame>
        </div>
    )
}
