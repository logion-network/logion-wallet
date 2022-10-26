import { CreativeCommons as CreativeCommonsType } from "@logion/client";
import NewTabLink from "src/common/NewTabLink";
import CertificateLabel from "./CertificateLabel";
import CreativeCommonsIcon from "../components/license/CreativeCommonsIcon";
import { Row } from "../common/Grid";
import "./CreativeCommons.css"

export interface Props {
    creativeCommons: CreativeCommonsType;
}

export default function CreativeCommons(props: Props) {

    const { creativeCommons } = props;
    return (
        <div className="CreativeCommons">
            <CertificateLabel smaller={ true }>IP rights granted with this Collection Item</CertificateLabel>
            <Row>
                <CreativeCommonsIcon creativeCommons={ creativeCommons } />
                <p className="text">This work is licensed under a&nbsp;
                    <NewTabLink href={ creativeCommons.deedUrl() } inline>
                        Creative Commons Attribution 4.0 International License
                    </NewTabLink>.
                </p>
            </Row>
        </div>
    );
}
