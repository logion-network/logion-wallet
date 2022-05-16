import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase, isLogionIdentityLoc } from "@logion/node-api/dist/Types";

export interface Props {
    locId: UUID
    loc: LegalOfficerCase
}

export default function IntroductionText(props: Props) {
    const { locId, loc } = props

    if (isLogionIdentityLoc(loc)) {
        return <div className="description">
            <p>This specific Logion Legal Officer Case (LOC) certificate,
                known as “<strong>Logion Identity LOC</strong>”, constitutes proof that a Logion
                Legal Officer, owner of that LOC and mentioned on this document, executed an
                Identity verification process according to his/her professional standards at the
                requester demand with regards to data and document(s) listed below.</p>
            <p>This Identity LOC ID ({ locId.toDecimalString() }) is used
                when a Legal Officer client cannot use a polkadot account to request Legal Officer
                services. The Legal Officer is able to initiate legal services requests ON BEHALF of
                this Logion Identity LOC, representing - on the blockchain-, by extension, the
                client it refers.</p>
            <p>This Certificate is only valid when generated online by accessing its URL. A PDF or print of this
                certificate is NOT valid.</p>
        </div>
    } else if (loc.locType === 'Collection') {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate is delivered for a <strong>COLLECTION</strong> and its
                related <strong>COLLECTION ITEMS</strong>. Thus, the collection item identified below benefits from the
                scope of this LOC.</p>
            <p>This Certificate constitutes proof that a Logion Legal Officer, owner of that LOC and mentioned on this
                document, executed a verification process according to his/her professional standards at the requester
                demand with regards to data and document(s) listed below.</p>
            <p>This Certificate is only valid when generated online by accessing its URL. A PDF or print of this
                certificate is NOT valid.</p>
        </div>
    } else {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate constitutes
                proof that a Logion Legal Officer, owner of that LOC and mentioned on this document,
                executed a verification process according to his/her professional standards at the
                requester demand with regards to data and document(s) listed below.</p>
            <p>This Certificate is only valid when generated online by accessing its URL. A PDF or print of this
                certificate is NOT valid.</p>
        </div>
    }
}
