import { LocType } from "@logion/node-api";
import { LocData, LocRequestState } from "@logion/client";

export function merge<T extends LocRequestState>(input: Record<LocType, T[]> | undefined): LocData[] {
    if (!input) {
        return [];
    }
    const types: LocType[] = [ "Transaction", "Collection", "Identity" ];
    return types
        .map(type => input[type])
        .flat()
        .map(locState => locState.data());
}
