import { shallowRender } from "../../tests";
import IssuerDashboard from "./IssuerDashboard";

jest.mock('../../common/CommonContext');

describe("IssuerDashboard", () =>  {

    it("renders", () => {
        const tree = shallowRender(<IssuerDashboard/>);
        expect(tree).toMatchSnapshot();
    })
})
