const ProgressSection = () => (
  <section>
    <h3 className="text-xl font-semibold mb-4">Progress Tracker</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">Portfolio Website</h4>
            <div className="text-xs text-gray-400">40% complete</div>
          </div>
          <div className="text-sm text-gray-500">Due: Oct 15</div>
        </div>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-3">
          <div
            className="rounded-full h-3 bg-gradient-to-r from-purple-500 to-indigo-500"
            style={{ width: "40%" }}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">React Challenge</h4>
            <div className="text-xs text-gray-400">70% complete</div>
          </div>
          <div className="text-sm text-gray-500">Due: Oct 30</div>
        </div>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-3">
          <div
            className="rounded-full h-3 bg-green-400"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>

    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold mb-2">Daily Streak</h4>
      <div className="grid grid-cols-7 gap-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <div
            key={index}
            className={`h-10 flex items-center justify-center rounded ${
              index < 4 ? "bg-purple-500 text-white" : "bg-gray-100"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default ProgressSection;
