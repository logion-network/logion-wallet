import { shallowRender } from "../tests";
import SubmitterName from "./SubmitterName";
import { DEFAULT_LEGAL_OFFICER, DEFAULT_IDENTITY } from "./TestData";
import { LocData } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";

jest.mock('../logion-chain');

describe("SubmitterName", () => {

    const REQUESTER = ValidAccountId.polkadot("5H17oaxYsRpV18tYjMMbozN84JAVgG6MH5pNWjisGYDtc9WR");
    const ISSUER = ValidAccountId.polkadot("5DtGNqi7yp5TqRcPckYVZh5XqdaSKE9rsDur5xur4tkmBAhB");
    const loc = {
        ownerAccountId: DEFAULT_LEGAL_OFFICER,
        requesterAccountId: REQUESTER,
        userIdentity: DEFAULT_IDENTITY,
        issuers: [ {
            account: ISSUER,
            firstName: "Scott",
            lastName: "Tiger",
        } ]
    } as unknown as LocData;

    it("renders when submitter is Legal Officer", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ DEFAULT_LEGAL_OFFICER } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is Requester", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ REQUESTER } />);
        expect(tree).toMatchSnapshot()
    })

    it("renders when submitter is verified issuer", () => {
        const tree = shallowRender(<SubmitterName loc={ loc } submitter={ ISSUER } />);
        expect(tree).toMatchSnapshot()
    })
})
