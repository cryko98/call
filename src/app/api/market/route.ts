import { NextResponse } from "next/server";
import { getMarketSnapshot, REVALIDATE_SECONDS } from "@/lib/market";

/**
 * Live market snapshot for the client-side poller.
 *
 * The upstream fetches are themselves revalidated on the same interval, so
 * polling this route more often than that is cheap — it just replays the
 * cached upstream response.
 */
// Must be a literal for Next.js segment config — mirrors REVALIDATE_SECONDS.
export const revalidate = 60;

export async function GET() {
  const snapshot = await getMarketSnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS * 5}`,
    },
  });
}
