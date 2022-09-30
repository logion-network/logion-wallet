import { CollectionItem } from "@logion/client";
import SpecificLicense from "./SpecificLicense";

export interface Props {
    item: CollectionItem;
}

export default function SpecificLicenses(props: Props) {
    const { item } = props;

    return (
        <div className="SpecificLicenses">
            {
                item.specificLicenses.length === 0 &&
                <SpecificLicense />
            }
            {
                item.specificLicenses.map((specificLicense, index) =>
                    <SpecificLicense key={ index } specificLicense={ specificLicense } />
                )
            }
        </div>
    );
}
