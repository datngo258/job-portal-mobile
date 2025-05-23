const ApplicationsReducer = (state, action) => {
  switch (action.type) {
    case "set_applications":
      return action.payload;
    case "add_application":
      return [action.payload, ...state];
    case "delete_application":
      return state.filter((app) => app.id !== action.payload);
    case "update_application":
      return state.map((app) =>
        app.id === action.payload.id ? action.payload : app
      );
    default:
      return state;
  }
};

export default ApplicationsReducer;
