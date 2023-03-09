import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import "./ViewCertificateButton.css";

export interface Props {
    url: string;
}

export default function ViewCertificateButton(props: Props) {
    return (
        <OverlayTrigger
            placement="bottom"
            delay={ 500 }
            overlay={
                <Tooltip id={`view-certificate-${props.url}`}>
                    Open certificate in another tab
                </Tooltip>
            }
        >
            <span className="Button-container">
                <Button
                    className="ViewCertificateButton"
                    onClick={ () => window.open(props.url, "_blank") }
                >
                    <Icon icon={{ id:"view-certificate" }} height="20px" />
                </Button>
            </span>
        </OverlayTrigger>
    );
}
