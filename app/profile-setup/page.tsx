import Image from "next/image";
import UserOnboardingForm from "./OnboardingForm";



export default function LoginPage() {
  return (
    <div className="relative w-full min-h-screen overflow-auto">
      <Image
      src="/colorfulbackground.jpg"
      alt="Background"
      fill
      className="object-cover"
      priority
      />
     <div className="w-full h-full bg-white/10 backdrop-blur-lg shadow-lg">
      <UserOnboardingForm/>
      </div>
    </div>
  );
}
