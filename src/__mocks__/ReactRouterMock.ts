let params = {};

export let useParams = () => params;

export function setParams(mock: object) {
    params = mock;
}

export let history: any = {
    push: jest.fn(),
};

export let useHistory = () => history;

export function setHistory(mock: object) {
    history = mock;
}

export let location: any = {
    pathname: "/path",
};

export let useLocation = () => location;

export function setLocation(mock: object) {
    location = mock;
}
