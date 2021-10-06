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
import CloseLocButton from "./CloseLocButton";
import LocPrivateFileButton from "./LocPrivateFileButton";

import "./ContextualizedLocDetails.css";

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
                                <Col md={ 6 }>
                                    <LocItemDetail label="LOC ID">{ locId.toDecimalString() }</LocItemDetail>
                                    <LocItemDetail label="Creation date">{ date } / { time }</LocItemDetail>
                                </Col>
                                <Col md={ 6 }>
                                    <LocItemDetail
                                        label="Requested by">{ locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }<br />{ locRequest.requesterAddress }
                                    </LocItemDetail>
                                </Col>
                            </Row>
                            <LocItems />
                        </>
                    }
                } ] } />
            <TwoSideButtonGroup
                left={
                    <>
                        <LocPublicDataButton />
                        <LocPrivateFileButton />
                    </>
                }
                right={
                    <CloseLocButton/>
                }
            />
        </FullWidthPane>
    );
}
