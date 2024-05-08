import Icon from "src/common/Icon";

export interface Props {
    height: string;
}

export default function CoinIcon(props: Props) {
    return (
        <Icon
            icon={{ id: "lgnt" }}
            height={ props.height }
            width="auto"
        />
    );
}
