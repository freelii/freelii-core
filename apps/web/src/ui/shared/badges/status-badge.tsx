import { Badge } from "@freelii/ui";
import { cn } from "@freelii/utils/functions";
import { CheckCircle2, Clock, XCircle } from "lucide-react";


type StatusBadgeProps = {
    className?: string;
    text: string;
    useIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ className, text, useIcon }) => {
    // Default is "SUCCESS"- Green
    let [bgColor, textColor] = ["bg-green-50 text-green-700 border-green-200", "text-green-700"]
    let Icon = CheckCircle2;
    if (["inactive", "error", "failed"].includes(text.toLocaleLowerCase())) {
        Icon = XCircle;
        [bgColor, textColor] = ["bg-red-50 text-red-700 border-red-200", "text-red-700"]
    } else if (["pending", "processing", "not started", "not_started"].includes(text.toLocaleLowerCase())) {
        Icon = Clock;
        [bgColor, textColor] = ["bg-yellow-50 text-yellow-700 border-yellow-200", "text-yellow-700"]
    }

    return (
        <Badge className={cn("flex items-center gap-1", bgColor, className)}>
            {useIcon && <Icon className="size-3" />}
            <span className={cn("text-xs capitalize", textColor)}>{text?.replaceAll("_", " ").toLowerCase()}</span>
        </Badge>
    )
}