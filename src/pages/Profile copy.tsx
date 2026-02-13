import { useState, useRef, useEffect } from "react";
import authService from "@/services/auth.service";
import { cn } from "@/lib/utils";
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

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
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
    fieldOfStudy: ""
  });

  const [originalProfileData, setOriginalProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          const nameParts = (user.full_name || user.username || "").split(" ");
          const data = {
            firstName: user.first_name || nameParts[0] || "",
            lastName: user.last_name || nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: user.phone || "",
            bio: user.bio || "",
            address: user.address || "",
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
            fieldOfStudy: "Computer Science" // Default or fetch from user if exists
          };
          setProfileData(data);
          setOriginalProfileData(data);

          if (user.photo_url) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
            const fullUrl = user.photo_url.startsWith('http') ? user.photo_url : `${baseUrl}${user.photo_url}`;
            setProfileImage(fullUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!userId) return;

    // Check if any data has changed
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

    if (!hasChanges) {
      setIsEditing(false);
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
        district: profileData.district,
        taluk: profileData.taluk,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        country: profileData.country,
        study_goal: profileData.studyGoal,
        preferred_language: profileData.preferredLanguage,
        qualification: profileData.qualification,
        background_type: profileData.backgroundType
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
                Preparing for <span className="text-primary/80 font-medium">TNPSC Group 4</span>
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

        {/* Tabs Section */}
        <motion.div className="border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth" variants={itemVariants}>
          <div className="flex space-x-6 md:space-x-8 min-w-max px-1">
            {['Personal Details', 'Connected Accounts', 'Notifications', 'My Plan'].map((tab) => (
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
              <div className="space-y-10">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Personal Details</h2>
                  <div className="h-0.5 w-10 bg-accent/20 mb-8 rounded-full" />

                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <section className="space-y-6">
                      <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Full Name</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <UserCheck className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={`${profileData.firstName} ${profileData.lastName}`}
                              onChange={(e) => {
                                const [first, ...rest] = e.target.value.split(" ");
                                setProfileData({ ...profileData, firstName: first || "", lastName: rest.join(" ") });
                              }}
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Email Address</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Mail className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              className="bg-muted/30 border-none h-12 pl-12 pr-10 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Mobile Number</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Phone className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="bg-muted/30 border-none h-12 pl-12 pr-10 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Date of Birth</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              placeholder="15 Aug 1998"
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Gender</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              <UserCheck className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Select
                              disabled={!isEditing}
                              defaultValue="Male"
                            >
                              <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Preferred Language */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Preferred Language</Label>
                          <div className="flex bg-muted/30 p-1 rounded-xl h-12">
                            <button
                              disabled={!isEditing}
                              onClick={() => setProfileData({ ...profileData, preferredLanguage: 'ta' })}
                              className={cn(
                                "flex-1 rounded-lg text-sm font-medium transition-all",
                                profileData.preferredLanguage === 'ta'
                                  ? "bg-white text-black shadow-sm"
                                  : "text-muted-foreground hover:text-foreground/80"
                              )}
                            >
                              Tamil
                            </button>
                            <button
                              disabled={!isEditing}
                              onClick={() => setProfileData({ ...profileData, preferredLanguage: 'en' })}
                              className={cn(
                                "flex-1 rounded-lg text-sm font-medium transition-all",
                                profileData.preferredLanguage === 'en'
                                  ? "bg-white text-black shadow-sm"
                                  : "text-muted-foreground hover:text-foreground/80"
                              )}
                            >
                              English
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Address Details Section */}
                    <section className="space-y-6 pt-4">
                      <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
                        Address Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Address Line 1 */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Address Line 1</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.address}
                              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                              placeholder="Street Address / Door No."
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                          </div>
                        </div>

                        {/* Address Line 2 */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Address Line 2</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.taluk}
                              onChange={(e) => setProfileData({ ...profileData, taluk: e.target.value })}
                              placeholder="Area / Taluk / Landmark"
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                          </div>
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">City</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.city}
                              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                              placeholder="Enter City"
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">District</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={true}
                              value={profileData.district}
                              placeholder="Auto-filled by Pincode"
                              className="bg-muted/10 border-none h-12 pl-12 rounded-xl font-medium text-foreground/60 cursor-not-allowed opacity-80"
                            />
                          </div>
                        </div>

                        {/* State */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">State</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={true}
                              value={profileData.state}
                              placeholder="Auto-filled by Pincode"
                              className="bg-muted/10 border-none h-12 pl-12 rounded-xl font-medium text-foreground/60 cursor-not-allowed opacity-80"
                            />
                          </div>
                        </div>

                        {/* Pincode */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Pincode</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.pincode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setProfileData({ ...profileData, pincode: val });
                                if (val.length === 6) {
                                  handlePincodeLookup(val);
                                }
                              }}
                              placeholder="6 digits pincode"
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                            {isPincodeLoading && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Education & Exam Details Section */}
                    <section className="space-y-6 pt-4">
                      <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
                        Education & Exam Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Highest Qualification</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              <Award className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Select
                              disabled={!isEditing}
                              value={profileData.qualification}
                              onValueChange={(value) => setProfileData({ ...profileData, qualification: value })}
                            >
                              <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                                <SelectValue placeholder="Select Qualification" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="SSLC">SSLC (10th Standard)</SelectItem>
                                <SelectItem value="HSC">HSC (12th Standard)</SelectItem>
                                <SelectItem value="ITI">ITI</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="BA">B.A.</SelectItem>
                                <SelectItem value="BSc">B.Sc.</SelectItem>
                                <SelectItem value="BCom">B.Com.</SelectItem>
                                <SelectItem value="BE">B.E. (Engineering)</SelectItem>
                                <SelectItem value="BTech">B.Tech. (Engineering)</SelectItem>
                                <SelectItem value="MA">M.A.</SelectItem>
                                <SelectItem value="MSc">M.Sc.</SelectItem>
                                <SelectItem value="MCom">M.Com.</SelectItem>
                                <SelectItem value="ME">M.E. (Engineering)</SelectItem>
                                <SelectItem value="MTech">M.Tech. (Engineering)</SelectItem>
                                <SelectItem value="MPhil">M.Phil</SelectItem>
                                <SelectItem value="PhD">Ph.D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Field of Study */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Field of Study</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Input
                              disabled={!isEditing}
                              value={profileData.fieldOfStudy}
                              onChange={(e) => setProfileData({ ...profileData, fieldOfStudy: e.target.value })}
                              placeholder="e.g. Computer Science"
                              className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Target Exam Year</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Select
                              disabled={!isEditing}
                              defaultValue="2025"
                            >
                              <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                                <SelectValue placeholder="Select Year" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-1">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Daily Study Goal</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                            </div>
                            <Select
                              disabled={!isEditing}
                              value={profileData.studyGoal}
                              onValueChange={(value) => setProfileData({ ...profileData, studyGoal: value })}
                            >
                              <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                                <SelectValue placeholder="Select Goal" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="4 Hours">4 Hours</SelectItem>
                                <SelectItem value="6 Hours">6 Hours</SelectItem>
                                <SelectItem value="8 Hours">8 Hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Connected Accounts' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Connected Accounts</h2>
                  <div className="h-0.5 w-10 bg-accent/20 mb-8 rounded-full" />

                  <div className="space-y-6">
                    {/* Mobile Number Item */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/5 group hover:border-accent/30 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">MOBILE NUMBER</Label>
                          <div className="flex items-center gap-3">
                            <p className="text-[15px] font-medium text-foreground">{profileData.phone || "+91 98765 43210"}</p>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none font-medium text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              VERIFIED
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Google Account Item */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/5 group hover:border-accent/30 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">GOOGLE ACCOUNT</Label>
                          <p className="text-[15px] font-medium text-muted-foreground">Not Linked</p>
                        </div>
                      </div>
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-6 h-11 font-medium shadow-sm transition-all border-none">
                        Link Google Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Notification Preferences</h2>
                  <div className="h-0.5 w-10 bg-accent/20 mb-8 rounded-full" />

                  <div className="space-y-1">
                    {[
                      { title: "Transaction Updates", desc: "Updates about invoices, payments, and subscriptions.", email: true, whatsapp: false },
                      { title: "Content Updates", desc: "New study materials, videos, and question banks.", email: true, whatsapp: true },
                      { title: "General Announcements", desc: "Platform updates, maintenance, and news.", email: true, whatsapp: false },
                      { title: "Daily News Analysis", desc: "Daily digest of current affairs.", email: false, whatsapp: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 border-b border-border/40 last:border-0 gap-4">
                        <div className="space-y-1">
                          <h4 className="text-[15px] font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-8 min-w-[200px] justify-end">
                          {item.email !== undefined && (
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground font-medium">Email</span>
                              <Switch
                                defaultChecked={item.email}
                                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                              />
                            </div>
                          )}
                          {item.whatsapp !== undefined && (
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground font-medium">WhatsApp</span>
                              <Switch
                                defaultChecked={item.whatsapp}
                                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'My Plan' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">My Plan</h2>
                  <div className="h-0.5 w-10 bg-accent/20 mb-8 rounded-full" />

                  <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl border border-border/40 bg-muted/5 gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center shadow-lg transform -rotate-3">
                        <Zap className="w-8 h-8 text-accent fill-accent" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-semibold text-foreground tracking-tight">Pro Membership</h3>
                          <Badge className="bg-accent/20 text-accent-foreground border-none font-medium px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                            ACTIVE
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <p className="text-sm font-medium">Valid till <span className="text-foreground">August 12, 2026</span></p>
                          </div>
                          <button className="flex items-center gap-2  hover:text-accent transition-colors">
                            <FileText className="w-4 h-4" />
                            <p className="text-sm font-medium underline-offset-4  decoration-border">View Payment History</p>
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/90 rounded-2xl px-8 h-12 font-medium shadow-xl hover:shadow-accent/5 transition-all border-none flex items-center gap-2 group">
                      <Zap className="w-4 h-4 text-accent fill-accent group-hover:scale-110 transition-transform" />
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
