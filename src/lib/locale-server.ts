import { cookies } from "next/headers";
import type { LocaleKey } from "./routes";

const COOKIE_KEY = "shanju-locale";

/** Read locale from cookie for server components (e.g. for Payload API locale param) */
export async function getLocaleFromRequest(): Promise<LocaleKey> {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_KEY)?.value;
  return v === "zh" || v === "en" ? v : "zh";
}
