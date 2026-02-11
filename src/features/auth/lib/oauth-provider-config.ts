import type { SocialLoginButtonConfig } from "@/features/auth/types";
import type { LoginProvider } from "@/lib/auth/auth-constants";

export const SOCIAL_LOGIN_BUTTON_CONFIGS: Record<LoginProvider, SocialLoginButtonConfig> = {
  kakao: {
    label: "카카오 계정으로 로그인",
    buttonClassName:
      "px-sm py-md gap-none h-14 w-full bg-[#FEE500] text-gray-900 hover:bg-[#FDD835] active:bg-[#FBC02D] disabled:bg-[#FEE500] disabled:text-gray-900 disabled:hover:bg-[#FEE500] disabled:active:bg-[#FEE500]",
    labelClassName: "text-gray-900",
    spinnerClassName: "text-gray-900",
  },
  google: {
    label: "구글 계정으로 로그인",
    buttonClassName:
      "bg-common-white text-alpha-black-64 px-sm py-md disabled:bg-common-white disabled:text-alpha-black-64 disabled:hover:bg-common-white disabled:active:bg-common-white gap-none border-sm h-14 w-full border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200",
    labelClassName: "text-alpha-black-64",
    spinnerClassName: "text-alpha-black-64",
  },
};
