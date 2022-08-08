import { shallowRender } from "../tests";
import { setParams } from "../__mocks__/ReactRouterMock";
import LocDetails from "./LocDetails";

jest.mock("react-router");

describe("LocDetails", () => {

    it("renders for LO", () => {
        setParams({"locId": "aed4c6e4-979e-48ad-be6e-4bd39fb94762"})
        const result = shallowRender(<LocDetails
            backPath="/"
            detailsPath={() => "/details"}
            viewer="LegalOfficer"
        />);
        expect(result).toMatchSnapshot();
    })

    it("renders for user", () => {
        setParams({"locId": "aed4c6e4-979e-48ad-be6e-4bd39fb94762"})
        const result = shallowRender(<LocDetails
            backPath="/"
            detailsPath={() => "/details"}
            viewer="User"
        />);
        expect(result).toMatchSnapshot();
    })
})
