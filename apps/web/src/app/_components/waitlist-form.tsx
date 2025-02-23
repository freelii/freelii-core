'use client'

import { api } from '@/trpc/react'
import { Button, ExpandingArrow, Input } from '@freelii/ui'
import { Loader2 } from 'lucide-react'
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
    } catch (error) {
      // Error is handled by the mutation's onError callback
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 mb-8">
      <div className="flex flex-col gap-3">
        <div className="group relative">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            className="w-full h-12 px-4 bg-white/[0.07] border-0 rounded-lg text-black placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.09] transition-all duration-200 ease-in-out"
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
            className="w-full h-12 px-4 bg-white/[0.07] border-0 rounded-lg text-black placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.09] transition-all duration-200 ease-in-out"
          />
        </div>
        <div className="group relative">
          <textarea
            id="useCase"
            name="useCase"
            placeholder="What are you planning to build? (optional)"
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.07] border-0 rounded-lg text-black placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.09] transition-all duration-200 ease-in-out resize-none"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          variant="outline"
          className="group bg-black hover:bg-gray-900 border-none text-black text-xs font-medium hover:text-gray-300 p-2 text-neutral-200 w-full rounded-xl transition-all duration-300 ease-in-out focus:outline-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Request Early Access'
          )}
          <ExpandingArrow className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}

