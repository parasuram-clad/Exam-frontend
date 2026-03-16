import { motion } from "framer-motion";
import { Camera, Edit2, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

interface ProfileHeaderProps {
  profileData: any;
  isEditing: boolean;
  profileImage: string;
  setIsEditing: (val: boolean) => void;
  triggerImageUpload: () => void;
  handleCancel: () => void;
  handleSave: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({
  profileData,
  isEditing,
  profileImage,
  setIsEditing,
  triggerImageUpload,
  handleCancel,
  handleSave,
  fileInputRef,
  handleImageChange
}: ProfileHeaderProps) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="bg-card rounded-3xl p-6 md:p-8 border border-border/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      variants={itemVariants}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="relative group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <div className="relative">
            <div
              className={cn(
                "w-28 h-28 rounded-full border border-border/50 bg-muted flex items-center justify-center overflow-hidden transition-all",
                isEditing ? "cursor-pointer hover:ring-4 hover:ring-accent/20" : "cursor-default"
              )}
              onClick={() => isEditing && triggerImageUpload()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground font-medium text-sm">Profile</span>
              )}
            </div>
            {isEditing && (
              <button
                onClick={triggerImageUpload}
                className="absolute -bottom-1 -right-1 p-2 bg-background border border-border rounded-full shadow-lg group-hover:bg-accent transition-all duration-200 z-10"
              >
                <Camera className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            {profileData.firstName} {profileData.lastName}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Preparing for <span className="text-primary/80 font-medium">{profileData.examType || "N/A"} {profileData.subDivision}</span>
          </p>
          <div className="pt-1 inline-block">
            <Badge className="bg-accent/50 text-accent-foreground hover:bg-accent/40 border-none font-medium px-3 py-1 flex items-center gap-1.5 rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              PRO PLAN
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="rounded-xl h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-medium flex items-center gap-2 shadow-sm border-none"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="rounded-xl h-12 px-6 font-medium"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-medium flex items-center gap-2 shadow-sm border-none"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
