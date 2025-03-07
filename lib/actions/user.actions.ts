"use server";

import { signinFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

//signin with email pass
export async function signinWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signinFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}

//signout user
export async function signOutUser() {
  await signOut();
}
