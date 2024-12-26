import { Skeleton } from "./ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <div className="flex flex-col w-full gap-2 ">
      <div className="flex h-14 w-full bg-primary/5 justify-between rounded-xl items-center p-2">
        <Skeleton className="h-6 w-2/3 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="flex h-14 w-full bg-primary/5 opacity-80 justify-between rounded-xl items-center p-2">
        <Skeleton className="h-6 w-2/3 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="flex h-14 w-full bg-primary/5 opacity-60 justify-between rounded-xl items-center p-2">
        <Skeleton className="h-6 w-2/3 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="flex h-14 w-full bg-primary/5 opacity-40 justify-between rounded-xl items-center p-2">
        <Skeleton className="h-6 w-2/3 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="flex h-14 w-full bg-primary/5 opacity-20 justify-between rounded-xl items-center p-2">
        <Skeleton className="h-6 w-2/3 rounded-sm" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      
    </div>
  );
}
