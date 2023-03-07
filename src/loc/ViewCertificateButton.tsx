import Button from "src/common/Button";
import Icon from "src/common/Icon";
import "./ViewCertificateButton.css";

export interface Props {
    url: string;
}

export default function ViewCertificateButton(props: Props) {
    return (
        <Button
            className="ViewCertificateButton"
            onClick={ () => window.open(props.url, "_blank") }
        >
            <Icon icon={{ id:"view-certificate" }} height="20px" />
        </Button>
    );
}
