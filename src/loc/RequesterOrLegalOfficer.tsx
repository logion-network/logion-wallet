import { LocData, LegalOfficer } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";
import { Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import Ellipsis from "src/common/Ellipsis";
import Icon from "src/common/Icon";
import NewTabLink from "src/common/NewTabLink";
import LocItemDetail from "./LocItemDetail";
import { Viewer } from "./types";

export interface Props {
    loc: LocData;
    viewer: Viewer;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
}

export default function RequesterOrLegalOfficer(props: Props) {
    const { loc, viewer, detailsPath, legalOfficer } = props;

    return (
        <Col md={ 4 } className="closed-icon-container">
            {
                viewer === "LegalOfficer" &&
                <LocItemDetail
                    label="Requested by"
                >
                    { loc.userIdentity?.firstName || "" } { loc.userIdentity?.lastName || "" }
                    {
                        loc.requesterAddress !== null && loc.requesterAddress !== undefined &&
                        <>
                            <OverlayTrigger
                                placement="top"
                                delay={ 500 }
                                overlay={
                                    <Tooltip
                                        id={ loc.requesterAddress }>{ loc.requesterAddress }</Tooltip> }>
                                <span><br /> { loc.requesterAddress }</span>
                            </OverlayTrigger>
                        </>
                    }
                    {
                        loc.requesterLocId !== undefined &&
                        <span><br />
                        <NewTabLink
                            href={ detailsPath(loc.requesterLocId, 'Identity') }
                            iconId="loc-link"
                            inline
                        >
                            <Ellipsis
                                maxWidth="250px">{ loc.requesterLocId.toDecimalString() }</Ellipsis>
                        </NewTabLink>
                    </span>
                    }
                </LocItemDetail>
            }
            {
                viewer === "User" &&
                <LocItemDetail
                    label="Legal Officer in charge"
                >
                    { legalOfficer?.name || "" }
                        <OverlayTrigger
                            placement="top"
                            delay={ 500 }
                            overlay={
                                <Tooltip
                                    id={ loc?.ownerAddress }>{ loc?.ownerAddress }</Tooltip> }>
                            <span><br /> { loc?.ownerAddress }</span>
                        </OverlayTrigger>
                </LocItemDetail>
            }
            {
                loc.closed && loc.voidInfo === undefined &&
                <div className="closed-icon">
                    <Icon icon={ { id: "polkadot_shield" } } />
                </div>
            }
            {
                loc.voidInfo !== undefined &&
                <div className="closed-icon">
                    <Icon icon={ { id: "void_shield" } } />
                </div>
            }
        </Col>
    );
}
