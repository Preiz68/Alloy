import Image from "next/image";
import LoginForm from "./LoginForm";


export default function LoginPage() {
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
      <LoginForm />
      </div>
    </div>
  );
}
