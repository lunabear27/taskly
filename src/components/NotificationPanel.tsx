import { useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Bell,
  X,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  User,
  Shield,
  Crown,
} from "lucide-react";
import { useNotificationStore } from "../store/notifications";
import { useInvitationStore } from "../store/invitations";
import { useNavigate } from "react-router-dom";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({
  isOpen,
  onClose,
}: NotificationPanelProps) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const { acceptInvitation, rejectInvitation, invitations } =
    useInvitationStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Also fetch invitations to get the latest status
      const invitationStore = useInvitationStore.getState();
      invitationStore.fetchInvitations();
    }
  }, [isOpen, fetchNotifications]);

  const handleAcceptInvitation = async (invitationId: string) => {
    console.log("🎯 Accepting invitation with ID:", invitationId);
    try {
      await acceptInvitation(invitationId);
      // Mark notification as read
      const notification = notifications.find(
        (n) => n.type === "invitation" && n.data?.invitation_id === invitationId
      );
      if (notification) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      // Mark notification as read
      const notification = notifications.find(
        (n) => n.type === "invitation" && n.data?.invitation_id === invitationId
      );
      if (notification) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markAsRead(notification.id);

    // Handle different notification types
    switch (notification.type) {
      case "invitation":
        // Only navigate to board if invitation is still pending
        if (notification.data?.board_id && notification.data?.invitation_id) {
          const status = getInvitationStatus(notification.data.invitation_id);
          if (status === "pending") {
            navigate(`/board/${notification.data.board_id}`);
          }
        }
        break;
      case "invitation_accepted":
      case "invitation_rejected":
        // Navigate to board for accepted/rejected notifications
        if (notification.data?.board_id) {
          navigate(`/board/${notification.data.board_id}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invitation":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "invitation_accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invitation_rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInvitationStatus = (invitationId: string) => {
    const invitation = invitations.find((inv) => inv.id === invitationId);
    return invitation?.status || "pending";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">
                Loading notifications...
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">
                No notifications yet
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read
                      ? "bg-card"
                      : "bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/5 dark:border-blue-500/10"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.type === "invitation" &&
                            notification.data?.role && (
                              <div className="flex items-center gap-1 mt-2">
                                {getRoleIcon(notification.data.role)}
                                <span className="text-xs text-muted-foreground">
                                  Role: {notification.data.role}
                                </span>
                              </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Action buttons for invitations */}
                      {notification.type === "invitation" &&
                        notification.data?.invitation_id && (
                          <div className="flex items-center gap-2 mt-3">
                            {/* Show status badge */}
                            <Badge variant="secondary" className="text-xs">
                              {(() => {
                                const status = getInvitationStatus(
                                  notification.data.invitation_id
                                );
                                if (status === "pending") {
                                  return (
                                    <>
                                      <Clock className="h-3 w-3 mr-1" />
                                      pending
                                    </>
                                  );
                                } else if (status === "accepted") {
                                  return (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      accepted
                                    </>
                                  );
                                } else if (status === "rejected") {
                                  return (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                      rejected
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <Clock className="h-3 w-3 mr-1" />
                                      {status}
                                    </>
                                  );
                                }
                              })()}
                            </Badge>

                            {/* Only show action buttons for pending invitations */}
                            {getInvitationStatus(
                              notification.data.invitation_id
                            ) === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptInvitation(
                                      notification.data.invitation_id
                                    );
                                  }}
                                  className="h-7 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectInvitation(
                                      notification.data.invitation_id
                                    );
                                  }}
                                  className="h-7 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
