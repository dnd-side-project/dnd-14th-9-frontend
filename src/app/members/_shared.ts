import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type ForwardMethod = "GET" | "PATCH" | "DELETE";

interface ForwardToBackendOptions {
  request?: NextRequest;
  method: ForwardMethod;
  pathWithQuery: string;
  includeRequestBody?: boolean;
  clearAuthCookiesOnSuccess?: boolean;
}

function getDefaultErrorResponse(status: number, statusText: string) {
  return {
    isSuccess: false,
    code: "INTERNAL_ERROR",
    result: null,
    message: `요청 실패: ${status} ${statusText}`,
  };
}

export async function forwardToBackend(options: ForwardToBackendOptions) {
  const backendApiBase = process.env.BACKEND_API_BASE;

  if (!backendApiBase) {
    return NextResponse.json(
      {
        isSuccess: false,
        code: "CONFIG_ERROR",
        result: null,
        message: "BACKEND_API_BASE가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers: HeadersInit = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let body: string | undefined;

  if (options.includeRequestBody && options.request) {
    headers["Content-Type"] = "application/json";
    const requestBody = await options.request.text();
    body = requestBody || undefined;
  }

  try {
    const response = await fetch(`${backendApiBase}${options.pathWithQuery}`, {
      method: options.method,
      headers,
      body,
    });

    if (response.status === 204) {
      const noContentResponse = new NextResponse(null, { status: 204 });

      if (options.clearAuthCookiesOnSuccess) {
        noContentResponse.cookies.delete("accessToken");
        noContentResponse.cookies.delete("refreshToken");
      }

      return noContentResponse;
    }

    const responseText = await response.text();
    let responsePayload: unknown = null;

    if (responseText) {
      try {
        responsePayload = JSON.parse(responseText);
      } catch {
        responsePayload = getDefaultErrorResponse(response.status, response.statusText);
      }
    }
    const nextResponse = NextResponse.json(
      responsePayload ?? getDefaultErrorResponse(response.status, response.statusText),
      {
        status: response.status,
      }
    );

    if (options.clearAuthCookiesOnSuccess && response.ok) {
      nextResponse.cookies.delete("accessToken");
      nextResponse.cookies.delete("refreshToken");
    }

    return nextResponse;
  } catch (error) {
    console.error("Members proxy error:", error);

    return NextResponse.json(
      {
        isSuccess: false,
        code: "NETWORK_ERROR",
        result: null,
        message: "네트워크 오류로 요청에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
