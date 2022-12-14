import store, { makeStore, RootState } from "slices/store";
import {
    teamAdminReducerName,
    initialState,
    teamAdminSliceSelector,
    isLoadingSelector,
    teamAdminSelectors,
    NUM_TEAM_LIMIT,
    getTeamsWithSearchThunk,
} from "slices/event/teamAdminSlice";
import { makeMockApiListResponse, waitFor } from "testing/utils";
import { mockTeam, mockTeams } from "testing/mockData";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

const mockState: RootState = {
    ...store.getState(),
    [teamAdminReducerName]: initialState,
};

describe("Selectors", () => {
    test("teamAdminSliceSelector returns teamAdminSlice", () => {
        expect(teamAdminSliceSelector(mockState)).toEqual(
            mockState[teamAdminReducerName]
        );
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamAdminReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamAdminReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };

        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("getTeamsWithSearchThunk thunk", () => {
    const apiFailureResponse = {
        response: {
            status: 500,
            message: "Something went wrong",
        },
    };

    it("Get all Teams with Search Query", async () => {
        const mockResponse = makeMockApiListResponse(mockTeams);
        mockedGet.mockResolvedValueOnce(mockResponse);
        const search = mockTeam.team_code;

        const store = makeStore();
        await store.dispatch(getTeamsWithSearchThunk(search));

        await waitFor(() => {
            expect(teamAdminSelectors.selectAll(store.getState())).toEqual(mockTeams);
        });
    });

    it("Updates the store on API success", async () => {
        const mockResponse = makeMockApiListResponse(mockTeams);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getTeamsWithSearchThunk());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/", {
                limit: NUM_TEAM_LIMIT,
            });
            expect(teamAdminSelectors.selectAll(store.getState())).toEqual(mockTeams);
        });
    });

    it("Dispatches a snackbar on API failure", async () => {
        mockedGet.mockRejectedValueOnce(apiFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getTeamsWithSearchThunk());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to fetch team data: Error 500",
                options: { variant: "error" },
            })
        );
    });
});
