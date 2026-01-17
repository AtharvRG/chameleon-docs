import { AlertCircle, AlertTriangle, CheckCircle, BookOpen, Info } from "lucide-react";

type CalloutType = "info" | "warning" | "tip" | "note" | "danger";

const config = {
  info: { 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30", 
    icon: Info, 
    iconColor: "text-blue-500" 
  },
  warning: { 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/30", 
    icon: AlertTriangle, 
    iconColor: "text-yellow-500" 
  },
  tip: { 
    bg: "bg-green-500/10", 
    border: "border-green-500/30", 
    icon: CheckCircle, 
    iconColor: "text-green-500" 
  },
  note: { 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/30", 
    icon: BookOpen, 
    iconColor: "text-purple-500" 
  },
  danger: { 
    bg: "bg-red-500/10", 
    border: "border-red-500/30", 
    icon: AlertCircle, 
    iconColor: "text-red-500" 
  },
};

export function Callout({ type, children }: { type: CalloutType; children: React.ReactNode }) {
  const c = config[type];
  const Icon = c.icon;
  return (
    <div className={`my-6 border-l-4 pl-6 py-4 rounded-r-lg ${c.bg} ${c.border}`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${c.iconColor}`} />
        <div className="prose prose-sm max-w-none">{children}</div>
      </div>
    </div>
  );
}
