import { useState, useRef, useEffect } from "react";
import authService from "@/services/auth.service";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { cn, getMediaUrl } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Target,
  Edit2,
  Globe,
  Twitter,
  Linkedin,
  Bell,
  Lock,
  Shield,
  CreditCard,
  UserCheck,
  Check,
  X,
  Camera,
  Zap,
  Smartphone,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { 
  ProfileHeader, 
  PersonalDetailsTab, 
  NotificationsTab, 
  MyPlanTab 
} from "@/components/dashboard/profile";
import { BASE_URL } from "@/config/env";

const EXAM_SUB_DIVISIONS: Record<string, string[]> = {
  "TNPSC": ["Group I", "Group II", "Group IIA", "Group IV"],
  "TNTET": ["TET Paper I", "TET Paper II", "PG TET"],
  "TNUSRB": ["SI/SO", "PC/Fireman"]
};

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  addressLine2: string;
  district: string;
  taluk: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  langPref: string;
  studyGoal: string;
  qualification: string;
  backgroundType: string;
  preferredLanguage: string;
  studyMedium: string;
  fieldOfStudy: string;
  gender: string;
  targetExamYear: string;
  examType: string;
  subDivision: string;
  learnerType: string;
  preparationType: string;
  dob: string;
  pastAttempts: string;
  notifyPush: boolean;
  notifyExamReminders: boolean;
  notifyDailyQuiz: boolean;
  notifyCurrentAffairs: boolean;
  notifyPersonalizedInsights: boolean;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState("");
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id || null;

  // Verification State
  const [verifyingField, setVerifyingField] = useState<'email' | 'phone' | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [isVerifyingLoading, setIsVerifyingLoading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
    addressLine2: "",
    district: "",
    taluk: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    langPref: "",
    studyGoal: "",
    qualification: "",
    backgroundType: "",
    preferredLanguage: "en",
    studyMedium: "en",
    fieldOfStudy: "",
    gender: "",
    targetExamYear: "",
    examType: "",
    subDivision: "",
    learnerType: "",
    preparationType: "",
    pastAttempts: "",
    dob: "",
    notifyPush: true,
    notifyExamReminders: true,
    notifyDailyQuiz: true,
    notifyCurrentAffairs: true,
    notifyPersonalizedInsights: true
  });

  const [originalProfileData, setOriginalProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const nameParts = (user.full_name || user.username || "").split(" ");
      const data = {
        firstName: user.first_name || nameParts[0] || "",
        lastName: user.last_name || nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        addressLine2: user.address_line_2 || "",
        district: user.district || "",
        taluk: user.taluk || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        country: user.country || "",
        langPref: user.preferred_language === "ta" ? "Tamil" : "English",
        studyGoal: user.study_goal || "6 Hours",
        qualification: user.qualification || "",
        backgroundType: user.background_type || "other",
        preferredLanguage: user.preferred_language || "en",
        studyMedium: user.study_medium || "en",
        fieldOfStudy: user.field_of_study || "",
        gender: user.gender || "Male",
        targetExamYear: user.target_exam_year ? String(user.target_exam_year) : "2025",
        examType: user.exam_type || "",
        subDivision: user.sub_division || "",
        learnerType: user.learner_type || "",
        preparationType: user.preparation_type || "",
        pastAttempts: user.past_attempts || "",
        dob: user.dob || "",
        notifyPush: user.notify_push ?? true,
        notifyExamReminders: user.notify_exam_reminders ?? true,
        notifyDailyQuiz: user.notify_daily_quiz ?? true,
        notifyCurrentAffairs: user.notify_current_affairs ?? true,
        notifyPersonalizedInsights: user.notify_personalized_insights ?? true,
      };
      setProfileData(data);
      setOriginalProfileData(data);
      setIsEmailVerified(true);
      setIsPhoneVerified(true);

      if (user.photo_url) {
        setProfileImage(getMediaUrl(user.photo_url));
      }
      setLoading(false);
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [user, isAuthLoading]);

  const handleRequestVerification = async (field: 'email' | 'phone') => {
    const identifier = field === 'email' ? profileData.email : profileData.phone;
    if (!identifier) {
      toast.error(`Please enter a valid ${field}`);
      return;
    }

    setIsVerifyingLoading(true);
    try {
      // Use apiClient instead of raw fetch to ensure auth headers and refresh interceptors apply
      const response = await apiClient.post('/accounts/request-verification', { identifier });

      if (response.status === 200) {
        setVerifyingField(field);
        setOtpValue("");
        toast.success(`Verification code sent to your ${field}`);
      } else {
        toast.error("Failed to send verification code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "An error occurred");
    } finally {
      setIsVerifyingLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!otpValue || otpValue.length < 4) {
      toast.error("Please enter a valid code");
      return;
    }

    const identifier = verifyingField === 'email' ? profileData.email : profileData.phone;
    setIsVerifyingLoading(true);
    try {
      const response = await apiClient.post('/accounts/verify-update', { identifier, otp: otpValue });

      if (response.status === 200) {
        if (verifyingField === 'email') setIsEmailVerified(true);
        if (verifyingField === 'phone') setIsPhoneVerified(true);
        setVerifyingField(null);
        toast.success(`${verifyingField === 'email' ? 'Email' : 'Mobile'} verified successfully`);
      } else {
        toast.error("Invalid verification code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification failed");
    } finally {
      setIsVerifyingLoading(false);
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (!userId) return;

    // Update local state first for responsiveness
    setProfileData(prev => ({ ...prev, [key]: value }));

    try {
      // Map frontend camelCase to backend snake_case
      const backendKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      await authService.updateProfile(userId, {
        [backendKey]: value
      });

      // Update original data to avoid "unsaved changes" warning if any
      setOriginalProfileData(prev => ({ ...prev, [key]: value }));
      toast.success("Notification preference updated");
    } catch (err) {
      console.error("Failed to update notification preference", err);
      toast.error("Failed to update preference");
      // Revert local state on failure
      setProfileData(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    // Check if any data has changed
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    // New verification check
    if (profileData.email !== originalProfileData?.email && !isEmailVerified) {
      toast.error("Please verify your new email address before saving.");
      return;
    }
    if (profileData.phone !== originalProfileData?.phone && !isPhoneVerified) {
      toast.error("Please verify your new mobile number before saving.");
      return;
    }

    try {
      await authService.updateProfile(userId, {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        address: profileData.address,
        address_line_2: profileData.addressLine2,
        district: profileData.district,
        taluk: profileData.taluk,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        country: profileData.country,
        study_goal: profileData.studyGoal,
        preferred_language: profileData.preferredLanguage,
        study_medium: profileData.studyMedium,
        qualification: profileData.qualification,
        background_type: profileData.backgroundType,
        gender: profileData.gender,
        field_of_study: profileData.fieldOfStudy,
        target_exam_year: profileData.targetExamYear ? parseInt(profileData.targetExamYear) : null,
        exam_type: profileData.examType,
        sub_division: profileData.subDivision,
        learner_type: profileData.learnerType,
        preparation_type: profileData.preparationType,
        past_attempts: profileData.pastAttempts,
        dob: profileData.dob,
        notify_push: profileData.notifyPush,
        notify_exam_reminders: profileData.notifyExamReminders,
        notify_daily_quiz: profileData.notifyDailyQuiz,
        notify_current_affairs: profileData.notifyCurrentAffairs,
        notify_personalized_insights: profileData.notifyPersonalizedInsights
      });

      // Update the original data to match current data after success
      setOriginalProfileData({ ...profileData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    if (originalProfileData) {
      setProfileData({ ...originalProfileData });
    }
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    if (!isEditing) setIsEditing(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const handlePincodeLookup = async (pincode: string) => {
    if (pincode.length !== 6) return;

    setIsPincodeLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_PINCODE_API_URL}/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setProfileData(prev => ({
          ...prev,
          district: details.District,
          state: details.State
        }));
        toast.success(`Location detected: ${details.District}, ${details.State}`);
      } else {
        toast.error("Invalid Pincode or location not found");
      }
    } catch (error) {
      console.error("Pincode lookup failed:", error);
    } finally {
      setIsPincodeLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="max-w-6xl mx-auto space-y-8 pb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header Card */}
        <ProfileHeader
          profileData={profileData}
          isEditing={isEditing}
          profileImage={profileImage}
          setIsEditing={setIsEditing}
          triggerImageUpload={triggerImageUpload}
          handleCancel={handleCancel}
          handleSave={handleSave}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
        />

        {/* Tabs Section */}
        <motion.div className="border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth" variants={itemVariants}>
          <div className="flex space-x-6 md:space-x-8 min-w-max px-1">
            {['Personal Details', 'Notifications', 'My Plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-[15px] font-medium transition-all relative",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-3xl p-5 md:p-8 border border-border/60 shadow-sm"
          >
            {activeTab === 'Personal Details' && (
              <PersonalDetailsTab
                profileData={profileData}
                setProfileData={setProfileData}
                isEditing={isEditing}
                originalProfileData={originalProfileData}
                isEmailVerified={isEmailVerified}
                isPhoneVerified={isPhoneVerified}
                verifyingField={verifyingField}
                setVerifyingField={setVerifyingField}
                otpValue={otpValue}
                setOtpValue={setOtpValue}
                isVerifyingLoading={isVerifyingLoading}
                handleRequestVerification={handleRequestVerification}
                handleConfirmVerification={handleConfirmVerification}
                isPincodeLoading={isPincodeLoading}
                handlePincodeLookup={handlePincodeLookup}
                EXAM_SUB_DIVISIONS={EXAM_SUB_DIVISIONS}
              />
            )}

            {activeTab === 'Notifications' && (
              <NotificationsTab
                profileData={profileData}
                handleNotificationToggle={handleNotificationToggle}
              />
            )}

            {activeTab === 'My Plan' && (
              <MyPlanTab user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
