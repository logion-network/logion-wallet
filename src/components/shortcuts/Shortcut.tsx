import Button from "src/common/Button";
import Icon from "src/common/Icon";
import "./Shortcut.css";

export interface Props {
    iconId: string;
    text: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export default function Shortcut(props: Props) {
    return (
        <div
            className="Shortcut"
        >
            <Button
                className="shortcut-btn"
                onClick={ props.onClick }
                disabled={ props.disabled }
            >
                <Icon icon={{ id: props.iconId }} />
                <div className="shortcut-text">{ props.text }</div>
            </Button>
        </div>
    );
}
