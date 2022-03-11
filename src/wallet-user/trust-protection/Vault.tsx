import { Props as WalletProps, Content as WalletContent } from "../../common/Wallet"
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import React from "react";
import './Vault.css';
import { useUserContext } from "../UserContext";
import { Row, Col } from "../../common/Grid";
import CopyPasteButton from "../../common/CopyPasteButton";
import Frame from "../../common/Frame";

export interface Props extends WalletProps {
}

export default function Vault(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            className="Vault"
            mainTitle="Vault"
            titleIcon={{
                icon: {
                    id: 'vault'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Header/>
            <WalletContent { ...props } type="Vault" />
        </FullWidthPane>
    );
}

function Header() {
    const { vaultAddress } = useUserContext()

    return (
        <div className="col-xxxl-12">
            <Frame>
                <Row>
                    <Col>
                        <p>Your logion Vault public address:</p>
                        <Row>
                            <span>{ vaultAddress }</span>
                            <CopyPasteButton value={ vaultAddress! } className="medium" />
                        </Row>
                    </Col>
                    <Col>
                        <p>
                            You can use this Vault public address to transfer assets directly to<br />
                            your Vault. Once transferred, your assets will be immediately<br />
                            protected by a Legal Officer signature-based transfer protocol.
                        </p>
                    </Col>
                </Row>
            </Frame>
        </div>
    )
}
