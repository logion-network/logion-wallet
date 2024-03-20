import { shallowRender } from "src/tests";
import LocsDashboard from "./LocsDashboard";
import { Locs } from "../Locs";

describe("LocsDashboard", () => {

    it("renders loading", () => {
        const element = shallowRender(<LocsDashboard
            actions={ null }
            iconId="loc"
            loading={ true }
            locDetailsPath={ () => "" }
            locs={ Locs.empty("User") }
            settingsPath=""
            title="Title"
        />);
        expect(element).toMatchSnapshot();
    });

    it("renders locs", () => {
        const element = shallowRender(<LocsDashboard
            actions={ null }
            iconId="loc"
            loading={ false }
            locDetailsPath={ () => "" }
            locs={ Locs.empty("User") }
            settingsPath=""
            title="Title"
        />);
        expect(element).toMatchSnapshot();
    });
});
