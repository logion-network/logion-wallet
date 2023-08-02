import { HashString } from "@logion/client";

export interface Props {
    value: HashString;
}

export default function InlineHashString(props: Props) {
    return <>{ props.value.isValidValue() ? props.value.validValue() : props.value.hash.toHex() }</>;
}
