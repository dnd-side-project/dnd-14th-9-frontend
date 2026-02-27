import { memo } from "react";

interface DeleteWarningSection {
  title: string;
  items: string[];
}

const DELETE_ACCOUNT_WARNING_SECTIONS: DeleteWarningSection[] = [
  {
    title: "탈퇴하기 전에",
    items: [
      "탈퇴 시 GAK 계정으로 이용한 모든 서비스 정보가 영구적으로 삭제되며, 복구가 불가능합니다.",
      "참여한 세션 기록, 목표 설정 내역, 리포트 데이터가 모두 삭제됩니다.",
      "진행 중인 세션이 있다면 자동으로 종료 처리됩니다.",
    ],
  },
  {
    title: "데이터 안내",
    items: [
      "세션 기록이나 리포트 데이터를 보관하고 싶다면 탈퇴 전에 별도의 방법으로 저장해 주세요.",
      "탈퇴 후에는 기록 데이터를 다시 확인할 수 없습니다.",
    ],
  },
  {
    title: "탈퇴 후 처리",
    items: [
      "동일한 이메일로 재가입하더라도 이전 기록은 복구되지 않습니다.",
      "탈퇴 즉시 프로필 정보 및 관심 카테고리 설정이 삭제됩니다.",
    ],
  },
];

export const DeleteAccountWarnings = memo(function DeleteAccountWarnings() {
  return (
    <div className="gap-xl flex flex-col">
      <h4 className="text-text-primary text-lg font-bold">회원 탈퇴 시 주의사항</h4>
      {DELETE_ACCOUNT_WARNING_SECTIONS.map((section) => (
        <div key={section.title} className="gap-sm flex flex-col">
          <p className="text-text-primary text-base font-semibold">{section.title}</p>
          <ul className="gap-2xs text-text-secondary font-regular ml-5 flex list-disc flex-col text-[15px]">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});
