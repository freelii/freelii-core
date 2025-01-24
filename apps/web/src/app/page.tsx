"use client"
import { Globe } from "./_components/globe";
import { WaitlistSignup } from "./_components/waitlist-signup"

const backgroundStyle = `
  .bg-pattern {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(to right, rgba(50,50,50,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(50,50,50,0.02) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
  }
`



export default function Home() {
  return (
      <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at center, #4abbe8, #FFFFFF)",
      }}
    >
      <style jsx global>
        {backgroundStyle}
      </style>
      <div className="bg-pattern"></div>
      <div className="content w-full relative">
        <div className="absolute inset-0 z-0 opacity-30">
          <Globe />
        </div>
        <div className="relative z-10">
          <WaitlistSignup />
        </div>
      </div>
    </main>
  );
}

