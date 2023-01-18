import { UUID } from "@logion/node-api";
import { render } from "src/tests";
import { Vote } from "./client";
import VotesTable from "./VotesTable";

jest.mock("./LegalOfficerContext");

describe("VotesTable", () => {

    it("renders", () => {
        const votes: Vote[] = [
            {
                voteId: "1",
                createdOn: "",
                locId: new UUID("8691b921-a01d-4f18-a35a-247038b2d7c9"),
                status: "PENDING",
                ballots: {}
            }
        ];
        const result = render(<VotesTable votes={votes}/>);
        expect(result).toMatchSnapshot();
    });
});
