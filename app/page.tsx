import Image from "next/image";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";
import Navbar from "@/components/Nav";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-gradient-to-b from-cyan-900 to-blue-900">
       <Navbar/>
      <Hero/>
      <Features/>
      <HowItWorks/>
      <CallToAction />
      <Footer/>
      </div>
  );
}
