import { LocData, LocRequestState } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "src/common/Button";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import LocCreationDialog from "./LocCreationDialog";
import { Row } from "src/common/Grid";

import "./LegalOfficerInstructions.css";

export interface Props {
    loc: LocData;
    locState: LocRequestState;
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function LegalOfficerInstructions(props: Props) {
    const {
        loc,
        locState,
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
                        { loc.status === "CLOSED" && loc.voidInfo === undefined &&
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
                locState.isLogionIdentity() &&
                <LocCreationDialog
                    show={ createLoc }
                    exit={ () => setCreateLoc(false) }
                    onSuccess={ request => navigate(detailsPath(request.id, 'Transaction')) }
                    locRequest={ {
                        requesterLocId: loc.id,
                        locType: 'Transaction',
                        userIdentity: loc.userIdentity,
                    } }
                    hasLinkNature={ false }
                />
            }
        </>
    );
}
