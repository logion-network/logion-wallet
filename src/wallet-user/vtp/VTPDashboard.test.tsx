import { shallowRender } from "../../tests";
import VTPDashboard from "./VTPDashboard";

jest.mock('../../common/CommonContext');

describe("VTPDashboard", () =>  {

    it("renders", () => {
        const tree = shallowRender(<VTPDashboard/>);
        expect(tree).toMatchSnapshot();
    })
})
