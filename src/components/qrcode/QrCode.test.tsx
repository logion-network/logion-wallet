import { render, screen, waitFor } from "@testing-library/react";
import QrCode from "./QrCode";

describe("QrCode", () => {

    it("renders expected image", async () => {
        render(<QrCode data="test" width={ expectedWidth }/>);

        await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("src", expectedDataUrl));
        const image = screen.getByRole("img");
        expect(image).toHaveAttribute("width", expectedWidth);
    });
});

const expectedDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALPSURBVO3BQa7jSAwFwUxC97/yGy+5KkCQ7OlPMMJ8sMYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijXKxUMqv5SEO1S6JNyh8ktJeKJYoxRrlGKNcvGyJLxJ5USlS8IdKl0STpLwJpU3FWuUYo1SrFEuvkzljiTckYSTJHQqXRKeULkjCd9UrFGKNUqxRrkYRuUkCZMVa5RijVKsUS7+OJWTJHQqJ0n4y4o1SrFGKdYoF1+WhG9KQqdyRxKeSMK/pFijFGuUYo1y8TKVX1LpktCpdEnoVLoknKj8y4o1SrFGKdYo5oNBVE6SMFmxRinWKMUa5eIhlS4JnUqXhE6lS0Kn0iXhJAmdyolKl4Q7VLoknKh0SXhTsUYp1ijFGsV88EUqTyShU+mScKJykoROpUtCp9Il4Q6VkyQ8UaxRijVKsUa5eEilS8JJEu5QOVH5JpU7VP5PxRqlWKMUaxTzwQ+p3JGEE5VvSkKncpKEE5UuCW8q1ijFGqVYo5gPHlDpktCpdEnoVLokdCpdEk5U7khCp3JHEjqVLgmdykkSnijWKMUapVijmA/+MJUuCW9S6ZJwotIl4USlS8ITxRqlWKMUa5SLh1R+KQldEjqVLgknKl0SuiScqNyh8k3FGqVYoxRrlIuXJeFNKnckoVPpktAl4USlS0KXhCeS8KZijVKsUYo1ysWXqdyRhDtUnlDpknCHykkSTlS6JDxRrFGKNUqxRrn445JwotKpdEnoVLokdCpdEp5IwpuKNUqxRinWKBd/nMo3qTyh0iWhU+mS8ESxRinWKMUa5eLLkvBNSThROVE5SUKn0qmcJKFT6ZLwpmKNUqxRijXKxctUfknliSR0Kp3KSRJOVE5UuiQ8UaxRijVKsUYxH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8h+dsx746sV0YgAAAABJRU5ErkJggg==";
const expectedWidth = "200px";
