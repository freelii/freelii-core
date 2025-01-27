"use client"

import LandingPage from "./_components/landing-page";

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
        background: "radial-gradient(circle at center, #daf0f9, #FFFFFF)",
      }}
    >
      <LandingPage />

    </main>
  );
}

