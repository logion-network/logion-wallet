import { useHistory } from "react-router";
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import Tabs from "../../common/Tabs";
import Button from "../../common/Button";
import ButtonGroup from "../../common/ButtonGroup";
import { Col } from "react-bootstrap";
import { format } from "../../logion-chain/datetime";
import LocPublicDataButton from "./LocPublicDataButton";
import { useLocContext } from "./LocContext";
import LocItems from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../../common/Grid";

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
                                    <LocItemDetail
                                        label="Requested by">{ locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }<br />{ locRequest.requesterAddress }
                                    </LocItemDetail>
                                </Col>
                            </Row>
                            <LocItems />
                        </>
                    }
                } ] } />
            <ButtonGroup>
                <LocPublicDataButton />
                <Button disabled={ true }>Add a confidential document</Button>
                <Button disabled={ true }>Close LOC</Button>
            </ButtonGroup>
        </FullWidthPane>
    );
}
