import React from "react";
import { useBoardPermissions } from "../hooks/useBoardPermissions";

interface PermissionTestProps {
  boardId: string;
}

export const PermissionTest: React.FC<PermissionTestProps> = ({ boardId }) => {
  const permissions = useBoardPermissions(boardId);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Permission Test</h3>
      <div className="space-y-2 text-sm">
        <div>
          Current Role:{" "}
          <span className="font-medium">{permissions.getUserRole()}</span>
        </div>
        <div>
          Is Owner:{" "}
          <span className="font-medium">
            {permissions.isOwner() ? "Yes" : "No"}
          </span>
        </div>
        <div>
          Is Admin:{" "}
          <span className="font-medium">
            {permissions.isAdmin() ? "Yes" : "No"}
          </span>
        </div>
        <div>
          Is Member:{" "}
          <span className="font-medium">
            {permissions.isMember() ? "Yes" : "No"}
          </span>
        </div>
        <div>
          Can Manage Members:{" "}
          <span className="font-medium">
            {permissions.canManageMembers ? "Yes" : "No"}
          </span>
        </div>
        <div>
          Can Delete Board:{" "}
          <span className="font-medium">
            {permissions.canDeleteBoard ? "Yes" : "No"}
          </span>
        </div>
        <div>
          Can Send Invitations:{" "}
          <span className="font-medium">
            {permissions.canSendInvitations ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
};
