import { PublicLoc } from "@logion/client";
import QrCode from "src/components/qrcode/QrCode";

export type IntroductionType = 'Regular' | 'TokenGated' | 'TokensRecord';

export interface Props {
    loc: PublicLoc
    type: IntroductionType
}

const QR_CODE_WIDTH = "150px";

export default function IntroductionText(props: Props) {
    const { loc, type } = props

    if (loc.isLogionIdentityLoc()) {
        return <div className="description">
            <p>This specific Logion Legal Officer Case (LOC) certificate,
                known as “<strong>Logion Identity LOC</strong>”, constitutes proof that a Logion
                Legal Officer, owner of that LOC and mentioned on this document, executed an
                Identity verification process according to his/her professional standards at the
                requester demand with regards to data and document(s) listed below.</p>
            <p>This Identity LOC ID ({ loc.data.id.toDecimalString() }) is used
                when a Legal Officer client cannot use a polkadot account to request Legal Officer
                services. The Legal Officer is able to initiate legal services requests ON BEHALF of
                this Logion Identity LOC, representing - on the blockchain-, by extension, the
                client it refers.</p>
            <p>All timestamps are displayed using Universal Time Coordinated (UTC).</p>
            <p>A PDF or print of this certificate is NOT valid. This Certificate is only valid when generated online by accessing its URL or through the following QR CODE:</p>
            <div className="qrcode-container">
                <QrCode data={ window.location.href } width={ QR_CODE_WIDTH }/>
            </div>
        </div>
    } else if (loc.data.locType === 'Collection' && type === "Regular") {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate is delivered for a <strong>COLLECTION</strong> and its
                related <strong>COLLECTION ITEMS</strong>. Thus, the collection item identified below benefits from the
                scope of this LOC.</p>
            <p>This Certificate constitutes proof that a Logion Legal Officer, owner of that LOC and mentioned on this
                document, executed a verification process according to his/her professional standards at the requester
                demand with regards to data and document(s) listed below.</p>
            <p>All timestamps are displayed using Universal Time Coordinated (UTC).</p>
            <p>A PDF or print of this certificate is NOT valid. This Certificate is only valid when generated online by accessing its URL or through the following QR CODE:</p>
            <div className="qrcode-container">
                <QrCode data={ window.location.href } width={ QR_CODE_WIDTH }/>
            </div>
        </div>
    } else if (loc.data.locType === 'Collection' && type === "TokenGated") {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate is delivered for a <strong>COLLECTION ITEM</strong> and
                its related <strong>COLLECTION</strong>. Thus, the collection item identified below benefits from the
                scope of this LOC.</p>
            <p>This Certificate constitutes proof that a Logion Legal Officer, owner of that LOC and mentioned on this
                document, executed a verification process according to his/her professional standards at the requester
                demand with regards to data and document(s) listed below.</p>
            <p>All timestamps are displayed using Universal Time Coordinated (UTC).</p>
            <p>A PDF or print of this certificate is NOT valid. This Certificate is only valid when generated online by accessing its URL or through the following QR CODE:</p>
            <div className="qrcode-container">
                <QrCode data={ window.location.href } width={ QR_CODE_WIDTH }/>
            </div>
        </div>
    } else if (loc.data.locType === 'Collection' && type === "TokensRecord") {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate is delivered for a <strong>TOKENS RECORD</strong> and
                its related <strong>COLLECTION</strong>. Thus, the tokens record identified below benefits from the
                scope of this LOC.</p>
            <p>This Certificate constitutes proof that a Logion Legal Officer, owner of that LOC and mentioned on this
                document, executed a verification process according to his/her professional standards at the requester
                demand with regards to data and document(s) listed below.</p>
            <p>All timestamps are displayed using Universal Time Coordinated (UTC).</p>
            <p>A PDF or print of this certificate is NOT valid. This Certificate is only valid when generated online by accessing its URL or through the following QR CODE:</p>
            <div className="qrcode-container">
                <QrCode data={ window.location.href } width={ QR_CODE_WIDTH }/>
            </div>
        </div>
    } else {
        return <div className="description">
            <p>This Logion Legal Officer Case (LOC) certificate constitutes
                proof that a Logion Legal Officer, owner of that LOC and mentioned on this document,
                executed a verification process according to his/her professional standards at the
                requester demand with regards to data and document(s) listed below.</p>
            <p>All timestamps are displayed using Universal Time Coordinated (UTC).</p>
            <p>A PDF or print of this certificate is NOT valid. This Certificate is only valid when generated online by accessing its URL or through the following QR CODE:</p>
            <div className="qrcode-container">
                <QrCode data={ window.location.href } width={ QR_CODE_WIDTH }/>
            </div>
        </div>
    }
}
