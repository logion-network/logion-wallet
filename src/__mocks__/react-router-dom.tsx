export const BrowserRouter = () => <div></div>
export const Switch = () => <div></div>
export const Route = () => <div></div>
export const Link = () => <div></div>
export const Redirect = () => <div></div>

export let useParams = jest.fn();
export function setUseParams(mockFunction: any) {
    useParams = mockFunction;
}
