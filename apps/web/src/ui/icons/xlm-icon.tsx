interface XLMIconProps {
    className?: string;
    size?: number;
}

export function XLMIcon({ className = "", size = 16 }: XLMIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            fill="none"
            viewBox="0 0 120 120"
            className={`pointer-events-none ${className}`}
            aria-hidden="true"
            focusable="false"
            role="img"
        >
            <circle cx="60" cy="60" r="60" fill="currentColor" />
            <path
                fill="white"
                d="m90.61 33.36-10.18 5.187-49.156 25.038a29.5 29.5 0 0 1-.25-3.824 29.284 29.284 0 0 1 43.562-25.527l5.826-2.97.87-.443a35.768 35.768 0 0 0-56.676 31.673 6.51 6.51 0 0 1-3.533 6.288L18 70.35v7.307l9.046-4.61 2.93-1.495 2.886-1.47 51.821-26.405 5.823-2.965 12.036-6.134v-7.304zM102.542 41.888l-66.736 33.98-5.824 2.972L18 84.946v7.3l11.9-6.062 10.18-5.187 49.207-25.074q.25 1.917.25 3.85a29.284 29.284 0 0 1-43.605 25.523l-.358.19-6.317 3.22a35.768 35.768 0 0 0 56.679-31.68 6.51 6.51 0 0 1 3.53-6.289l3.076-1.567z"
            />
        </svg>
    );
} 