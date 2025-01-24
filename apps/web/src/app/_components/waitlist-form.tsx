'use client'

import { useState } from 'react'
import { Button, Input } from '@freelii/ui'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface WaitlistFormProps {
  onSuccess: (count: number) => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast("Success!")
    setIsPending(false)
  }

  return (
    <form action={handleSubmit} className="w-full space-y-4 mb-8">
      <div className="flex overflow-hidden rounded-xl bg-white/5 p-1 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-blue-500">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="email-error"
          className="w-full border-0 bg-transparent text-white placeholder:text-zinc-800 focus:ring-0 focus:border-transparent focus-visible:border-transparent focus:outline-none active:ring-0 active:outline-none focus-visible:ring-0 focus-visible:outline-none active:border-transparent focus-visible:ring-offset-0"
        />
        <Button 
          type="submit" 
          disabled={isPending} 
          variant="outline"
        
          className="bg-black hover:bg-gray-900 border-none text-white text-xs font-medium hover:text-gray-300 p-2 text-neutral-200 w-full px-2 rounded-xl transition-all duration-300 ease-in-out focus:outline-none w-[120px]"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Join Waitlist'
          )}
        </Button>
      </div>
    </form>
  )
}

