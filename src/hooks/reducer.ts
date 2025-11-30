/** @format */

interface NavItem {
  name: string;
  url: string;
  isClicked: boolean;
}

interface Action {
  type: string;
  name: string;
}

export const reducer = (state: NavItem[], action: Action) => {
  if (action.type) {
    const updatedState = state.map((item) =>
      item.name === action.name
        ? { ...item, isClicked: true }
        : { ...item, isClicked: false }
    );
    return updatedState;
  }
  return state;
};
