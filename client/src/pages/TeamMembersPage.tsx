import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Shield,
  Calendar,
  Activity,
  Crown,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Send,
  UserCheck,
  UserX,
  Settings,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import InviteMemberModal from "../components/team/InviteMemberModal";
import MessageMemberModal from "../components/team/MessageMemberModal";
import EditMemberModal from "../components/team/EditMemberModal";
import InvitationsPanel from "../components/team/InvitationsPanel";
import { boardsAPI, authAPI } from "../lib/api";
import { useCurrentUser } from "../lib/auth";
import { useNotificationStore } from "../stores/useNotificationStore";
import { generateNotification } from "../hooks/useNotifications";
import { toast } from "sonner";
import { cn } from "../utils/cn";

export default function TeamMembersPage() {
  const { dbUser } = useCurrentUser();
  const { addNotification } = useNotificationStore();
  const [boards, setBoards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvitationsPanel, setShowInvitationsPanel] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);

  useEffect(() => {
    loadTeamData();
  }, [dbUser]);

  const loadTeamData = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      const response = await boardsAPI.getBoards(dbUser.id);
      const boardsData = response.data.boards.map((board: any) => ({
        ...board,
        isAdmin:
          board.owner?.id === dbUser.id ||
          board.members.some(
            (m: any) => m.user.id === dbUser.id && m.role === "ADMIN"
          ),
        members: [
          ...(board.owner
            ? [{ ...board.owner, role: "OWNER", createdAt: board.createdAt }]
            : []),
          ...(board.members || []).map((m: any) => ({
            ...m.user,
            role: m.role,
            createdAt: m.createdAt || board.createdAt,
          })),
        ].map((member: any) => ({
          ...member,
          status: "active",
          lastActive: new Date().toISOString(),
          tasksAssigned:
            board.lists?.flatMap(
              (list: any) =>
                list.tasks?.filter((task: any) =>
                  task.assignees?.some(
                    (assignee: any) => assignee.user.id === member.id
                  )
                ) || []
            ).length || 0,
          tasksCompleted:
            board.lists?.flatMap(
              (list: any) =>
                list.tasks?.filter((task: any) =>
                  task.assignees?.some(
                    (assignee: any) =>
                      assignee.user.id === member.id && task.completed
                  )
                ) || []
            ).length || 0,
        })),
      }));
      setBoards(boardsData);

      setPendingInvitations([
        {
          id: "1",
          email: "newuser@example.com",
          role: "EDITOR",
          boardTitle: "Product Development",
          invitedBy: dbUser.name,
          invitedAt: new Date().toISOString(),
          status: "pending",
        },
      ]);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (inviteData: any) => {
    try {
      if (dbUser) {
        addNotification({
          type: "board_invite",
          title: "Board Invitation",
          message: `You've been invited to join "${inviteData.boardTitle}"`,
          userId: inviteData.userId,
          boardId: inviteData.boardId,
          triggeredBy: dbUser.id,
          triggeredByName: dbUser.name,
          data: inviteData,
          read: false,
        });
      }

      setPendingInvitations((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...inviteData,
          invitedBy: dbUser?.name,
          invitedAt: new Date().toISOString(),
          status: "pending",
        },
      ]);

      setShowInviteModal(false);
      toast.success(`Invitation sent to ${inviteData.email}`);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    }
  };

  const handleMessageMember = async (messageData: any) => {
    try {
      if (dbUser && selectedMember) {
        addNotification({
          type: "mention",
          title: "New Message",
          message: `${
            dbUser.name
          } sent you a message: "${messageData.message.substring(0, 50)}${
            messageData.message.length > 50 ? "..." : ""
          }"`,
          userId: selectedMember.id,
          triggeredBy: dbUser.id,
          triggeredByName: dbUser.name,
          data: { ...messageData, recipientName: selectedMember.name },
          read: false,
        });
      }

      setShowMessageModal(false);
      setSelectedMember(null);
      toast.success(`Message sent to ${selectedMember?.name}`);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleEditMember = async (memberData: any) => {
    try {
      const board = boards.find((b) => b.id === selectedBoardId);
      if (board) {
        setBoards((prev) =>
          prev.map((b) =>
            b.id === selectedBoardId
              ? {
                  ...b,
                  members: b.members.map((m) =>
                    m.id === selectedMember.id ? { ...m, ...memberData } : m
                  ),
                }
              : b
          )
        );
      }
      console.log(memberData, selectedMember, selectedBoardId);

      await boardsAPI.updateMemberRole(
        selectedBoardId,
        selectedMember.id,
        memberData.role
      );

      setShowEditModal(false);
      setSelectedMember(null);
      setSelectedBoardId(null);
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    }
  };

  const handleRemoveMember = async (member: any, boardId: string) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${member.name} from this board? `
    );

    if (!confirmRemove) return;

    try {
      const board = boards.find((b) => b.id === boardId);
      if (board && board.isAdmin) {
        setBoards((prev) =>
          prev.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  members: b.members.filter((m) => m.id !== member.id),
                }
              : b
          )
        );
        console.log(boardId, member.id, member);

        await boardsAPI.removeMember(boardId, member.id);
        toast.success(`${member.name} removed from board`);
      } else {
        toast.error(
          "You do not have permission to remove members from this board"
        );
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    setPendingInvitations((prev) =>
      prev.filter((inv) => inv.id !== invitationId)
    );
    toast.success("Invitation cancelled");
  };

  const handleResendInvitation = (invitation: any) => {
    setPendingInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitation.id
          ? { ...inv, invitedAt: new Date().toISOString() }
          : inv
      )
    );
    toast.success(`Invitation resent to ${invitation.email}`);
  };

  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.members.some(
        (member: any) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRole =
      filterRole === "all" ||
      board.members.some((member: any) => member.role === filterRole);
    const matchesStatus =
      filterStatus === "all" ||
      board.members.some((member: any) => member.status === filterStatus);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedBoards = [...filteredBoards].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "activity":
        return (
          b.members.reduce(
            (max, m) => Math.max(max, new Date(m.lastActive).getTime()),
            0
          ) -
          a.members.reduce(
            (max, m) => Math.max(max, new Date(m.lastActive).getTime()),
            0
          )
        );
      default:
        return 0;
    }
  });
  console.log(sortedBoards);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "EDITOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown size={14} />;
      case "ADMIN":
        return <Shield size={14} />;
      case "EDITOR":
        return <Edit size={14} />;
      case "VIEWER":
        return <Eye size={14} />;
      default:
        return <Users size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) === 1 ? "" : "s"
      } ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${
      Math.floor(diffInMinutes / 1440) === 1 ? "" : "s"
    } ago`;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your team and collaborate across{" "}
            {boards.length > 0
              ? `${boards.length} board${boards.length === 1 ? "" : "s"}`
              : "all"}{" "}
          </p>
        </div>
        {/* <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowInvitationsPanel(true)}
            icon={<UserCheck size={18} />}
          >
            Messages ({pendingInvitations.length})
          </Button>
          <Button
            onClick={() => setShowInviteModal(true)}
            icon={<UserPlus size={18} />}
          >
            Invite Member
          </Button>
        </div> */}
      </div>

      {boards.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {sortedBoards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <details className="w-full">
                  <summary className="cursor-pointer font-semibold text-lg text-gray-900 dark:text-white p-6">
                    {board.title}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        board.isAdmin
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      )}
                    >
                      {board.isAdmin ? <Shield size={12} /> : <Eye size={12} />}
                      {board.isAdmin ? "Admin" : "View Only"}
                    </span>
                  </summary>
                  <CardContent className="p-6 space-y-4">
                    {board.members.map((member: any, memberIndex: number) => (
                      <div
                        key={member.id}
                        className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Member info */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                  {member.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {member.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        {/* Role + Actions */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                              getRoleColor(member.role)
                            )}
                          >
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>

                          {member.role !== "OWNER" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                onClick={() => {
                                  if (board.isAdmin) {
                                    setSelectedMember(member);
                                    setSelectedBoardId(board.id);
                                    setShowEditModal(true);
                                  } else {
                                    toast.error(
                                      "You do not have permission to edit members"
                                    );
                                  }
                                }}
                                disabled={!board.isAdmin}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  if (board.isAdmin) {
                                    handleRemoveMember(member, board.id);
                                  } else {
                                    toast.error(
                                      "You do not have permission to remove members"
                                    );
                                  }
                                }}
                                disabled={!board.isAdmin}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </details>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No boards or members found" : "No boards yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? `No boards or members match "${searchQuery}". Try a different search term.`
                : "Create or join boards to start managing team members."}
            </p>
            <Button
              onClick={() => setShowInviteModal(true)}
              icon={<UserPlus size={16} />}
            >
              Invite Team Member
            </Button>
          </CardContent>
        </Card>
      )}

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={handleInviteMember}
        existingMembers={boards.flatMap((b) => b.members)}
      />

      <MessageMemberModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedMember(null);
          setSelectedBoardId(null);
        }}
        member={selectedMember}
        onMessageSent={handleMessageMember}
      />

      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
          setSelectedBoardId(null);
        }}
        member={selectedMember}
        onMemberUpdated={handleEditMember}
      />

      <InvitationsPanel
        isOpen={showInvitationsPanel}
        onClose={() => setShowInvitationsPanel(false)}
        invitations={pendingInvitations}
        onCancelInvitation={handleCancelInvitation}
        onResendInvitation={handleResendInvitation}
      />
    </div>
  );
}
