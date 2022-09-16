import { format } from "./InlineDateTime";

describe("format", () => {

    it("formats date time as expected", () => {
        const { date, time } = format("2021-07-27T11:34:00.000");
        expect(date).toBe("27/07/2021");
        expect(time).toBe("11:34");
    });
});
