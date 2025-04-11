import { createFileRoute } from "@tanstack/react-router";
import { Markdown } from "~/components/Markdown";
import { readHomeMarkdownFile } from "~/functions/markdown";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    return {
      mdContent: await readHomeMarkdownFile(),
    };
  },
  loader: async ({ context, location }) => {
    const search = location.search as { errMsg?: string };

    if (typeof window !== "undefined") {
      const errMsg = search.errMsg;
      if (errMsg) {
        window.alert(errMsg);
      }
    }

    return context.mdContent;
  },
  component: Home,
});

function Home() {
  const markdown = Route.useLoaderData();

  return (
    <div className="p-4">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
