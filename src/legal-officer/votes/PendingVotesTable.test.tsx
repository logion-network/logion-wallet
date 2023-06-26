import { UUID } from "@logion/node-api";
import { render } from "src/tests";
import PendingVotesTable from "./PendingVotesTable";
import { setVotes } from "../__mocks__/LegalOfficerContextMock";
import { mockVotes } from "./Mocks";

jest.mock("../LegalOfficerContext");

describe("PendingVotesTable", () => {

    it("renders", () => {
        const votes = mockVotes([
            {
                voteId: "1",
                createdOn: "",
                locId: new UUID("8691b921-a01d-4f18-a35a-247038b2d7c9"),
                status: "PENDING",
                ballots: {}
            },
            {
                voteId: "2",
                createdOn: "",
                locId: new UUID("c2967074-fffa-4f7a-af87-1dd2d6b61c20"),
                status: "APPROVED",
                ballots: {}
            },
        ]);
        setVotes(votes);
        const result = render(<PendingVotesTable/>);
        expect(result).toMatchSnapshot();
    });
});
