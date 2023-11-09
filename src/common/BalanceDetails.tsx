import { CoinBalance } from "@logion/node-api";
import InlineAmount from "src/components/inlineamount/InlineAmount";
import "./BalanceDetails.css";

export interface Props {
    balance: CoinBalance;
    type: 'arc' | 'linear';
}

export default function BalanceDetails(props: Props) {
    return (
        <div className={ `BalanceDetails ${props.type}` }>
            <div className="detail">
                <div className="label">Available:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.available } coin={ props.balance.coin } />
                </div>
            </div>
            <div className="detail">
                <div className="label">Reserved:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.reserved } coin={ props.balance.coin } />
                </div>
            </div>
            <div className="detail">
                <div className="label">Total:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.total } coin={ props.balance.coin } />
                </div>
            </div>
        </div>
    );
}
