import { render } from "../tests";
import UserInfo from "./UserInfo";

test("renders", () => {
    const tree = render(<UserInfo
            address="ABC123"
            userIdentity={{
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@logion.network",
                phoneNumber: "+1234",
            }}
            postalAddress={{
                line1: "Place de le République Française, 10",
                line2: "boite 15",
                postalCode: "4000",
                city: "Liège",
                country: "Belgium",
            }}/>);
    expect(tree).toMatchSnapshot();
});
