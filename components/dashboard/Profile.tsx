const ProfileSection = () => (
  <section>
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex gap-6 items-center">
      <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center text-white text-xl">
        J
      </div>
      <div>
        <h3 className="text-2xl font-bold">John Doe</h3>
        <div className="text-sm text-gray-500">
          Frontend Developer • React • TypeScript
        </div>
      </div>
      <div className="ml-auto">
        <button className="px-4 py-2 rounded-md border">Edit Profile</button>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-2">Skills</h4>
        <div className="flex gap-2 flex-wrap">
          {["React", "Next.js", "Tailwind", "Firebase", "TypeScript"].map(
            (skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-2">Projects</h4>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Portfolio Website</li>
          <li>Task Manager App</li>
        </ul>
      </div>
    </div>
  </section>
);

export default ProfileSection;
