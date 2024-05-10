import { LgntFormatter, Lgnt, Numbers } from "@logion/node-api";

export default function AmountFormat(props: { amount?: Lgnt | undefined, decimals?: number, unit?: Numbers.UnitPrefix, undefinedText?: string }) {

    if(props.amount) {
        const unit = props.unit ? props.unit : toUnit(props.amount);
        const formatter = new LgntFormatter(props.decimals || 2, unit)
        return (
            <span>{ formatter.format(props.amount) }</span>
        );
    } else {
        return <span>{ props.undefinedText }</span>
    }
}

export function toUnit(lgnt: Lgnt): Numbers.UnitPrefix {
    const scientific = lgnt.toCanonicalPrefixedNumber().scientificNumber.optimizeScale(3);
    return Numbers.convertToPrefixed(scientific).prefix
}

