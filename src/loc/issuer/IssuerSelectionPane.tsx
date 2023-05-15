import LocPane from "../LocPane";
import { useLocContext } from "../LocContext";
import IssuerSelectionFrame from "./IssuerSelectionFrame";

export default function IssuerSelectionPane() {

    const { backPath, loc } = useLocContext();
    return (
        <LocPane
            loc={ loc }
            backPath={ backPath }
        >
            <IssuerSelectionFrame/>
        </LocPane>
    )
}
