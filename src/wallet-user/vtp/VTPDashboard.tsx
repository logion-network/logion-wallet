import { FullWidthPane } from "../../common/Dashboard";
import { useCommonContext } from "../../common/CommonContext";
import IconTextRow from "../../common/IconTextRow";
import Icon from "../../common/Icon";
import Frame from "../../common/Frame";
import Tabs from "../../common/Tabs";
import { useState } from "react";
import VTPOpenedLocs from "./VTPOpenedLocs";
import VTPClosedLocs from "./VTPClosedLocs";

export default function VTPDashboard() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    return (
        <FullWidthPane
            className="VTPDashboard"
            mainTitle={ "Third Party LOC Management" }
            titleIcon={ {
                icon: {
                    id: 'vtp-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <IconTextRow
                icon={ <Icon icon={ { id: 'tip' } } width="45px" /> }
                text={
                    <p>
                        You have been nominated as <strong>“Verified Third Party”</strong> by at least one Logion Legal
                        Officer.<br />
                        This means that you have the responsibility to contribute either public data and/or confidential
                        documents in Legal Officer Cases (LOC) managed by related Logion Legal Officers.<br />
                        You understand that the material you provide in such context shall
                        be <strong>authentic</strong> and <strong>accurate</strong>.<br />
                        With regard to future public data, you confirm that the submitted public data can be publicly
                        exposed, especially under GDPR regulation or any kind of data protection regulation that may
                        apply. Any kind of personal (eg: name, email, phone number, etc.) and/or confidential
                        information shall be strictly excluded from public data under your responsibility. Files will
                        not be public (their hash will).</p>

                } />
            <Frame title="Third party LOC list">
                <Tabs
                    activeKey={ locTabKey }
                    onSelect={ key => setLocTabKey(key || 'open') }
                    tabs={ [
                        {
                            key: "open",
                            title: "Open",
                            render: () => <VTPOpenedLocs/>
                        },
                        {
                            key: "closed",
                            title: "History",
                            render: () => <VTPClosedLocs/>
                        },
                    ] }
                />
            </Frame>
        </FullWidthPane>
    );
}
