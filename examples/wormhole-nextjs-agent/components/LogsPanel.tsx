import { useEffect, useRef } from "react";

export const LogsPanel = ({ logs }: { logs: string[] }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-black text-[var(--yellow)] font-mono text-sm">
      <div className="p-2 border-b border-gray-700 bg-black text-[var(--plum)]">
        Agent Logs
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
