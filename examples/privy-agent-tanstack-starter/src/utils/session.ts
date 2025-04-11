import { useSession } from "@tanstack/react-start/server";
import type { User } from "db/schema";

export function useAppSession() {
  return useSession<User>({
    password: "ChangeThisBeforeShippingToProdOrYouWillBeFired",
  });
}
