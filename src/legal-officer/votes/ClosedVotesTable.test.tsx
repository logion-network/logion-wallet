import { UUID } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "src/common/TestData";
import { render } from "src/tests";
import { Vote } from "../client";
import ClosedVotesTable from "./ClosedVotesTable";

jest.mock("../LegalOfficerContext");

describe("ClosedVotesTable", () => {

    it("renders", () => {
        const votes: Vote[] = [
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
                ballots: {
                    [DEFAULT_LEGAL_OFFICER]: "Yes",
                    [ANOTHER_LEGAL_OFFICER]: "Yes",
                }
            }
        ];
        const result = render(<ClosedVotesTable votes={votes}/>);
        expect(result).toMatchSnapshot();
    });
});
