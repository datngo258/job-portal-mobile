export const initialJobState = {
  jobs: [],
};

export const jobReducer = (state, action) => {
  switch (action.type) {
    case "SET_JOBS":
      return { ...state, jobs: action.payload };
    case "ADD_JOB":
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case "CLEAR_JOBS":
      return { ...state, jobs: [] };
    default:
      return state;
  }
};
