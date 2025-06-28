'use client'

import { Button, Google, Input } from '@freelii/ui'
import { cn } from '@freelii/utils'
import { ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Logo } from 'node_modules/@freelii/ui/src/logo'
import { useState } from 'react'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen flex bg-white text-black">
            {/* Left side */}
            <div className="flex-1 p-8 relative hidden md:block">
                {/* Grid overlay */}
                <div
                    className={cn(
                        "pointer-events-none absolute inset-0",
                        "bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]",
                        "bg-[size:32px_32px]"
                    )}
                />

                {/* Refined gradient background */}
                <div
                    className={cn(
                        "pointer-events-none absolute inset-0",
                        "bg-[radial-gradient(ellipse_800px_600px_at_50%_-100px,rgba(120,119,198,0.15),transparent)]"
                    )}
                />

                {/* Subtle color accent */}
                <div
                    className={cn(
                        "pointer-events-none absolute top-0 right-0 w-96 h-96",
                        "bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-30"
                    )}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                    <Link href="/" className="inline-flex items-center text-xs hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Home
                    </Link>

                    {/* Center the hero content vertically */}
                    <div className="flex items-center flex-1">
                        <div className="max-w-md">
                            <h1 className="text-3xl font-bold mb-2 flex items-center leading-tight">
                                Smarter Business
                                <Logo className="w-8 h-8 ml-2" />
                            </h1>
                            <h1 className="text-3xl font-bold mb-4 leading-tight">Banking</h1>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                                Global payments and remittances through messaging platforms. Built on Stellar blockchain.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white z-10">
                <div className="w-full max-w-sm space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Log in to your account</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">Connect to <span className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Freelii" width={60} height={60} />
                        </span> with:</p>
                    </div>

                    {/* OAuth Providers */}
                    <Button
                        variant="outline"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full text-sm"
                    >
                        <Google className="mr-2 h-4 w-4" />
                        Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 bg-white text-muted-foreground text-xs">OR LOG IN WITH YOUR EMAIL</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-3">
                        <div>
                            <label className="text-xs text-muted-foreground">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 bg-transparent border-gray-400 ring-0 focus:ring-0 focus:border-gray-400 focus:outline-none focus:border-[1px] focus:border-gray-400 text-sm"
                            />
                        </div>
                        <Button className="w-full text-xs">
                            Request sign-in link
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400">
                        New to Freelii?{' '}
                        <Link href="/signup" className="text-gray-400 hover:text-blue-400 transition-colors">
                            Sign up for an account
                        </Link>
                    </p>
                </div>
                <div className="absolute bottom-8 left-8 text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                        <span>© 2025 Freelii Tech, Inc.</span>
                        <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
                        <span className="hidden sm:inline">All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
