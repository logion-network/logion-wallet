import { customClassName, toggleClass } from "src/common/types/Helpers";
import "./CertificateLabel.css";

export interface Props {
    children: React.ReactNode;
    smaller?: boolean;
}

export default function CertificateLabel(props: Props) {

    const className = customClassName(
        "CertificateLabel",
        toggleClass(props.smaller, "smaller")
    );

    return (
        <div className={ className }>{ props.children }</div>
    );
}
