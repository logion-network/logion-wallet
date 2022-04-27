import React, { ReactChild } from "react";
import { Row, Col } from "../../common/Grid";
import Button from "../../common/Button";

export interface Props {
    previewPath: string;
}

export default function StatementOfFactsSummary(props: Props) {

    interface NewTabForwardProps {
        path: string;
        children: ReactChild;
    }

    const NewTabForward = React.forwardRef<HTMLAnchorElement, NewTabForwardProps>((props, ref) => {
        const { path, children } = props;
        return (
            <a
                href={ path }
                target="_blank"
                rel="noreferrer"
                ref={ ref }
                className="StatementOfFactsButtonDropdownItem"
            >
                { children }
            </a>
        );
    });

    return (
        <>
            <h3>Statement of Facts generator</h3>
            <p>Your statement of Facts is ready, you can view it by clicking on the related icon, hereafter.</p>
            <p>
                <strong>As a mandatory step, you must submit the signed Statement of Fact PDF in the related LOC:
                </strong>
                You can access the related LOC by clicking on the link, hereafter. Do not forget to upload the
                <strong>signed version of your Statement of Facts</strong> before closing the related LOC. DO NOT put
                the signed version of this Statement of Facts in another LOC, otherwise, the LOC URL mentioned in the
                Statement of Facts will not be valid.
            </p>
            <p>
                For your convenience, all files mentioned in the Statement of Facts are also ready to be downloaded by
                clicking the related icon hereafter.
            </p>
            <Row>
                <Col>Statements of Facts</Col>
                <Col>
                    <NewTabForward path={ props.previewPath }>
                        <Button>Preview</Button>
                    </NewTabForward>
                </Col>
            </Row>
            <Row>
                <Col>&nbsp;</Col>
                <Col><Button>Download all LOC files</Button></Col>
            </Row>
        </>
    )
}
