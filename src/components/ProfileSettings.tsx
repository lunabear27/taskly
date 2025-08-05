import React, { useState, useRef, useEffect } from "react";
import { useUserProfileStore } from "../store/userProfile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useAuth } from "../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Camera,
  Upload,
  Trash2,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    getAvatarUrl,
  } = useUserProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleSaveAvatar = async () => {
    if (avatarFile) {
      try {
        await updateAvatar(avatarFile);
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error saving avatar:", error);
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCurrentAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatar_url) return profile.avatar_url;
    return getAvatarUrl(user?.email || "");
  };

  const getDisplayName = () => {
    return profile?.display_name || user?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your profile information and avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a custom profile picture or use the default avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage src={getCurrentAvatarUrl()} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteAvatar}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or GIF. Max 5MB.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {avatarFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarPreview || ""} />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{avatarFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveAvatar}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAvatar}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your display name and other profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!isEditing || loading}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    disabled={!isEditing || loading}
                    placeholder="Enter display name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed from this interface
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
