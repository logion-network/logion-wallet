import { LocData } from "@logion/client";
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";
import { LocType, UUID } from "@logion/node-api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "src/common/Button";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import { ActiveLoc } from "./LocContext";
import LocCreationDialog from "./LocCreationDialog";
import { Row } from "src/common/Grid";

import "./LegalOfficerInstructions.css";

export interface Props {
    loc: LocData;
    locState: ActiveLoc;
    protectionRequest: ProtectionRequest | null;
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function LegalOfficerInstructions(props: Props) {
    const {
        loc,
        locState,
        protectionRequest,
        detailsPath,
    } = props;

    const navigate = useNavigate();
    const [ createLoc, setCreateLoc ] = useState(false);

    return (
        <>
            {
                locState.isLogionIdentity() &&
                <Row className="LegalOfficerInstructions logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Identity Case:</strong> must be used when your client cannot have a
                                Polkadot account to request your services. Once closed after a proper identity
                                check,
                                you are able to initiate legal services requests ON BEHALF of this Logion Identity
                                LOC,
                                representing - on the blockchain-, by extension, the client it refers.</p>
                        }
                        className="logion-loc-tip"
                    />
                    <div className="upper-action-bar">
                        { loc.closed && loc.voidInfo === undefined &&
                            <Button
                                onClick={ () => setCreateLoc(true) }
                                slim={ true }
                                className="create-logion-transaction-loc-button"
                            >
                                <Icon icon={ { id: "loc" } } /> Create a Transaction LOC
                            </Button>
                        }
                    </div>
                </Row>
            }
            {
                loc.locType === "Identity" && !locState.isLogionIdentity() && protectionRequest !== null && !protectionRequest.isRecovery &&
                <Row className="LegalOfficerInstructions logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Protection request context:</strong> you are currently verifying the identity
                                of
                                a given person by collecting the
                                required documentation. This verification must follow proper due diligence using
                                tools
                                and processes defined by you and under
                                your Legal Officer responsibility. After this verification, you will be able to
                                confirm
                                the fact you agree to be the
                                Legal Officer of the related person and, thus, be requested to execute protection
                                services such as recovery or multi-signature actions.</p>
                        }
                        className="logion-loc-tip"
                    />
                </Row>
            }
            {
                loc.locType === "Identity" && !locState.isLogionIdentity() && protectionRequest !== undefined && protectionRequest !== null && protectionRequest.isRecovery &&
                <Row className="LegalOfficerInstructions logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Recovery request context:</strong> you are currently verifying the identity
                                of a
                                given person by collecting the required documentation.
                                This verification must follow proper due diligence using tools and processes defined
                                by
                                you and under your Legal Officer responsibility. After this
                                verification, within this present page, you will be able to confirm the fact you are
                                the
                                Legal Officer of the related person and, thus, authorize the
                                transfer of all the assets to the new account this person opened to replace his/her
                                lost
                                one.</p>
                        }
                        className="logion-loc-tip"
                    />
                </Row>
            }
            {
                locState.isLogionIdentity() &&
                <LocCreationDialog
                    show={ createLoc }
                    exit={ () => setCreateLoc(false) }
                    onSuccess={ request => navigate(detailsPath(request.id, 'Transaction')) }
                    locRequest={ {
                        requesterIdentityLoc: loc.id.toString(),
                        locType: 'Transaction',
                        userIdentity: loc.userIdentity,
                    } }
                    hasLinkNature={ false }
                />
            }
        </>
    );
}
