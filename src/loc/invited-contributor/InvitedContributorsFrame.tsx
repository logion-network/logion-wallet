import { POLKADOT } from "src/common/ColorTheme";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import { useLocContext } from "../LocContext";
import { InvitedContributors } from "./InvitedContributors";

export default function InvitedContributorsFrame() {
    const { viewer, colorTheme } = useCommonContext();
    const { locState } = useLocContext();

    if (locState === null) {
        return null
    }

    return (
        <Frame
            titleIcon={ {
                icon: {
                    id: 'issuer-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            title="Invited contributors"
            border={ `2px solid ${ POLKADOT }` }
        >
            <p>The Polkadot accounts listed below may contribute tokens records to the present collection.</p>
            <InvitedContributors collection={ locState.data() } viewer={ viewer } />
        </Frame>
    );
}
