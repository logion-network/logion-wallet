import LocPane from "../LocPane";
import { useLocContext } from "../LocContext";
import VTPSelectionFrame from "./VTPSelectionFrame";

export default function VTPSelectionPane() {

    const { backPath, loc } = useLocContext();
    return (
        <LocPane
            loc={ loc }
            backPath={ backPath }
        >
            <VTPSelectionFrame/>
        </LocPane>
    )
}
