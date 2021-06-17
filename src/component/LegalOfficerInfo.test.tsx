import {render} from "../tests";
import LegalOfficerInfo from "./LegalOfficerInfo";
import {DEFAULT_LEGAL_OFFICER} from "../legal-officer/Types";

test("renders", () => {
    const tree = render(<LegalOfficerInfo
        legalOfficer={{
            name: "Patrick",
            address: DEFAULT_LEGAL_OFFICER,
            details: "Modero Bruxelles\nCentral administration \nNijverheidslaan 1\nB - 1853 Grimbergen (Strombeek-Bever)\nBelgium"
        }}/>);
    expect(tree).toMatchSnapshot();
});

