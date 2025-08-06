import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { boardLogger } from "../lib/logger";

interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  user_email?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
  };
}

interface BoardMemberState {
  membersByBoard: Record<string, BoardMember[]>;
  loading: boolean;
  error: string | null;

  // Board member actions
  fetchBoardMembers: (boardId: string) => Promise<void>;
  fetchAllBoardMembers: (boardIds: string[]) => Promise<void>; // New function to fetch all members
  addBoardMember: (
    boardId: string,
    userEmail: string,
    role?: "admin" | "member"
  ) => Promise<BoardMember | null>;
  removeBoardMember: (boardId: string, userId: string) => Promise<void>;
  updateMemberRole: (
    boardId: string,
    userId: string,
    role: "owner" | "admin" | "member"
  ) => Promise<void>;
  getBoardMembers: (boardId: string) => BoardMember[];
  getBoardMembersWithCreator: (
    boardId: string,
    creatorId: string
  ) => BoardMember[]; // New function that includes creator

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBoardMemberStore = create<BoardMemberState>((set, get) => ({
  membersByBoard: {},
  loading: false,
  error: null,

  getBoardMembers: (boardId: string) => {
    return get().membersByBoard[boardId] || [];
  },

  getBoardMembersWithCreator: (boardId: string, creatorId: string) => {
    const members = get().membersByBoard[boardId] || [];

    // Check if creator is already in the members list
    const creatorInMembers = members.some(
      (member) => member.user_id === creatorId
    );

    if (creatorInMembers) {
      // If creator is in members, sort them so creator comes first
      return members.sort((a, b) => {
        if (a.user_id === creatorId) return -1;
        if (b.user_id === creatorId) return 1;
        return 0;
      });
    } else {
      // If creator is not in members, we need to add them
      // This is a fallback - ideally the creator should be in the members list
      return members;
    }
  },

  fetchAllBoardMembers: async (boardIds: string[]) => {
    const { membersByBoard } = get();

    // Check if we already have members for these boards
    const boardsWithoutMembers = boardIds.filter(
      (boardId) =>
        !membersByBoard[boardId] || membersByBoard[boardId].length === 0
    );

    if (boardsWithoutMembers.length === 0) {
      boardLogger.info("Board members already loaded, skipping fetch");
      return;
    }

    set({ loading: true, error: null });
    try {
      boardLogger.log("Fetching all board members for boards", {
        boardIds: boardsWithoutMembers,
      });

      const { data: members, error } = await supabase
        .from("board_members")
        .select("*")
        .in("board_id", boardsWithoutMembers);

      if (error) throw error;

      boardLogger.log("All board members fetch result", {
        count: members?.length || 0,
        error: error?.message,
      });

      // Process members and add profile information
      const processedMembers = await processMembersWithProfiles(members || []);

      // Group members by board
      const membersByBoardMap: Record<string, any[]> = {};
      processedMembers.forEach((member) => {
        if (!membersByBoardMap[member.board_id]) {
          membersByBoardMap[member.board_id] = [];
        }
        membersByBoardMap[member.board_id].push(member);
      });

      // Update store with new members
      set((state) => ({
        membersByBoard: {
          ...state.membersByBoard,
          ...membersByBoardMap,
        },
        loading: false,
      }));

      boardLogger.log("All board members set in store", {
        boardCount: Object.keys(membersByBoardMap).length,
      });
    } catch (error: any) {
      boardLogger.error("fetchAllBoardMembers error", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchBoardMembers: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      boardLogger.log("Fetching board members for boardId", { boardId });

      const { data: members, error } = await supabase
        .from("board_members")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      boardLogger.log("Board members fetch result", {
        count: members?.length || 0,
        error: error?.message,
      });

      if (error) throw error;

      // Get user data for each member
      const { data: currentUser } = await supabase.auth.getUser();

      // Get all user IDs from members
      const userIds = (members || [])
        .filter((member) => !member.user_id.startsWith("invited_"))
        .map((member) => member.user_id);

      // Fetch user profiles for all members
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profiles")
          .select("user_id, email, username, avatar_url")
          .in("user_id", userIds);

        if (!profilesError && profiles) {
          userProfiles = profiles;
        }

        // If we don't have user profiles, try to get basic user info from auth
        if (!profiles || profiles.length === 0) {
          boardLogger.warn("No user profiles found, will use fallback data");
        }
      }

      boardLogger.log("User profiles fetched", { count: userProfiles.length });

      const membersWithUsers = (members || []).map((member) => {
        // Check if this is an invitation placeholder
        if (member.user_id.startsWith("invited_")) {
          // Extract email from invitation ID
          const emailMatch = member.user_id.match(/invited_\d+_(.+)/);
          const email = emailMatch
            ? emailMatch[1].replace(/_/g, "@")
            : "Unknown";

          return {
            ...member,
            user: {
              id: member.user_id,
              email: email,
            },
            isInvitation: true,
          };
        }

        // Find user profile for this member
        const userProfile = userProfiles.find(
          (profile) => profile.user_id === member.user_id
        );

        // If this is the current user, use their auth info
        if (currentUser?.user?.id === member.user_id) {
          return {
            ...member,
            user: {
              id: currentUser.user.id,
              email: currentUser.user.email,
              username:
                userProfile?.username ||
                currentUser.user.email?.split("@")[0] ||
                `User ${currentUser.user.id.substring(0, 8)}`,
              avatar_url: userProfile?.avatar_url,
            },
          };
        }

        // For other users, try to get their real email from user_profiles
        // If not found, we'll need to get it from auth.users (but this requires admin access)
        let userEmail = userProfile?.email;
        let username = userProfile?.username;

        if (!userEmail) {
          // Try to get user data from auth.users (this might not work due to RLS)
          boardLogger.log("Trying to get user data for", {
            userId: member.user_id,
          });
          // For now, we'll use a placeholder but log that we need real data
          userEmail = `user.${member.user_id.substring(0, 8)}@example.com`;
          username = `User ${member.user_id.substring(0, 8)}`;
          boardLogger.warn("Could not get real email for user", {
            userId: member.user_id,
          });
        }

        if (!username) {
          username =
            userEmail.split("@")[0] || `User ${member.user_id.substring(0, 8)}`;
        }

        return {
          ...member,
          user: {
            id: member.user_id,
            email: userEmail,
            username: username,
            avatar_url: userProfile?.avatar_url,
          },
        };
      });

      const { membersByBoard } = get();
      const updatedMembersByBoard = {
        ...membersByBoard,
        [boardId]: membersWithUsers,
      };

      set({ membersByBoard: updatedMembersByBoard, loading: false });
      boardLogger.log("Board members set in store for board", {
        boardId,
        count: membersWithUsers.length,
      });
    } catch (error: any) {
      boardLogger.error("Error fetching board members", error);
      set({ error: error.message, loading: false });
    }
  },

  addBoardMember: async (
    boardId: string,
    userEmail: string,
    role: "admin" | "member" = "member"
  ) => {
    set({ loading: true, error: null });
    try {
      boardLogger.log("Adding board member", { boardId, userEmail, role });

      // If no email provided, add the current user (for backward compatibility)
      if (!userEmail.trim()) {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("User not authenticated");

        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from("board_members")
          .select("*")
          .eq("board_id", boardId)
          .eq("user_id", currentUser.user.id)
          .single();

        if (existingMember) {
          throw new Error("You are already a member of this board");
        }

        // Ensure user has a profile with real email
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.user.id)
          .single();

        if (!existingProfile) {
          // Create user profile with real email
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: currentUser.user.id,
              email: currentUser.user.email,
              username: currentUser.user.email?.split("@")[0] || "user",
            });

          if (profileError && profileError.code !== "23505") {
            boardLogger.warn("Could not create user profile", {
              error: profileError.message,
            });
          }
        }

        const { data: member, error } = await supabase
          .from("board_members")
          .insert({
            board_id: boardId,
            user_id: currentUser.user.id,
            role: role,
          })
          .select("*")
          .single();

        if (error) throw error;

        boardLogger.log("Board member added successfully", {
          memberId: member.id,
          boardId,
        });
        // Refresh the board members in the store
        await get().fetchBoardMembers(boardId);
        return member;
      }

      // For email-based invitations, first check if this email is already invited
      const cleanEmail = userEmail.trim().toLowerCase();

      // Check if this email is already invited
      const { data: existingInvitations } = await supabase
        .from("board_members")
        .select("*")
        .eq("board_id", boardId)
        .like("user_id", `invited_%${cleanEmail.replace("@", "_")}%`);

      if (existingInvitations && existingInvitations.length > 0) {
        throw new Error("This user has already been invited to this board");
      }

      // Try to find existing user by email using the database function
      const { data: userLookup, error: lookupError } = await supabase.rpc(
        "find_user_by_email",
        {
          email_address: cleanEmail,
        }
      );

      if (lookupError) {
        boardLogger.warn("Could not lookup user by email", {
          error: lookupError.message,
        });
        // Continue with invitation creation
      }

      if (userLookup) {
        // User exists - check if they're already a member
        const { data: existingMember } = await supabase
          .from("board_members")
          .select("*")
          .eq("board_id", boardId)
          .eq("user_id", userLookup)
          .single();

        if (existingMember) {
          throw new Error("This user is already a member of this board");
        }

        // Ensure user has a profile with real email
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userLookup)
          .single();

        if (!existingProfile) {
          // Create user profile with real email
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: userLookup,
              email: cleanEmail,
              username: cleanEmail.split("@")[0],
            });

          if (profileError && profileError.code !== "23505") {
            boardLogger.warn("Could not create user profile", {
              error: profileError.message,
            });
          }
        }

