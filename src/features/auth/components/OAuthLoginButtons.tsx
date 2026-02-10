interface OAuthLoginButtonsProps {
  nextPath: string;
}

export function OAuthLoginButtons({ nextPath }: OAuthLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <form action="/api/auth/login" method="get">
        <input type="hidden" name="provider" value="google" />
        <input type="hidden" name="next" value={nextPath} />
        <button
          type="submit"
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-center hover:bg-gray-50"
        >
          구글로 로그인
        </button>
      </form>

      <form action="/api/auth/login" method="get">
        <input type="hidden" name="provider" value="kakao" />
        <input type="hidden" name="next" value={nextPath} />
        <button
          type="submit"
          className="w-full rounded bg-yellow-400 px-4 py-3 text-center hover:bg-yellow-500"
        >
          카카오로 로그인
        </button>
      </form>
    </div>
  );
}
