import { TypesAccountData } from "@logion/node-api";
import InlineAmount from "src/components/inlineamount/InlineAmount";
import "./BalanceDetails.css";

export interface Props {
    balance: TypesAccountData;
}

export default function BalanceDetails(props: Props) {
    return (
        <div className="BalanceDetails">
            <div className="detail">
                <div className="label">Available:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.available } />
                </div>
            </div>
            <div className="detail">
                <div className="label">Reserved:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.reserved } />
                </div>
            </div>
            <div className="detail">
                <div className="label">Total:</div>
                <div className="amount">
                    <InlineAmount amount={ props.balance.total } />
                </div>
            </div>
        </div>
    );
}
