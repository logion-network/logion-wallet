import { useHistory } from "react-router";
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import Tabs from "../../common/Tabs";
import { Col } from "react-bootstrap";
import { format } from "../../logion-chain/datetime";
import LocPublicDataButton from "./LocPublicDataButton";
import { useLocContext } from "./LocContext";
import LocItems from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../../common/Grid";
import TwoSideButtonGroup from "../../common/TwoSideButtonGroup";
import { POLKADOT } from "../../common/ColorTheme";
import CloseLocButton from "./CloseLocButton";
import LocPrivateFileButton from "./LocPrivateFileButton";

import "./ContextualizedLocDetails.css";
import Icon from "../../common/Icon";
import LocLinkButton from "./LocLinkButton";

export interface Props {
    backPath: string,
}

export default function ContextualizedLocDetails(props: Props) {
    const { colorTheme } = useCommonContext();
    const history = useHistory();
    const { loc, locId, locRequest } = useLocContext();

    if (loc === null || locRequest === null) {
        return null;
    }

    return (
        <FullWidthPane
            mainTitle="Transaction Protection Cases"
            titleIcon={ {
                icon: {
                    id: 'loc'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => history.push(props.backPath) }
            className="ContextualizedLocDetails"
        >
            <Tabs
                activeKey="details"
                onSelect={ () => {
                } }
                tabs={ [ {
                    key: "details",
                    title: "Logion Officer Case",
                    render: () => {
                        const { date, time } = format(locRequest.createdOn)
                        return <>
                            <Row>
                                <Col md={ 4 }>
                                    <LocItemDetail label="LOC ID">{ locId.toDecimalString() }</LocItemDetail>
                                    <LocItemDetail label="Creation date">{ date } / { time }</LocItemDetail>
                                </Col>
                                <Col md={ 4 }>
                                    <LocItemDetail label="Description">{ locRequest?.description }</LocItemDetail>
                                </Col>

                                <Col md={ 4 } className="closed-icon-container">
                                    <LocItemDetail
                                        label="Requested by">{ locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }<br />{ locRequest.requesterAddress }
                                    </LocItemDetail>
                                    {
                                        loc.closed &&
                                        <div className="closed-icon">
                                            <Icon icon={ { id: "polkadot_shield" } } />
                                        </div>
                                    }
                                </Col>
                            </Row>
                            <LocItems />
                        </>
                    }
                } ] }
                borderColor={ loc.closed ? POLKADOT : undefined }
            />
            {
                !loc.closed &&
                <TwoSideButtonGroup
                    left={
                        <>
                            <LocPublicDataButton />
                            <LocPrivateFileButton />
                            <LocLinkButton/>
                        </>
                    }
                    right={
                        <CloseLocButton/>
                    }
                />
            }
        </FullWidthPane>
    );
}
