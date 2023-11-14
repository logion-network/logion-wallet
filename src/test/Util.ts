import { UUID, LogionNodeApiClass, LegalOfficerCase } from "@logion/node-api";
import { screen } from "@testing-library/dom";
import { It, Mock } from "moq.ts";

export function ItIsUuid(expected: UUID): UUID {
    return It.Is<UUID>(uuid => uuid.toString() === expected.toString());
}

export function ItIsDecimalUuid(expected: string): UUID {
    return It.Is<UUID>(uuid => uuid.toDecimalString() === expected);
}

export function setupQueriesGetLegalOfficerCase(api: Mock<LogionNodeApiClass>, locId: UUID, loc: LegalOfficerCase) {
    api.setup(instance => instance.queries.getLegalOfficerCase)
        .returns(uuid => Promise.resolve(uuid.toString() === locId.toString() ? Promise.resolve(loc) : undefined));
}

export function expectSubmitting() {
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
}
