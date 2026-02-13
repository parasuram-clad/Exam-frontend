import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ProfileWidgetProps {
  name: string;
  title: string;
  avatarUrl?: string;
  initials: string;
}

export function ProfileWidget({ name, title, avatarUrl, initials }: ProfileWidgetProps) {
  return (
    <Link
      to="/profile"
      className="flex flex-col items-center text-center pb-4 border-b border-border hover:bg-muted/50 transition-colors rounded-xl p-2 group"
    >
      <Avatar className="w-24 h-24 mb-3 ring-0 group-hover:ring-4 ring-accent/20 transition-all">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{name}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </Link>
  );
}
