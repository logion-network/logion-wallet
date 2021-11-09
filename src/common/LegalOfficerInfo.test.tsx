import {shallowRender} from "../tests";
import LegalOfficerInfo from "./LegalOfficerInfo";
import { DEFAULT_LEGAL_OFFICER } from "./TestData";

test("renders", () => {
    const tree = shallowRender(<LegalOfficerInfo
        legalOfficer={{
            name: "Patrick",
            address: DEFAULT_LEGAL_OFFICER,
            details: "Modero Bruxelles\nCentral administration \nNijverheidslaan 1\nB - 1853 Grimbergen (Strombeek-Bever)\nBelgium",
            email: "patrick@logion.network",
        }}/>);
    expect(tree).toMatchSnapshot();
});

