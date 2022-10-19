import { useCommonContext } from "src/common/CommonContext";
import Icon from "src/common/Icon";

import "./LegalEntity.css";

export interface Props {
    company?: string;
}

export default function LegalEntity(props: Props) {
    const { viewer } = useCommonContext();

    if(!props.company) {
        return null;
    } else {
        return (
            <div className="LegalEntity">
                <div className="icon-container">
                    <Icon icon={{id:"company"}} height="45px" />
                </div>
                <div className="text-container">
                    <p className="important">Important:</p>
                    {
                        viewer === "User" &&
                        <p>Identity LOC request done on behalf of a <strong>legal entity</strong>, the Legal Officer due diligence will be executed accordingly.</p>
                    }
                    {
                        viewer === "LegalOfficer" &&
                        <p>Identity LOC request done on behalf of a <strong>legal entity</strong>, please execute your due diligence accordingly.</p>
                    }
                    <p>Legal entity name: <strong>{ props.company }</strong></p>
                </div>
            </div>
        )
    }
}
