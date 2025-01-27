'use client'

import { api } from '@/trpc/react'
import { Button, Input } from '@freelii/ui'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface WaitlistFormProps {
  onSuccess: (count: number) => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: addToWaitlist } = api.users.addToWaitlist.useMutation({
    onSuccess: () => {
      toast.success("You're on the waitlist!");

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
    console.log(name, contact);
    try {
      await addToWaitlist({
        name,
        contact
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
      <div className="flex flex-col gap-2">
        <div className="flex overflow-hidden rounded-xl bg-white/5 p-1 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-blue-500">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            className="w-full border-0 bg-transparent text-white placeholder:text-zinc-800 focus:ring-0 focus:border-transparent focus-visible:border-transparent focus:outline-none active:ring-0 active:outline-none focus-visible:ring-0 focus-visible:outline-none active:border-transparent focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex overflow-hidden rounded-xl bg-white/5 p-1 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-blue-500">
          <Input
            id="email"
            name="contact"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="email-error"
            className="w-full border-0 bg-transparent text-white placeholder:text-zinc-800 focus:ring-0 focus:border-transparent focus-visible:border-transparent focus:outline-none active:ring-0 active:outline-none focus-visible:ring-0 focus-visible:outline-none active:border-transparent focus-visible:ring-offset-0"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          variant="outline"
          className="bg-black hover:bg-gray-900 border-none text-white text-xs font-medium hover:text-gray-300 p-2 text-neutral-200 w-full rounded-xl transition-all duration-300 ease-in-out focus:outline-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Join Waitlist'
          )}
        </Button>
      </div>
    </form>
  )
}

