"use client";
import { api } from "@/trpc/react";
import { Button, Input } from "@freelii/ui";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { Globe } from "./globe";

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
    <div className="min-h-screen  flex flex-col">
      <main className="flex-grow">
        <div className="relative overflow-hidden bg-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 px-4 sm:px-6 lg:px-8">
              {/* Top section with content and Globe */}
              <div className="flex flex-col lg:flex-row items-center justify-between">
                {/* Left side content */}
                <div className="w-full lg:w-1/2 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                  <main className="mx-auto mt-10 max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
                    <div className="text-center lg:text-left">
                      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block xl:inline bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                          Make money move
                        </span>
                        <span>
                          <Image
                            src="/Freeli-text.png"
                            alt="Freelii"
                            width={200}
                            height={60}
                            className="inline-block"
                          />
                        </span>
                      </h1>
                    </div>
                    {/* Form section below */}
                    <div className="w-full max-w-md mx-auto mt-8 lg:mt-12">
                      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-[#4ab3e8]">Join Our Waitlist</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                          <div>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Full Name"
                              className="w-full"
                              required
                            />
                          </div>
                          <div>
                            <Input
                              id="contact"
                              name="contact"
                              type="text"
                              placeholder="Email or Phone Number"
                              className="w-full"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            className={`w-full transition-all duration-200 ${isSuccess
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-[#4ab3e8] hover:bg-blue-400"
                              } text-white`}
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
                      </div>
                    </div>
                  </main>
                </div>

                {/* Globe stays on right */}
                <div className="w-full lg:w-1/2">
                  <Globe />
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>

      <footer className="bg-transparent mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">

          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Freelii, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
