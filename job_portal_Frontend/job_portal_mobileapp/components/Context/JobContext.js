import React, { createContext, useReducer } from "react";
import { jobReducer, initialJobState } from "../../reducers/jobReducer";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialJobState);

  return (
    <JobContext.Provider value={{ jobState: state, jobDispatch: dispatch }}>
      {children}
    </JobContext.Provider>
  );
};
