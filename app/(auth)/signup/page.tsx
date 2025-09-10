<div
  className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10"
  style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {isRedirecting ? (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-lg flex items-center justify-center z-50">
      <motion.div
        className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
      />
    </div>
  ) : (
    <div className="w-full max-w-6xl bg-white/10 backdrop-blur-lg shadow-lg rounded-lg flex flex-col md:flex-row gap-10 p-6 md:p-10">
      
      {/* TITLE */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center md:text-left flex-1 flex items-center justify-center">
        Create an Account
      </h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col space-y-4"
      >
        {/* EMAIL */}
        <div className="w-full min-h-[90px]">
          <label className="block text-sm mb-1 text-white/80">Email</label>
          <div className="relative">
            <MdEmail className="absolute left-2 top-3 text-white/60" />
            <input
              type="email"
              {...register("email")}
              className={`border-b-2 pl-8 pr-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                errors.email
                  ? "border-red-500"
                  : dirtyFields.email
                  ? "border-green-500"
                  : "border-white/40"
              }`}
              placeholder="you@example.com"
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* PASSWORD */}
        <div className="w-full min-h-[90px]">
          <label className="block text-sm mb-1 text-white/80">Password</label>
          <div className="relative">
            <MdLock className="absolute left-2 top-3 text-white/60" />
            <input
              type="password"
              {...register("password")}
              className={`border-b-2 pl-8 pr-3 py-2 w-full bg-white/10 text-white focus:outline-none ${
                errors.password
                  ? "border-red-500"
                  : dirtyFields.password
                  ? "border-green-500"
                  : "border-white/40"
              }`}
              placeholder="••••••••"
            />
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 text-white font-semibold py-2 rounded shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <motion.span
              className="h-6 w-6 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          ) : (
            "Sign Up"
          )}
        </motion.button>

        {/* OAUTH */}
        <div className="mt-4">
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-white/30" />
            <span className="mx-3 text-md text-white/80">OR</span>
            <div className="flex-grow h-px bg-white/30" />
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={() => handleOAuth("google")}
              whileHover={{ scale: 1.05 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition"
            >
              <Image src={GoogleIcon} alt="Google" width={20} height={20} />
              Sign up with Google
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleOAuth("github")}
              whileHover={{ scale: 1.05 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white transition"
            >
              <Image src={GithubIcon} alt="GitHub" width={20} height={20} />
              Sign up with GitHub
            </motion.button>
          </div>

          <p className="text-sm text-white/80 mt-6 text-center md:text-left">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-white underline hover:text-purple-400 transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  )}
</div>
