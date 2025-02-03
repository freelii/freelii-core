'use client'

import { FlagIcon } from '@/ui/shared/flag-icon'
import { Button, Github, Google, Input } from '@freelii/ui'
import { cn } from '@freelii/utils'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
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
                <div
                    className={cn(
                        "pointer-events-none absolute inset-0",
                        "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
                        "opacity-15 blur-[75px]"
                    )}
                />
                <Link href="/" className="relative inline-flex items-center text-sm hover:opacity-80">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Home
                </Link>
                <div className="flex items-center h-full max-w-md">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center">
                            Smarter Banking
                            <Logo className="w-10 h-10 ml-2" />
                        </h1>
                        <h1 className="text-4xl font-bold mb-2">For Modern Businesses</h1>
                        <div className="flex items-center mt-4 space-x-4">
                            <span className='text-xs text-muted-foreground flex items-center'>
                                <FlagIcon className="w-4 h-4 mr-2" currencyCode='USDC' />
                                Powered by USD Coin (USDC)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white z-10">
                <div className="w-full max-w-sm space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Log in to your account</h2>
                        <p className="text-muted-foreground">Connect to Freelii with:</p>
                    </div>

                    {/* OAuth Providers */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                            className="w-full"
                        >
                            <Google className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                            className="relative w-full"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>

                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 bg-white text-muted-foreground">OR LOG IN WITH YOUR EMAIL</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 bg-transparent border-gray-400 ring-0 focus:ring-0 focus:border-gray-400 focus:outline-none focus:border-[1px] focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="text-sm text-muted-foreground">Password</label>
                                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-blue-400">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative mt-1">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10 bg-transparent border-gray-400 ring-0 focus:ring-0 focus:border-gray-400 focus:outline-none focus:border-[1px] focus:border-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button className="w-full">
                            Log in
                        </Button>
                    </form>

                    <p className="text-center text-gray-400">
                        New to Freelii?{' '}
                        <Link href="/signup" className="text-gray-400 hover:text-blue-400">
                            Sign up for an account
                        </Link>
                    </p>
                </div>
                <span className="absolute bottom-8 left-8 text-xs text-muted-foreground">
                    © 2025 Freelii, LLC. All rights reserved.{' • '}
                    <Link href="/terms" className="text-gray-400 hover:text-blue-400">Terms</Link>{' • '}
                    <Link href="/privacy" className="text-gray-400 hover:text-blue-400">Privacy</Link>
                </span>
            </div>
        </div>
    )
}
