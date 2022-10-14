import { CollectionItem } from "@logion/client";

import NewTabLink from "src/common/NewTabLink";
import { fullCertificateUrl } from "src/PublicPaths";
import CertificateLabel from "./CertificateLabel";
import LogionTerms from "./LogionTerms";

export interface Props {
    item: CollectionItem;
}

export default function LogionClassification(props: Props) {
    const { item } = props;

    return (
        <div className="LogionClassification">
            <CertificateLabel smaller={ true }>IP rights granted with this Collection Item</CertificateLabel>
            {
                !item.logionClassification &&
                <p>None</p>
            }
            {
                item.logionClassification !== undefined &&
                <>
                <p>This is a human-readable summary (but not a substitute) of the Logion IP rights classification (“LIRC”):&nbsp;
                    <NewTabLink href={ `${process.env.PUBLIC_URL}/license/LIRC-v1.0.txt` } inline>LIRC-v1.0.txt</NewTabLink>
                    &nbsp;/&nbsp;
                    <NewTabLink href={ fullCertificateUrl(item.logionClassification.tcLocId) } iconId="loc-link" inline>LIRC-v1.0 certificate</NewTabLink>.
                </p>
                <p>Should an additional license exist between the parties that shall apply to the subject of this Collection Item, the parties agreed that
                    the LIRC supersedes in case of conflict.
                </p>
                <LogionTerms terms={ item.logionClassification } />
                </>
            }
        </div>
    );
}
