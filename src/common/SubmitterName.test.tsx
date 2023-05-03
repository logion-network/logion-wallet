import { shallowRender } from "../tests";
import SubmitterName from "./SubmitterName";
import { DEFAULT_LEGAL_OFFICER, DEFAULT_IDENTITY } from "./TestData";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';
import { LocData } from "@logion/client";

jest.mock('../logion-chain');

describe("SubmitterName", () => {

    const REQUESTER = mockValidPolkadotAccountId("5H17oaxYsRpV18tYjMMbozN84JAVgG6MH5pNWjisGYDtc9WR");
    const VTP = "5DtGNqi7yp5TqRcPckYVZh5XqdaSKE9rsDur5xur4tkmBAhB";
    const loc = {
        ownerAddress: DEFAULT_LEGAL_OFFICER.address,
        requesterAddress: REQUESTER,
        userIdentity: DEFAULT_IDENTITY,
        issuers: [ {
            address: VTP,
            firstName: "Scott",
            lastName: "Tiger",
        } ]
    } as unknown as LocData;

    it("renders when submitter is Legal Officer", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ DEFAULT_LEGAL_OFFICER.address } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is Requester", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ REQUESTER.address } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is VTP", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ VTP } />);
        expect(tree).toMatchSnapshot()
    })
})
