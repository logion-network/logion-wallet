import Icon, { IconFileType } from "src/common/Icon";

export interface Props {
    coinId: string;
    height: string;
}

const iconIds: Record<string, string> = {
    "lgnt": "lgnt",
    "dot": "dot"
};

const iconTypes: Record<string, IconFileType> = {
    "lgnt": "svg",
    "dot": "png"
};

export default function CoinIcon(props: Props) {
    return (
        <Icon
            icon={{ id: iconIds[props.coinId] }}
            type={ iconTypes[props.coinId] }
            height={ props.height }
            width="auto"
        />
    );
}
