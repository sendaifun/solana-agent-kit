import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: "pending" | "idle" | "success" | "error";
  afterSubmit?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center p-8">
      <div className="bg-white dark:bg-gray-800 w-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">{actionText}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email" className="block text-xs">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              className="px-2 py-1 w-full rounded border border-gray-500/20 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="password" className="block text-xs">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              className="px-2 py-1 w-full rounded border border-gray-500/20 bg-white dark:bg-gray-800"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-2"
            disabled={status === "pending"}
          >
            {status === "pending" ? "..." : actionText}
          </Button>
          {afterSubmit ? afterSubmit : null}
        </form>
      </div>
    </div>
  );
}
