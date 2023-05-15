import { shallowRender } from "../tests";
import { setParams } from "../__mocks__/ReactRouterMock";
import LocDetails, { UserLocDetails } from "./LocDetails";

jest.mock("react-router");

describe("LocDetails", () => {

    it("renders for LO", () => {
        setParams({"locId": "aed4c6e4-979e-48ad-be6e-4bd39fb94762"})
        const result = shallowRender(<LocDetails
            backPath="/"
            detailsPath={() => "/details"}
        />);
        expect(result).toMatchSnapshot();
    })
})

describe("LocDetails", () => {

    it("renders for user as Requester", () => {
        setParams({"locId": "aed4c6e4-979e-48ad-be6e-4bd39fb94762"})
        const result = shallowRender(<UserLocDetails
            backPath="/"
            detailsPath={() => "/details"}
            contributionMode='Requester'
        />);
        expect(result).toMatchSnapshot();
    })

    it("renders for user as verified issuer", () => {
        setParams({"locId": "aed4c6e4-979e-48ad-be6e-4bd39fb94762"})
        const result = shallowRender(<UserLocDetails
            backPath="/"
            detailsPath={() => "/details"}
            contributionMode='Issuer'
        />);
        expect(result).toMatchSnapshot();
    })
})
