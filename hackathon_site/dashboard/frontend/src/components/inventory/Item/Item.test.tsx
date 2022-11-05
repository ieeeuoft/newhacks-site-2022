import React from "react";
import Item from "components/inventory/Item/Item";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { userReducerName } from "slices/users/userSlice";
import { mockAdminUser, mockUser } from "testing/mockData";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

describe("InventoryItem", () => {
    const image =
        "hackathon_site/dashboard/frontend/src/assets/images/testImages/IO6e5a6.jpg";
    const title = "Some Hardware";
    const total = 6;
    let currentStock = 4;
    const mockStore = configureStore([thunk]);

    test("Has stock, admin side", () => {
        const mockAdminState = {
            [userReducerName]: {
                userData: {
                    user: mockAdminUser,
                },
            },
        };
        const store = mockStore(mockAdminState);

        const { getByText, getByAltText } = render(
            <Provider store={store}>
                <Item
                    image={image}
                    title={title}
                    total={total}
                    currentStock={currentStock}
                />
            </Provider>
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(`${currentStock} OF ${total} IN STOCK`)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Has stock, participant side", () => {
        const mockParticipantState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockParticipantState);

        const { getByText, getByAltText } = render(
            <Provider store={store}>
                <Item
                    image={image}
                    title={title}
                    total={total}
                    currentStock={currentStock}
                />
            </Provider>
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(`${currentStock} IN STOCK`)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Out of Stock", () => {
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };
        const store = mockStore(mockState);

        let currentStock = 0;
        const { getByText, getByAltText } = render(
            <Provider store={store}>
                <Item
                    image={image}
                    title={title}
                    total={total}
                    currentStock={currentStock}
                />
            </Provider>
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText("OUT OF STOCK")).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });
});