        // Add the existing user as a member
        const { data: member, error } = await supabase
          .from("board_members")
          .insert({
            board_id: boardId,
            user_id: userLookup,
            role: role,
          })
          .select("*")
          .single();

        if (error) throw error;

        boardLogger.log("Existing user added successfully", {
          email: cleanEmail,
        });
        await get().fetchBoardMembers(boardId);
        return member;
      } else {
        // User doesn't exist - create invitation placeholder
        const invitationId = `invited_${Date.now()}_${cleanEmail.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}`;

        const { data: member, error } = await supabase
          .from("board_members")
          .insert({
            board_id: boardId,
            user_id: invitationId,
            role: role,
          })
          .select("*")
          .single();

        if (error) throw error;

        boardLogger.log("Invitation created for new user", {
          email: cleanEmail,
        });
        await get().fetchBoardMembers(boardId);
        return member;
      }
    } catch (error: any) {
      boardLogger.error("Error adding board member", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  removeBoardMember: async (boardId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("board_members")
        .delete()
        .eq("board_id", boardId)
        .eq("user_id", userId);

      if (error) throw error;

      // Refresh members to get the updated data
      await get().fetchBoardMembers(boardId);
    } catch (error: any) {
      boardLogger.error("Error removing board member", error);
      set({ error: error.message, loading: false });
    }
  },

  updateMemberRole: async (
    boardId: string,
    userId: string,
    role: "owner" | "admin" | "member"
  ) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("board_members")
        .update({ role })
        .eq("board_id", boardId)
        .eq("user_id", userId);

      if (error) throw error;

      // Refresh members to get the updated data
      await get().fetchBoardMembers(boardId);
    } catch (error: any) {
      boardLogger.error("Error updating member role", error);
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));

