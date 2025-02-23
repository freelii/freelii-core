import { Button, ExpandingArrow } from '@freelii/ui';

interface WaitlistButtonProps {
    onClick: () => void;
}

export function WaitlistButton({ onClick }: WaitlistButtonProps) {
    return (
        <Button
            onClick={onClick}
            className="group w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg 
            transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            Join Waitlist
            <ExpandingArrow className="w-4 h-4" />
        </Button>
    )
} 