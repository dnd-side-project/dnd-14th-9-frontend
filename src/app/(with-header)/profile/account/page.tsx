"use client";

import { useState } from "react";

import { Avatar } from "../../../../components/Avatar/Avatar";
import { Badge } from "../../../../components/Badge/Badge";
import { Button } from "../../../../components/Button/Button";
import { ChevronRightIcon } from "../../../../components/Icon/ChevronRightIcon";
import { DeleteAccountAgreement } from "../../../../features/member/components/Profile/DeleteAccountAgreement";

export default function ProfileAccountPage() {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-32">
        <div className="gap-xl flex w-full flex-col">
          <div className="flex w-full flex-col gap-20">
            <h4 className="text-text-primary text-lg font-bold">계정 관리</h4>
            <div className="gap-lg flex w-full">
              <aside className="gap-sm flex flex-col">
                <Button
                  variant="solid"
                  colorScheme="tertiary"
                  size="large"
                  rightIcon={<ChevronRightIcon />}
                  className="border-border-strong text-text-primary py-md pr-md pl-lg gap-[160px] border text-[14px] font-semibold"
                >
                  회원 탈퇴
                </Button>
                <Button
                  variant="solid"
                  colorScheme="tertiary"
                  size="large"
                  rightIcon={<ChevronRightIcon />}
                  className="text-text-primary py-md pr-md pl-lg bg-surface-default border-border-default gap-[160px] border text-[14px] font-semibold"
                >
                  로그아웃
                </Button>
              </aside>
              <div className="px-3xl flex flex-1 flex-col gap-20">
                <div className="gap-xl flex flex-col">
                  <h4 className="text-text-primary text-lg font-bold">회원 탈퇴 시 주의사항</h4>
                  <div className="gap-sm flex flex-col">
                    <label className="text-text-primary text-base font-semibold">
                      탈퇴하기 전에
                    </label>
                    <ul className="gap-2xs text-text-secondary font-regular ml-5 flex list-disc flex-col text-[15px]">
                      <li>
                        탈퇴 시 GAK 계정으로 이용한 모든 서비스 정보가 영구적으로 삭제되며, 복구가
                        불가능합니다.
                      </li>
                      <li>참여한 세션 기록, 목표 설정 내역, 리포트 데이터가 모두 삭제됩니다.</li>
                      <li>진행 중인 세션이 있다면 자동으로 종료 처리됩니다.</li>
                    </ul>
                  </div>
                  <div className="gap-sm flex flex-col">
                    <label className="text-text-primary text-base font-semibold">데이터 안내</label>
                    <ul className="gap-2xs text-text-secondary font-regular ml-5 flex list-disc flex-col text-[15px]">
                      <li>
                        세션 기록이나 리포트 데이터를 보관하고 싶다면 탈퇴 전에 별도의 방법으로
                        저장해 주세요.
                      </li>
                      <li>탈퇴 후에는 기록 데이터를 다시 확인할 수 없습니다.</li>
                    </ul>
                  </div>
                  <div className="gap-sm flex flex-col">
                    <label className="text-text-primary text-base font-semibold">
                      탈퇴 후 처리
                    </label>
                    <ul className="gap-2xs text-text-secondary font-regular ml-5 flex list-disc flex-col text-[15px]">
                      <li>동일한 이메일로 재가입하더라도 이전 기록은 복구되지 않습니다.</li>
                      <li>탈퇴 즉시 프로필 정보 및 관심 카테고리 설정이 삭제됩니다.</li>
                    </ul>
                  </div>
                </div>
                <div className="gap-lg flex flex-col">
                  <h4 className="text-text-primary text-lg font-bold">탈퇴하려는 계정</h4>
                  <div className="bg-surface-strong gap-lg p-lg flex rounded-sm">
                    <Avatar size="large" className="h-10 w-10" />
                    <div className="gap-xs flex flex-col justify-center">
                      <p className="text-text-primary text-lg font-bold">닉네임</p>
                      <Badge
                        status="closed"
                        radius="xs"
                        className="bg-alpha-white-8 text-text-secondary px-xs py-2xs border-none text-xs font-semibold"
                      >
                        이메일
                      </Badge>
                    </div>
                  </div>
                </div>
                <DeleteAccountAgreement onAgreementChange={setIsAgreed} />
              </div>
            </div>
          </div>
          <div></div>
        </div>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="large"
          disabled={!isAgreed}
        >
          회원 탈퇴하기
        </Button>
      </div>
    </div>
  );
}
