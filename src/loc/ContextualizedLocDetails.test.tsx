import { UUID } from "@logion/node-api";

import { shallowRender } from "../tests";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from 'src/__mocks__/LogionMock';
import ContextualizedLocDetails from "./ContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { setLocRequest, setLocId } from "./__mocks__/LocContextMock";

jest.mock('../common/CommonContext');
jest.mock('./LocContext');
jest.mock('react-router');
jest.mock('../logion-chain');
jest.mock("../legal-officer/LegalOfficerContext");

describe("ContextualizedLocDetails", () => {

    it("renders empty", () => {
        const tree = shallowRender(<ContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    });

    it("renders", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = shallowRender(<ContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    })
})
