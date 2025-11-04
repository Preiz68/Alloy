const SAMPLE_COMMUNITIES = [
  {
    id: "c1",
    title: "React Devs",
    members: 1245,
    desc: "Share tips & patterns",
  },
  {
    id: "c2",
    title: "AI Enthusiasts",
    members: 842,
    desc: "Models, experiments",
  },
  { id: "c3", title: "Freelancers", members: 420, desc: "Biz & client work" },
];

const SAMPLE_MESSAGES = [
  { id: "m1", name: "Alice", last: "How's the project?" },
  { id: "m2", name: "Bob", last: "Pushed fixes to staging." },
  { id: "m3", name: "Charlie", last: "Let's review tomorrow." },
];

const SidebarWidgets = () => (
  <aside className="space-y-4 dark:bg-gray-900 dark:text-white">
    <div className="bg-white dark:bg-gray-900 dark:text-white p-4 dark:border-2 dark:border-gray-700 rounded-lg shadow-sm">
      <h4 className="font-semibold mb-2">Progress Tracker</h4>
      <div className="text-sm text-gray-500 mb-3 dark:text-gray-300">
        Quick glance at active goals
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="text-gray-300">Portfolio Website</span>
            <span className="text-gray-300">40%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: "40%" }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="dark:text-gray-300">React Challenge</span>
            <span className="dark:text-gray-300">70%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-400"
              style={{ width: "70%" }}
            />
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm dark:border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <h4 className="font-semibold mb-2">Messages</h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {SAMPLE_MESSAGES.map((message) => (
          <li key={message.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white flex items-center justify-center">
              A
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-white">
                {message.name}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-300">
                {message.last}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm dark:border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <h4 className="font-semibold mb-2">Communities</h4>
      <div className="grid grid-cols-1 gap-2">
        {SAMPLE_COMMUNITIES.map((community) => (
          <div
            key={community.id}
            className="flex items-center justify-between text-sm"
          >
            <div>
              <div className="font-medium">{community.title}</div>
              <div className="text-xs text-gray-400 dark:text-gray-300">
                {community.members} members
              </div>
            </div>
            <button className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  </aside>
);

export default SidebarWidgets;
