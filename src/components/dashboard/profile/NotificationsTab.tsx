import { motion } from "framer-motion";
import { Smartphone, Bell, Zap, Globe, Target } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationsTabProps {
  profileData: any;
  handleNotificationToggle: (key: string, value: boolean) => void;
}

export const NotificationsTab = ({
  profileData,
  handleNotificationToggle
}: NotificationsTabProps) => {
  const notificationSections = [
    {
      title: "Real-time Alerts",
      description: "Immediate notifications for time-sensitive updates.",
      items: [
        { label: "Push Notifications", key: "notifyPush", icon: Smartphone },
        { label: "Exam Reminders", key: "notifyExamReminders", icon: Bell },
      ]
    },
    {
      title: "Daily Engagement",
      description: "Daily content updates to keep your preparation on track.",
      items: [
        { label: "Daily Quiz Alerts", key: "notifyDailyQuiz", icon: Zap },
        { label: "Current Affairs Updates", key: "notifyCurrentAffairs", icon: Globe },
      ]
    },
    {
      title: "Learning Intelligence",
      description: "Data-driven insights tailored to your performance.",
      items: [
        { label: "Personalized Insights", key: "notifyPersonalizedInsights", icon: Target },
      ]
    }
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Notification Preferences</h2>
        <p className="text-muted-foreground text-sm mb-8">Manage how you want to be notified about various activities.</p>
        
        <div className="space-y-12">
          {notificationSections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground max-w-2xl">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={itemIdx}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border transition-all duration-200",
                        profileData[item.key] 
                          ? "bg-accent/5 border-accent/20 ring-1 ring-accent/10" 
                          : "bg-muted/10 border-border/60 hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          profileData[item.key] ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-[15px]">{item.label}</span>
                      </div>
                      <Switch 
                        checked={profileData[item.key]} 
                        onCheckedChange={(checked) => handleNotificationToggle(item.key, checked)}
                        className="data-[state=checked]:bg-accent"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
