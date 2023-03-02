import { LocType } from "@logion/node-api";
import { useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import Frame from "src/common/Frame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";

import "./DraftLocInstructions.css";
import { getTemplate, SPECIFIC_TEMPLATE } from "./Template";

export interface Props {
    locType: LocType;
    template?: string;
}

export default function DraftLocInstructions(props: Props) {
    const template = useMemo(() => getTemplate(props.locType, props.template), [ props.locType, props.template ]);
    const instructionsWidth = useMemo(() => template === undefined || template === SPECIFIC_TEMPLATE ? 12 : 8, [ template ]);

    return (
        <div className="DraftLocInstructions">
            <Row>
                <Col md={instructionsWidth}>
                    <Frame>
                        <IconTextRow
                            icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                            text={
                                <>
                                    <p>Please add all public data and confidential documents, you need to send to your Legal Officer.</p>
                                    <p>After validation of this request by your Legal Officer:</p>
                                    <ul>
                                        <li>Public data will be publicly available on the logion blockchain and public certificate.</li>
                                        <li>Confidential documents will not be publicly available and will stay confidential between you and your Legal Officer.</li>
                                    </ul>
                                </>
                            }
                        />
                    </Frame>
                </Col>
                {
                    instructionsWidth < 12 && template &&
                    <Col>
                        <Frame className="project-type">
                            <Icon icon={ template.icon } height="89px"/>
                            <p><strong>Project type:</strong> { template.name }</p>
                        </Frame>
                    </Col>
                }
            </Row>
        </div>
    );
}
