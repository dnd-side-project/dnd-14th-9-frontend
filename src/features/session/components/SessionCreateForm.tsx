"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { DatePicker } from "@/components/DatePicker/DatePicker";
import { Filter } from "@/components/Filter/Filter";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { InfoIcon } from "@/components/Icon/InfoIcon";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { ImageUploader } from "@/components/ImageUploader/ImageUploader";
import { Input } from "@/components/Input/Input";
import { StepperSlide } from "@/components/StepperSlide/StepperSlide";
import { Textarea } from "@/components/Textarea/Textarea";
import { formatDateTimeDisplay, formatDurationKorean } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

const CATEGORIES = [
  "개발",
  "디자인",
  "기획 · PM",
  "커리어 · 자기개발",
  "스터디 · 독서",
  "크리에이티브",
  "팀 프로젝트",
  "자유",
] as const;

const MIN_DURATION = 30;
const MAX_DURATION = 180;
const DURATION_STEP = 5;
const MIN_PARTICIPANTS = 1;
const MAX_PARTICIPANTS = 10;

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 세부 설정 상태
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(90); // 기본값 1시간 30분
  const [participants, setParticipants] = useState(5); // 기본값 5명
  const [achievementRange, setAchievementRange] = useState(50); // To do 달성도 범위

  // DatePicker 팝업 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 DatePicker 닫기
  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!datePickerContainerRef.current?.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDatePickerOpen]);

  const handleDurationDecrease = useCallback(() => {
    setDuration((prev) => Math.max(MIN_DURATION, prev - DURATION_STEP));
  }, []);

  const handleDurationIncrease = useCallback(() => {
    setDuration((prev) => Math.min(MAX_DURATION, prev + DURATION_STEP));
  }, []);

  const handleParticipantsDecrease = useCallback(() => {
    setParticipants((prev) => Math.max(MIN_PARTICIPANTS, prev - 1));
  }, []);

  const handleParticipantsIncrease = useCallback(() => {
    setParticipants((prev) => Math.min(MAX_PARTICIPANTS, prev + 1));
  }, []);

  return (
    <form className="gap-xl flex w-full flex-col">
      {/* 방 이름 */}
      <Input
        label="방 이름*"
        placeholder="예) 아침코딩모각작"
        maxLength={20}
        showCharacterCount
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        onClear={() => setRoomName("")}
        containerClassName="max-w-full"
        className="max-w-full"
      />

      {/* 방 한줄 소개 */}
      <Input
        label="방 한줄 소개*"
        placeholder="예) 1일 1목표를 달성하는 방이에요"
        maxLength={50}
        showCharacterCount
        value={roomDescription}
        onChange={(e) => setRoomDescription(e.target.value)}
        onClear={() => setRoomDescription("")}
        containerClassName="max-w-full"
        className="max-w-full"
      />

      {/* 공지사항 */}
      <Textarea
        label="공지사항"
        placeholder="예) 세션의 규칙, 공지사항을 작성해주세요"
        maxLength={100}
        showCharacterCount
        value={notice}
        onChange={(e) => setNotice(e.target.value)}
        containerClassName="max-w-full"
        className="h-[260px] max-w-full"
      />

      {/* 대표 이미지 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">대표 이미지</span>
        <ImageUploader
          hintText="최대 5MB 파일만 업로드 가능해요"
          accept="image/jpeg,image/png"
          containerClassName="max-w-[380px]"
        />
        <span className="text-text-secondary text-sm">* .jpg, .png 파일만 가능해요</span>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">카테고리</span>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((category) => (
            <CategoryFilterButton
              key={category}
              isSelected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </CategoryFilterButton>
          ))}
        </div>
      </div>

      {/* 세션 세부 설정 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">세션 세부 설정</span>
        <div className="flex gap-5">
          {/* 시작일시 */}
          <div
            ref={datePickerContainerRef}
            className="relative flex-1 rounded-sm border border-gray-700 px-3 py-4"
          >
            <div className="flex flex-col gap-3">
              <span className="text-text-secondary text-sm">시작일시</span>
              <Filter
                size="full"
                radius="sm"
                isOpen={isDatePickerOpen}
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="border-gray-500 bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon size="xsmall" className="text-text-muted" />
                  <span
                    className={cn(
                      "text-sm",
                      startDateTime ? "text-text-secondary" : "text-text-muted"
                    )}
                  >
                    {startDateTime ? formatDateTimeDisplay(startDateTime) : "날짜/시간 선택"}
                  </span>
                </div>
              </Filter>
            </div>

            {isDatePickerOpen && (
              <div className="bg-surface-default border-border-subtle absolute top-full left-0 z-10 mt-1 rounded-md border shadow-lg">
                <DatePicker
                  mode="single"
                  showTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                />
              </div>
            )}
          </div>

          {/* 진행시간 */}
          <div className="w-45 shrink-0 rounded-sm border border-gray-700 p-4">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-base">진행시간</span>
                <span className="text-text-muted text-[10px]">5분 단위로 설정</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant={duration <= MIN_DURATION ? "solid" : "outlined"}
                  colorScheme="secondary"
                  size="xsmall"
                  iconOnly
                  leftIcon={<MinusIcon size="xsmall" />}
                  onClick={handleDurationDecrease}
                  disabled={duration <= MIN_DURATION}
                  className="h-7 w-7 rounded-xs"
                />
                <span className="text-text-secondary text-center text-sm">
                  {formatDurationKorean(duration)}
                </span>
                <Button
                  type="button"
                  variant={duration >= MAX_DURATION ? "solid" : "outlined"}
                  colorScheme="secondary"
                  size="xsmall"
                  iconOnly
                  leftIcon={<PlusIcon size="xsmall" />}
                  onClick={handleDurationIncrease}
                  disabled={duration >= MAX_DURATION}
                  className="h-7 w-7 rounded-xs"
                />
              </div>
            </div>
          </div>

          {/* 참여인원 */}
          <div className="w-45 shrink-0 rounded-sm border border-gray-700 p-4">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-base">참여인원</span>
                <span className="text-text-muted text-[10px]">최대 10명까지 가능</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant={participants <= MIN_PARTICIPANTS ? "solid" : "outlined"}
                  colorScheme="secondary"
                  size="xsmall"
                  iconOnly
                  leftIcon={<MinusIcon size="xsmall" />}
                  onClick={handleParticipantsDecrease}
                  disabled={participants <= MIN_PARTICIPANTS}
                  className="h-7 w-7 rounded-xs"
                />
                <span className="text-text-secondary text-center text-sm">{participants}명</span>
                <Button
                  type="button"
                  variant={participants >= MAX_PARTICIPANTS ? "solid" : "outlined"}
                  colorScheme="secondary"
                  size="xsmall"
                  iconOnly
                  leftIcon={<PlusIcon size="xsmall" />}
                  onClick={handleParticipantsIncrease}
                  disabled={participants >= MAX_PARTICIPANTS}
                  className="h-7 w-7 rounded-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* To do 달성도 범위 설정 */}
      <div className="flex w-[calc(100%-400px)] flex-col gap-2">
        <div className="flex items-center gap-1">
          <span className="text-text-secondary text-base leading-none">To do 달성도 범위 설정</span>
          <div className="group relative flex items-center">
            <InfoIcon size="xsmall" className="text-text-muted cursor-pointer" />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-sm bg-gray-700 px-3 py-2 text-xs whitespace-nowrap text-gray-200">
                내 달성도보다 높은 범위는 설정할 수 없어요.
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-sm border border-gray-700 p-4">
          <StepperSlide
            value={achievementRange}
            onChange={setAchievementRange}
            myFocusValue={70}
            className="w-[80%]"
          />
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="mt-20 mb-20 flex justify-center gap-4">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="large"
          className="w-full max-w-70.5"
        >
          그만두기
        </Button>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="large"
          className="w-full max-w-70.5"
        >
          세션 만들기
        </Button>
      </div>
    </form>
  );
}
