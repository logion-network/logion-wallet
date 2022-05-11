import { PrefixedNumber } from "@logion/node-api/dist/numbers";

export default function AmountFormat(props: { amount?: PrefixedNumber | undefined }) {

    if(props.amount) {
        return (
            <span>{ props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }</span>
        );
    } else {
        return <span></span>
    }
}
