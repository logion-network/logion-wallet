import { Fees } from "@logion/client";
import { LGNT_SMALLEST_UNIT, PrefixedNumber } from "@logion/node-api";
import AmountFormat from "src/common/AmountFormat";
import "./EstimatedFees.css";

export interface Props {
    fees: Fees | undefined | null;
}

export default function EstimatedFees(props: Props) {
    if(!props.fees) {
        return null;
    }
    return (
        <div className="EstimatedFees">
            <h3>Estimated fees (LGNT)</h3>
            <table>
                <tbody>
                    <tr>
                        <td>Blockchain record</td>
                        <td><AmountFormat amount={ new PrefixedNumber(props.fees.inclusionFee.toString(), LGNT_SMALLEST_UNIT).optimizeScale(5) } /></td>
                    </tr>
                    { props.fees.storageFee !== undefined && 
                        <tr>
                            <td>File storage</td>
                            <td><AmountFormat amount={ new PrefixedNumber(props.fees.storageFee.toString(), LGNT_SMALLEST_UNIT).optimizeScale(5) } /></td>
                        </tr>
                    }
                    <tr>
                        <td>Total</td>
                        <td><AmountFormat amount={ new PrefixedNumber(props.fees.totalFee.toString(), LGNT_SMALLEST_UNIT).optimizeScale(5) } /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
