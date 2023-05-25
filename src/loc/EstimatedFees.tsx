import { Fees, Numbers, Currency } from "@logion/node-api";
import AmountFormat from "src/common/AmountFormat";
import { customClassName } from "src/common/types/Helpers";
import "./EstimatedFees.css";

export interface Props {
    fees: Fees | undefined | null;
    hideTitle?: boolean;
    centered?: boolean;
    inclusionFeePaidBy?: string;
    otherFeesPaidBy?: string;
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
                                amount={ Currency.toPrefixedNumberAmount(props.fees.inclusionFee).convertTo(Numbers.NONE) }
                                decimals={4}
                            />
                        </td>
                        { (props.otherFeesPaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td>{ props.inclusionFeePaidBy || "" }</td> }
                    </tr>
                    { props.fees.storageFee !== undefined && 
                        <tr>
                            <td>File storage</td>
                            <td>
                                <AmountFormat
                                    amount={ Currency.toPrefixedNumberAmount(props.fees.storageFee).convertTo(Numbers.NONE) }
                                    decimals={4}
                                />
                            </td>
                            { (props.otherFeesPaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { props.fees.legalFee !== undefined && 
                        <tr>
                            <td>Legal fee</td>
                            <td>
                                <AmountFormat
                                    amount={ Currency.toPrefixedNumberAmount(props.fees.legalFee).convertTo(Numbers.NONE) }
                                    decimals={4}
                                />
                            </td>
                            { (props.otherFeesPaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    <tr>
                        <td>Total</td>
                        <td>
                            <AmountFormat
                                amount={ Currency.toPrefixedNumberAmount(props.fees.totalFee).convertTo(Numbers.NONE) }
                                decimals={4}
                            />
                        </td>
                        { (props.otherFeesPaidBy !== undefined || props.inclusionFeePaidBy !== undefined) && <td></td> }
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
