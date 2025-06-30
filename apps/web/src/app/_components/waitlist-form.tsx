'use client'

import { api } from '@/trpc/react'
import { Button, ExpandingArrow, Input } from '@freelii/ui'
import { cn } from '@freelii/utils/functions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface WaitlistFormProps {
  onSuccess: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: addToWaitlist } = api.users.addToWaitlist.useMutation({
    onSuccess: () => {
      toast.success("You're on the waitlist!");
      onSuccess();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const useCase = formData.get('useCase') as string;
    console.log(name, contact, useCase);
    try {
      await addToWaitlist({
        name,
        contact,
        useCase
      });
      // Success is handled by the mutation's onSuccess callback
      (e.target as HTMLFormElement).reset(); // Reset form after successful submission
    } catch {
      // Error is handled by the mutation's onError callback
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 mt-4">
      <div className="mb-8 group">
        <h3 className="text-2xl font-semibold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
          Join the waitlist
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Be among the first businesses to experience smarter banking built on USDC.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="group relative">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            className="w-full h-12 px-4 bg-white/50 border border-gray-200/50 rounded-lg text-gray-800 placeholder:text-gray-400 
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 focus:bg-white/80 
            transition-all duration-200 ease-in-out"
          />
        </div>
        <div className="group relative">
          <Input
            id="email"
            name="contact"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="email-error"
            className="w-full h-12 px-4 bg-white/50 border border-gray-200/50 rounded-lg text-gray-800 placeholder:text-gray-400 
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 focus:bg-white/80 
            transition-all duration-200 ease-in-out"
          />
        </div>
        <div className="group relative space-y-2">
          <textarea
            id="useCase"
            name="useCase"
            placeholder="Let us know how you're using USDC"
            rows={3}
            className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-lg text-gray-800 placeholder:text-gray-400 
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 focus:bg-white/80 
            transition-all duration-200 ease-in-out resize-none text-sm"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              "bg-gradient-to-r from-emerald-50 to-emerald-100",
              "text-emerald-700",
              "border border-emerald-200/30",
              "shadow-sm shadow-emerald-100",
              "flex items-center gap-1",
              "group h-4 w-8"
            )}>
              <ExpandingArrow className='w-3 h-3' />
            </span>
            <span className="text-xs group-hover:text-emerald-700 transition-all duration-200 ease-in-out">We&apos;ll send $10 in credits to the most interesting use cases!</span>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="group bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg 
          transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
          disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Request Early Access
              <ExpandingArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-3">
          By joining, you agree to our{' '}
          <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 underline transition-colors">
            Terms of Service
          </Link>
        </p>
      </div>
    </form>
  )
}

