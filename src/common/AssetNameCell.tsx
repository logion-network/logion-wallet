import { CoinBalance } from "@logion/node-api";
import CoinName from "src/components/coin/CoinName";

export interface Props {
    balance: CoinBalance;
}

export default function AssetNameCell(props: Props) {

    return (
        <div className="asset-name-cell">
            <span className="name"><CoinName coinId={ props.balance.coin.id }/> ({ props.balance.available.prefix.symbol }{ props.balance.coin.symbol })</span>
        </div>
    );
}
