export interface Props {
    coinId: string;
}

const coinNames: Record<string, string> = {
    "lgnt": "Logion Token",
    "dot": "Polkadot"
};

export default function CoinName(props: Props) {
    return <span>{ coinNames[props.coinId] }</span>;
}
