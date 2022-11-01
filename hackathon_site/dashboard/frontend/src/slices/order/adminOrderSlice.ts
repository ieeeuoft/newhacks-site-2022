import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { APIListResponse, HardwareFilters, Order, OrderFilters } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface adminOrderExtraState {
    isLoading: boolean;
    error: null | string;
    filters: OrderFilters;
}

const extraState: adminOrderExtraState = {
    isLoading: false,
    error: null,
    filters: {} as OrderFilters,
};

const adminOrderAdapter = createEntityAdapter<Order>();

export const adminOrderReducerName = "adminOrder";
export const initialState = adminOrderAdapter.getInitialState(extraState);
export type AdminOrderState = typeof initialState;

interface RejectValue {
    status: number;
    message: any;
}

export const getOrdersWithFilters = createAsyncThunk<
    APIListResponse<Order>,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${adminOrderReducerName}/getAdminTeamOrders`,
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const filters = adminOrderFiltersSelector(getState());
            const response = await get<APIListResponse<Order>>(
                "/api/hardware/orders/",
                filters
            );
            console.log(response.data);
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: e.response.message,
                    options: {
                        variant: "error",
                    },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.message ?? e.response.data,
            });
        }
    }
);

const adminOrderSlice = createSlice({
    name: adminOrderReducerName,
    initialState,
    reducers: {
        setFilters: (
            state: AdminOrderState,
            { payload }: PayloadAction<OrderFilters>
        ) => {
            const { status, ordering } = {
                ...state.filters,
                ...payload,
            };

            // Remove values that are empty or falsy
            state.filters = {
                ...(status && { status }),
                ...(ordering && { ordering }),
            };
        },

        clearFilters: (state: AdminOrderState, { payload }: PayloadAction) => {
            state.filters = {};
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getOrdersWithFilters.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getOrdersWithFilters.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            // const { pendingOrders, checkedOutOrders } = teamOrderListSerialization(
            //     payload.results
            // );
            adminOrderAdapter.setAll(state, payload.results);
        });
        builder.addCase(getOrdersWithFilters.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload?.message ?? "There was a problem in retrieving all the orders";
        });
    },
});

export const { actions, reducer } = adminOrderSlice;
export default reducer;

// Selectors go here
export const adminOrderSliceSelector = (state: RootState) =>
    state[adminOrderReducerName];

export const adminOrderSelectors = adminOrderAdapter.getSelectors(
    adminOrderSliceSelector
);

export const isLoadingSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.isLoading
);

export const errorSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.error
);

export const adminOrderFiltersSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.filters
);

export const { setFilters, clearFilters } = actions;
