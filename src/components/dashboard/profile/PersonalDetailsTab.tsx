import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  UserCheck, Mail, Phone, Calendar, MapPin, Globe, BookOpen, Target, Zap, Smartphone, Loader2, Check, Award 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PersonalDetailsTabProps {
  profileData: any;
  setProfileData: (val: any) => void;
  isEditing: boolean;
  originalProfileData: any;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  verifyingField: 'email' | 'phone' | null;
  setVerifyingField: (val: 'email' | 'phone' | null) => void;
  otpValue: string;
  setOtpValue: (val: string) => void;
  isVerifyingLoading: boolean;
  handleRequestVerification: (field: 'email' | 'phone') => void;
  handleConfirmVerification: () => void;
  isPincodeLoading: boolean;
  handlePincodeLookup: (val: string) => void;
  EXAM_SUB_DIVISIONS: Record<string, string[]>;
}

export const PersonalDetailsTab = ({
  profileData,
  setProfileData,
  isEditing,
  originalProfileData,
  isEmailVerified,
  isPhoneVerified,
  verifyingField,
  setVerifyingField,
  otpValue,
  setOtpValue,
  isVerifyingLoading,
  handleRequestVerification,
  handleConfirmVerification,
  isPincodeLoading,
  handlePincodeLookup,
  EXAM_SUB_DIVISIONS
}: PersonalDetailsTabProps) => {
  return (
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
                    disabled={!isEditing || verifyingField === 'email'}
                    value={profileData.email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setProfileData({ ...profileData, email: newEmail });
                    }}
                    className="bg-muted/30 border-none h-12 pl-12 pr-24 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isEditing && profileData.email !== originalProfileData?.email && !isEmailVerified && verifyingField !== 'email' && (
                      <Button
                        size="sm"
                        onClick={() => handleRequestVerification('email')}
                        disabled={isVerifyingLoading}
                        className="h-8 rounded-lg bg-accent text-accent-foreground text-xs px-3 shadow-none hover:bg-accent/90 border-none"
                      >
                        {isVerifyingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                      </Button>
                    )}
                    {isEmailVerified && (
                      <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center mr-2">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {verifyingField === 'email' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-accent/70">Verify Email</Label>
                        <span className="text-[10px] text-muted-foreground">Code sent to your inbox</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent/50" />
                          <Input
                            placeholder="6-digit code"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="h-10 bg-background border-accent/20 pl-9 rounded-lg text-sm focus-visible:ring-accent/20"
                            maxLength={6}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleConfirmVerification}
                          disabled={isVerifyingLoading || otpValue.length < 4}
                          className="h-10 px-4 rounded-lg bg-accent text-accent-foreground border-none font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isVerifyingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Code"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Mobile Number</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Phone className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Input
                    disabled={!isEditing || verifyingField === 'phone'}
                    value={profileData.phone}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      setProfileData({ ...profileData, phone: newPhone });
                    }}
                    className="bg-muted/30 border-none h-12 pl-12 pr-24 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isEditing && profileData.phone !== originalProfileData?.phone && !isPhoneVerified && verifyingField !== 'phone' && (
                      <Button
                        size="sm"
                        onClick={() => handleRequestVerification('phone')}
                        disabled={isVerifyingLoading}
                        className="h-8 rounded-lg bg-accent text-accent-foreground text-xs px-3 shadow-none hover:bg-accent/90 border-none"
                      >
                        {isVerifyingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                      </Button>
                    )}
                    {isPhoneVerified && (
                      <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center mr-2">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {verifyingField === 'phone' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-accent/70">Verify Mobile</Label>
                        <span className="text-[10px] text-muted-foreground">SMS sent to your phone</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent/50" />
                          <Input
                            placeholder="6-digit code"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="h-10 bg-background border-accent/20 pl-9 rounded-lg text-sm focus-visible:ring-accent/20"
                            maxLength={6}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleConfirmVerification}
                          disabled={isVerifyingLoading || otpValue.length < 4}
                          className="h-10 px-4 rounded-lg bg-accent text-accent-foreground border-none font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isVerifyingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Code"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Gender</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <UserCheck className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.gender}
                    onValueChange={(val) => setProfileData({ ...profileData, gender: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.preferredLanguage}
                    onValueChange={(val) => setProfileData({ ...profileData, preferredLanguage: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Location Details Section */}
          <section className="space-y-6">
            <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
              Location Details
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
                    placeholder="House No, Street name"
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
                    value={profileData.addressLine2}
                    onChange={(e) => setProfileData({ ...profileData, addressLine2: e.target.value })}
                    placeholder="Area, Locality"
                    className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">City</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Input
                    disabled={!isEditing}
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Pincode</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Input
                    disabled={!isEditing}
                    value={profileData.pincode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProfileData({ ...profileData, pincode: val });
                      if (val.length === 6) handlePincodeLookup(val);
                    }}
                    placeholder="6-digit pincode"
                    className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background"
                  />
                  {isPincodeLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">District</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Input
                    disabled={true} // Disabled like mobile app (filled by pincode)
                    value={profileData.district}
                    className="bg-muted/10 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all text-muted-foreground/70"
                  />
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">State</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Input
                    disabled={true} // Disabled like mobile app (filled by pincode)
                    value={profileData.state}
                    className="bg-muted/10 border-none h-12 pl-12 rounded-xl focus-visible:ring-accent/20 font-medium transition-all text-muted-foreground/70"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Education & Professional Details Section */}
          <section className="space-y-6">
            <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
              Education & Professional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Qualification */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Highest Qualification</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Award className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.qualification}
                    onValueChange={(val) => setProfileData({ ...profileData, qualification: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "SSLC (10th Standard)", "HSC (12th Standard)", "ITI", "Diploma",
                        "B.A.", "B.Sc.", "B.Com.", "B.E. (Engineering)", "B.Tech. (Engineering)",
                        "M.A.", "M.Sc.", "M.Com.", "M.E. (Engineering)", "M.Tech. (Engineering)",
                        "M.Phil", "Ph.D"
                      ].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
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

              {/* Learner Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Learner Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <UserCheck className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.learnerType}
                    onValueChange={(val) => setProfileData({ ...profileData, learnerType: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Learner Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Student", "Working Professional", "Fresher", "Experienced"].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preparation Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Preparation Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.preparationType}
                    onValueChange={(val) => setProfileData({ ...profileData, preparationType: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Full Time", "Part Time"].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Exam Preferences Section */}
          <section className="space-y-6">
            <h3 className="text-[15px] font-medium text-foreground/80 flex items-center gap-2">
              Exam Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Exam Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Exam Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.examType}
                    onValueChange={(val) => setProfileData({ ...profileData, examType: val, subDivision: "" })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TNPSC">TNPSC</SelectItem>
                      <SelectItem value="TNTET">TNTET</SelectItem>
                      <SelectItem value="TNUSRB">TNUSRB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sub-Division */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Sub-Division / Group</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing || !profileData.examType}
                    value={profileData.subDivision}
                    onValueChange={(val) => setProfileData({ ...profileData, subDivision: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileData.examType && EXAM_SUB_DIVISIONS[profileData.examType]?.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Year */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Target Exam Year</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.targetExamYear}
                    onValueChange={(val) => setProfileData({ ...profileData, targetExamYear: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Study Medium */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Study Medium</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.studyMedium}
                    onValueChange={(val) => setProfileData({ ...profileData, studyMedium: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English Medium</SelectItem>
                      <SelectItem value="ta">Tamil Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Study Goal */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Daily Study Goal</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Zap className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.studyGoal}
                    onValueChange={(val) => setProfileData({ ...profileData, studyGoal: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4 Hours">4 Hours</SelectItem>
                      <SelectItem value="6 Hours">6 Hours</SelectItem>
                      <SelectItem value="8 Hours">8 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Past Attempts */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Past Attempts</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    disabled={!isEditing}
                    value={profileData.pastAttempts}
                    onValueChange={(val) => setProfileData({ ...profileData, pastAttempts: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-none h-12 pl-12 rounded-xl focus:ring-accent/20 font-medium">
                      <SelectValue placeholder="Select Previous Attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "First Attempt",
                        "1 Previous Attempt",
                        "2 Previous Attempts",
                        "3+ Attempts"
                      ].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
