import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Trash } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { fetchChats } from "~/functions/chats.js";
import { formatDistance } from "date-fns";

export const Route = createFileRoute("/_authed/chats")({
  loader: () =>
    fetchChats({
      data: { limit: 20, endingBefore: null, startingAfter: null },
    }),
  component: PostsComponent,
});

function PostsComponent() {
  const chats = Route.useLoaderData();

  const dateGroupedChats = useMemo(() => {
    const grouped = chats.chats.reduce(
      (acc, chat) => {
        const date = new Date(chat.createdAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(chat);
        return acc;
      },
      {} as Record<string, typeof chats.chats>,
    );

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );
  }, [chats]);

  return (
    <SidebarProvider defaultOpen={false} className="min-h-0">
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            {dateGroupedChats.map((group) => {
              return (
                <SidebarGroup key={group[0]}>
                  <SidebarGroupLabel>
                    {formatDistance(new Date(group[0]), new Date(), {
                      addSuffix: true,
                      includeSeconds: true,
                    })}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {group[1].map((chat) => {
                      return (
                        <SidebarMenuItem
                          key={chat.id}
                          className="flex justify-between m-1 rounded-md cursor-pointer"
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              to="/chats/$chatId"
                              params={{
                                chatId: chat.id,
                              }}
                              className="block py-1"
                              activeProps={{ className: "font-bold" }}
                            >
                              <div>{chat.title.substring(0, 20)}</div>
                            </Link>
                          </SidebarMenuButton>
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              toast.promise(
                                fetch(`/api/chat?id=${chat.id}`, {
                                  method: "DELETE",
                                }),
                                {
                                  loading: "Deleting chat...",
                                  success: () => {
                                    const path = window.location.pathname;

                                    if (path.includes(chat.id)) {
                                      window.location.href = "/chats";
                                    } else {
                                      window.location.reload();
                                    }

                                    return "Chat deleted";
                                  },
                                  error: (err) => {
                                    console.error(err);
                                    return `Failed to delete chat: ${err}`;
                                  },
                                },
                              );
                            }}
                          >
                            <Trash />
                          </Button>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarGroupContent>
                </SidebarGroup>
                // <SidebarMenuItem
                //   key={chat.id}
                //   className="flex justify-between m-1 p-2 hover:bg-muted rounded-md cursor-pointer"
                // >
                //   <Link
                //     to="/chats/$chatId"
                //     params={{
                //       chatId: chat.id,
                //     }}
                //     className="block py-1"
                //     activeProps={{ className: "font-bold" }}
                //   >
                //     <div>{chat.title.substring(0, 20)}</div>
                //   </Link>
                //   <Button
                //     variant={"ghost"}
                //     onClick={async () => {
                //       toast.promise(
                //         fetch(`/api/chat?id=${chat.id}`, {
                //           method: "DELETE",
                //         }),
                //         {
                //           loading: "Deleting chat...",
                //           success: () => {
                //             const path = window.location.pathname;

                //             if (path.includes(chat.id)) {
                //               window.location.href = "/chats";
                //             } else {
                //               window.location.reload();
                //             }

                //             return "Chat deleted";
                //           },
                //           error: (err) => {
                //             console.error(err);
                //             return `Failed to delete chat: ${err}`;
                //           },
                //         },
                //       );
                //     }}
                //   >
                //     <Trash />
                //   </Button>
                // </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
