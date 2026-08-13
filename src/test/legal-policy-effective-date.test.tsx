import { render, screen } from "@testing-library/react";

import CookiePolicyPage from "@/app/(with-header)/cookie-policy/page";
import PrivacyPage from "@/app/(with-header)/privacy/page";
import TermsPage from "@/app/(with-header)/terms/page";

const effectiveDate = "시행일: 2026년 2월 28일";

describe("legal policy effective dates", () => {
  it.each([
    ["이용약관", TermsPage],
    ["개인정보 처리방침", PrivacyPage],
    ["쿠키 정책", CookiePolicyPage],
  ])("%s renders the corrected effective date", (_name, Page) => {
    render(<Page />);

    expect(screen.getByText(effectiveDate)).toBeInTheDocument();
  });
});