// Helper function to process members with profile information
const processMembersWithProfiles = async (members: any[]) => {
  if (!members || members.length === 0) return [];

  // Get current user
  const { data: currentUser } = await supabase.auth.getUser();

  // Get all user IDs from members
  const userIds = members
    .filter((member) => !member.user_id.startsWith("invited_"))
    .map((member) => member.user_id);

  // Fetch user profiles for all members
  let userProfiles: any[] = [];
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, username, avatar_url")
      .in("user_id", userIds);

    if (!profilesError && profiles) {
      userProfiles = profiles;
    }
  }

  boardLogger.log("User profiles fetched", { count: userProfiles.length });

  return members.map((member) => {
    // Check if this is an invitation placeholder
    if (member.user_id.startsWith("invited_")) {
      const emailMatch = member.user_id.match(/invited_\d+_(.+)/);
      const email = emailMatch ? emailMatch[1].replace(/_/g, "@") : "Unknown";

      return {
        ...member,
        user: {
          id: member.user_id,
          email: email,
        },
        isInvitation: true,
      };
    }

    // Find user profile for this member
    const userProfile = userProfiles.find(
      (profile) => profile.user_id === member.user_id
    );

    // Log member details with reduced verbosity
    boardLogger.log("Processing member", {
      userId: member.user_id,
      hasProfile: !!userProfile,
      profileEmail: userProfile?.email,
    });

    // If this is the current user, use their auth info
    if (currentUser?.user?.id === member.user_id) {
      return {
        ...member,
        user: {
          id: currentUser.user.id,
          email: currentUser.user.email,
          username:
            userProfile?.username ||
            currentUser.user.email?.split("@")[0] ||
            `User ${currentUser.user.id.substring(0, 8)}`,
          avatar_url: userProfile?.avatar_url,
        },
      };
    }

    // Get user email from profile if available
    if (userProfile && userProfile.email) {
      boardLogger.log("User email from profile", {
        email: userProfile.email,
        userId: member.user_id,
      });
      return {
        ...member,
        email: userProfile.email,
        username: userProfile.username,
        avatar_url: userProfile.avatar_url,
      };
    }

    // Fallback for users without profiles
    const userEmail = `user.${member.user_id.substring(0, 8)}@example.com`;
    const username = `User ${member.user_id.substring(0, 8)}`;

    return {
      ...member,
      user: {
        id: member.user_id,
        email: userEmail,
        username: username,
        avatar_url: userProfile?.avatar_url,
      },
    };
  });
};
