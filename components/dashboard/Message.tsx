import { useState } from "react";

const SAMPLE_MESSAGES = [
  { id: "m1", name: "Alice", last: "How's the project?" },
  { id: "m2", name: "Bob", last: "Pushed fixes to staging." },
  { id: "m3", name: "Charlie", last: "Let's review tomorrow." },
];

const MessagesSection = () => {
  const [activeMessage, setActiveMessage] = useState(SAMPLE_MESSAGES[0].id);

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Messages</h3>
      <div className="flex gap-4 h-[520px]">
        <div className="w-1/3 bg-white rounded-lg shadow-sm p-2 overflow-y-auto">
          {SAMPLE_MESSAGES.map((message) => (
            <div
              key={message.id}
              onClick={() => setActiveMessage(message.id)}
              className={`p-3 rounded-md cursor-pointer ${
                activeMessage === message.id
                  ? "bg-gray-50 border border-gray-100"
                  : ""
              }`}
            >
              <div className="font-medium">{message.name}</div>
              <div className="text-xs text-gray-400">{message.last}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="bg-gray-100 inline-block p-2 rounded-md max-w-xs">
              Hey, how's your project?
            </div>
            <div className="bg-purple-100 self-end inline-block p-2 rounded-md max-w-xs">
              Pretty good — almost done!
            </div>
          </div>
          <div className="mt-3">
            <input
              placeholder="Type a message..."
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagesSection;
