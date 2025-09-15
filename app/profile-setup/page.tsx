import Image from "next/image";
import UserOnboardingForm from "./OnboardingForm";



export default function LoginPage() {
  return (
    <div className="relative w-full min-h-screen">
      <Image
      src="/colorfulbackground.jpg"
      alt="Background"
      fill
      className="object-cover"
      priority
      />
     <div className="w-full overflow-auto bg-white/10 backdrop-blur-lg shadow-lg">
      <UserOnboardingForm/>
      </div>
    </div>
  );
}
