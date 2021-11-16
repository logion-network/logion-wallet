let params = {};

export let useParams = () => params;

export function setParams(mock: object) {
    params = mock;
}

export let navigate = jest.fn();

export let useNavigate = () => navigate;

export function setNavigate(mock: any) {
    navigate = mock;
}

export let location: any = {
    pathname: "/path",
    state: {
        
    }
};

export let useLocation = () => location;

export function setLocation(mock: object) {
    location = mock;
}
