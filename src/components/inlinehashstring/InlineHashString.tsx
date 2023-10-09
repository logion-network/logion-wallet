import { HashString } from "@logion/client";

export interface Props {
    value: HashString;
}

export default function InlineHashString(props: Props) {
    return <>{ validValueOrHex(props.value) }</>;
}

export function validValueOrHex(hashString: HashString): string {
    return hashString.isValidValue() ? hashString.validValue() : hashString.hash.toHex();
}
