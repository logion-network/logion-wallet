import { shallowRender } from "../tests";
import SubmitterName from "./SubmitterName";
import { DEFAULT_LEGAL_OFFICER, DEFAULT_IDENTITY } from "./TestData";
import { LocData } from "@logion/client";
import { LocItem } from "../loc/types";

jest.mock('../logion-chain');

describe("SubmitterName", () => {

    const REQUESTER = "5H17oaxYsRpV18tYjMMbozN84JAVgG6MH5pNWjisGYDtc9WR";
    const VTP = "5DtGNqi7yp5TqRcPckYVZh5XqdaSKE9rsDur5xur4tkmBAhB";
    const loc = {
        ownerAddress: DEFAULT_LEGAL_OFFICER,
        requesterAddress: REQUESTER,
        userIdentity: DEFAULT_IDENTITY,
        issuers: [ {
            address: VTP,
            firstName: "Scott",
            lastName: "Tiger",
        } ]
    } as LocData;

    it("renders when submitter is Legal Officer", () => {

        const locItem = { submitter: DEFAULT_LEGAL_OFFICER } as LocItem;
        const tree = shallowRender(<SubmitterName loc={ loc } locItem={ locItem } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is Requester", () => {
        const locItem = { submitter: REQUESTER } as LocItem;
        const tree = shallowRender(<SubmitterName loc={ loc } locItem={ locItem } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is VTP", () => {
        const locItem = { submitter: VTP } as LocItem;
        const tree = shallowRender(<SubmitterName loc={ loc } locItem={ locItem } />);
        expect(tree).toMatchSnapshot()
    })

})
