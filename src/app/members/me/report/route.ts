import { forwardToBackend } from "../../_shared";

export async function GET() {
  return forwardToBackend({
    method: "GET",
    pathWithQuery: "/members/me/report",
  });
}
