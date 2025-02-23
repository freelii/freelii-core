"use client";
import { api } from "@/trpc/react";
import { Button, ExpandingArrow, Input } from "@freelii/ui";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: addToWaitlist } = api.users.addToWaitlist.useMutation({
    onSuccess: () => {
      toast.success("You're on the waitlist!");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
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

    try {
      await addToWaitlist({ name, contact, useCase: 'send' });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <Link href="/dashboard" className="fixed top-6 right-10 inline-flex items-center text-sm hover:opacity-80 group">
        Launch sandbox
        <ExpandingArrow className="w-4 h-4" />
      </Link>
      <div>
        <Image
          src="/Freeli-text.png"
          alt="Freelii"
          width={100}
          height={36}
          className="mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">Join Our Waitlist</h2>
        <p className="text-muted-foreground">Get early access to Freelii</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-muted-foreground">Full Name</label>
          <Input
            id="name"
            name="name"
            type="text"
            className="mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email or Phone Number</label>
          <Input
            id="contact"
            name="contact"
            type="text"
            className="mt-1"
            required
          />
        </div>
        <Button
          type="submit"
          className={`w-full transition-all duration-200 ${isSuccess ? "bg-green-500 hover:bg-green-600" : ""
            }`}
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
            "Loading..."
          ) : isSuccess ? (
            <span className="flex items-center justify-center">
              <Check className="mr-2 h-5 w-5 animate-bounce" /> Success!
            </span>
          ) : (
            "Request Early Access"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        © 2025 Freelii Tech, Inc. All rights reserved.
      </p>
    </div>
  );
}
