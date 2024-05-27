import React from "react";
import "./AreaAssignment_Gateway.css";
import { AreaAssignmentTable } from "../../../../components/AreaAssignment/AreaAssignmentTable/AreaAssignmentTable";
import { AreaAssingmentForm } from "../../../../components/AreaAssignment/AreaAssingmentForm/AreaAssingmentForm";
import { AreaAssigmentProvider } from "../../../../Context/AreaAssigmentProvider";


export const AreaAssignment_Gateway = () => {
  return (
    <AreaAssigmentProvider>
      <div className="flex-2">
        <AreaAssingmentForm />
        <AreaAssignmentTable />
      </div>
    </AreaAssigmentProvider>
  );
};
