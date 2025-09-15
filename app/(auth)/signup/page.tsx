import Image from "next/image";
import SignUpPage from "./SignupForm";


export default function SignupPage() {
  return (
    <div className="w-full h-screen">
      <Image
      src="/colorfulbackground.jpg"
      alt="Background"
      fill
      className="object-cover"
      priority
      />
     <div className="w-full h-full bg-white/10 backdrop-blur-lg shadow-lg">
      <SignUpPage/>
      </div>
    </div>
  );
}
