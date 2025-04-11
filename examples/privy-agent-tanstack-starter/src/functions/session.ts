import { createServerFn } from "@tanstack/react-start";
import { createUser, getUser, updateUser } from "db/queries";
import { useAppSession } from "~/utils/session";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email?: string; walletAddress?: string }) => {
    if (
      !data.email &&
      (!data.walletAddress || data.walletAddress.length === 0)
    ) {
      throw new Error("Email or wallet address is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    // Find the user
    const user = await getUser(data.email, data.walletAddress);

    // Check if the user exists
    if (!user) {
      return {
        error: true,
        userNotFound: true,
        message: "User not found",
      };
    }

    // This is to check if the user has a wallet and if not, update the user object
    // (in case Privy fails to create a wallet for the user after email signup)
    if (!user[0].walletAddress || user[0].walletAddress.length === 0) {
      await updateUser(user[0].id, undefined, data.walletAddress);
    }

    // Create a session
    const session = await useAppSession();

    // Store the user's email in the session
    await session.update({
      id: user[0].id,
      email: user[0].email,
      walletAddress: user[0].walletAddress,
    });
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  // Clear the session
  const session = await useAppSession();
  await session.clear();
});

export const signupFn = createServerFn({ method: "POST" })
  .validator(
    (data: { email?: string; walletAddress: string; redirectUrl?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    try {
      // Check if the user already exists
      const found = (await getUser(data.email, data.walletAddress))[0];

      // Create a session
      const session = await useAppSession();

      // If the user already exists, update the session
      if (found) {
        await loginFn({
          data: {
            email: data.email ?? found.email ?? undefined,
            walletAddress: data.walletAddress ?? found.walletAddress,
          },
        });

        return {
          error: false,
          message: "User already exists",
        };
      }

      // Create the user
      const user = await createUser(data.walletAddress, data.email);

      // Store the user's email in the session
      await session.update({
        email: data.email,
        id: user[0].id,
        walletAddress: data.walletAddress,
      });

      return {
        error: false,
        message: "User created",
      };
    } catch (e) {
      return {
        error: true,
        message: "Error creating user",
      };
    }
  });

export const fetchSession = createServerFn({ method: "GET" }).handler(
  async () =>
    (await useAppSession()).data as {
      email?: string;
      walletAddress: string;
    } | null,
);
