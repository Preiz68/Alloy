import { auth, githubProvider, googleProvider } from "@/lib/firebase"
import { signUpFormData, signUpSchema } from "@/schemas/signupSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"


const signUpPage = () => {
    const [error,setError] = useState<string | null>(null)
   const {register,handleSubmit,formState:{errors,isSubmitting}} = useForm<signUpFormData>({
    resolver:zodResolver(signUpSchema)
   })
   const onSubmit:SubmitHandler<signUpFormData> = async (data) => {
        try {
            await createUserWithEmailAndPassword(auth,data.email,data.password)
            console.log("User registered",data.email)
        } catch (err:any) {
            setError(err)
        }
   }
   const handleGoogleSignIn = async () => {
     try {
        await signInWithPopup(auth,googleProvider)
     } catch (err:any) {
        setError(err)
     }
   }

   const handleGithubSignIn = async () => {
    try {
        await signInWithPopup(auth,githubProvider)
    } catch (err:any) {
        setError(err)
    }
   }


  return (
    <div>
       <div>
        <h1></h1>
        <form onClick={handleSubmit(onSubmit)}>

        </form>
       </div>
    </div>
  )
}
export default signUpPage