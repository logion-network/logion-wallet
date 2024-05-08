import { Lgnt, Numbers } from "@logion/node-api";

export interface Props {
    unit: Numbers.UnitPrefix;
}

export default function AssetNameCell(props: Props) {

    return (
        <div className="asset-name-cell">
            <span className="name">Logion Token ({ props.unit.symbol }{ Lgnt.CODE })</span>
        </div>
    );
}
