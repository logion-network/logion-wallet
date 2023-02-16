import Icon from "src/common/Icon";

import "./FrameTitle.css";

export interface Props {
    iconId?: string;
    text: string;
}

export default function FrameTitle(props: Props) {
    return (
        <span className="FrameTitle">
            { props.iconId ? <span className="icon-container"><Icon icon={{id: props.iconId }} height="36px" /></span> : null }
            <span className="text-container">{ props.text }</span>
        </span>
    );
}
