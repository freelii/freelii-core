import { Badge } from "@freelii/ui"
import { cn } from "@freelii/utils/functions"

export const USDCBadge: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <Badge className={cn("bg-blue-50 text-blue-700 border-blue-200", className)}>
            <span className="text-xs">USDC</span>
        </Badge>
    )
}