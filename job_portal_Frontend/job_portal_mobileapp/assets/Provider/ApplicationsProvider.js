import React, { useReducer } from "react";
import ApplicationsContext from "../../components/Job/ApplicationsContext";
import ApplicationsReducer from "../../reducers/ApplicationsReducer";

const ApplicationsProvider = ({ children }) => {
  const [applications, dispatchApplications] = useReducer(ApplicationsReducer, []);

  return (
    <ApplicationsContext.Provider value={[applications, dispatchApplications]}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export default ApplicationsProvider;
