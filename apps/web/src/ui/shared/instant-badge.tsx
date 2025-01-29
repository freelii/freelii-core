import { Badge } from "@freelii/ui"
import { cn } from "@freelii/utils/functions"

export const InstantBadge: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <Badge className={cn("bg-green-50 text-green-700 border-green-200", className)}>
            <span className="text-xs">Instant</span>
        </Badge>
    )
}