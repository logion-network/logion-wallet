import { render } from "src/tests";
import CoinName from "./CoinName";

describe("CoinName", () => {

    it("renders DOT", () => expectMatchSnapshot("dot"));
    it("renders LGNT", () => expectMatchSnapshot("lgnt"));
});

function expectMatchSnapshot(coindId: string) {
    const element = render(<CoinName coinId={ coindId } />);
    expect(element).toMatchSnapshot();
}
