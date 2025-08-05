import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileManagerProps {
  userId: string;
  onProfileUpdate?: (profile: UserProfile) => void;
}

export const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  userId,
  onProfileUpdate,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfile(data);
        setEditData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      } else {
        // Create default profile
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: userId,
            username: `user_${userId.substring(0, 8)}`,
            full_name: "",
            bio: "",
            avatar_url: "",
          })
          .select()
          .single();

        if (createError) throw createError;

        setProfile(newProfile);
        setEditData({
          username: newProfile.username || "",
          full_name: newProfile.full_name || "",
          bio: newProfile.bio || "",
          avatar_url: newProfile.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          username: editData.username,
          full_name: editData.full_name,
          bio: editData.bio,
          avatar_url: editData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      onProfileUpdate?.(data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Profile
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Profile
            </span>
          </div>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={editData.avatar_url} />
                <AvatarFallback>
                  {editData.full_name?.charAt(0) ||
                    editData.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Avatar URL"
                  value={editData.avatar_url}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      avatar_url: e.target.value,
                    }))
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Username
                </label>
                <Input
                  value={editData.username}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <Input
                  value={editData.full_name}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Bio
                </label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) ||
                    profile?.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">
                  {profile?.full_name || profile?.username || "Unnamed User"}
                </div>
                {profile?.username && (
                  <div className="text-sm text-muted-foreground">
                    @{profile.username}
                  </div>
                )}
              </div>
            </div>

            {profile?.bio && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bio</div>
                <p className="text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">
                Member since{" "}
                {new Date(profile?.created_at || "").toLocaleDateString()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
