import { Button, ExpandingArrow } from '@freelii/ui';

interface WaitlistButtonProps {
    onClick: () => void;
}

export function WaitlistButton({ onClick }: WaitlistButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="outline"
            className="group bg-black hover:bg-gray-900 border-none text-white text-xs font-medium hover:text-gray-300 p-2 text-neutral-200 w-full rounded-xl transition-all duration-300 ease-in-out focus:outline-none"
        >
            Get Early Access
            <ExpandingArrow className="w-4 h-4" />
        </Button>
    )
} 