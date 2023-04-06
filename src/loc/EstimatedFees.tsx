import { Fees, LGNT_SMALLEST_UNIT, PrefixedNumber, NONE } from "@logion/node-api";
import AmountFormat from "src/common/AmountFormat";
import { customClassName } from "src/common/types/Helpers";
import "./EstimatedFees.css";

export interface Props {
    fees: Fees | undefined | null;
    hideTitle?: boolean;
    centered?: boolean;
    inclusionFeePaidBy?: string;
    storageFeePaidBy?: string;
}

export default function EstimatedFees(props: Props) {
    if(!props.fees) {
        return null;
    }

    const className = customClassName("EstimatedFees", props.centered === true ? "centered-table" : undefined);
    return (
        <div className={ className }>
            { props.hideTitle !== true && <h3>Estimated fees (LGNT)</h3> }
            <table>
                <tbody>
                    <tr>
                        <td>Blockchain record</td>
                        <td>
                            <AmountFormat
                                amount={ new PrefixedNumber(props.fees.inclusionFee.toString(), LGNT_SMALLEST_UNIT).convertTo(NONE) }
                                decimals={4}
                            />
                        </td>
                        { (props.storageFeePaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td>{ props.inclusionFeePaidBy || "" }</td> }
                    </tr>
                    { props.fees.storageFee !== undefined && 
                        <tr>
                            <td>File storage</td>
                            <td>
                                <AmountFormat
                                    amount={ new PrefixedNumber(props.fees.storageFee.toString(), LGNT_SMALLEST_UNIT).convertTo(NONE) }
                                    decimals={4}
                                />
                            </td>
                            { (props.storageFeePaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td>{ props.storageFeePaidBy || "" }</td> }
                        </tr>
                    }
                    <tr>
                        <td>Total</td>
                        <td>
                            <AmountFormat
                                amount={ new PrefixedNumber(props.fees.totalFee.toString(), LGNT_SMALLEST_UNIT).convertTo(NONE) }
                                decimals={4}
                            />
                        </td>
                        { (props.storageFeePaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td></td> }
                    </tr>
                </tbody>
            </table>
        </div>
    );
}