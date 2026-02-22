"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { DatePicker } from "@/components/DatePicker/DatePicker";
import { Filter } from "@/components/Filter/Filter";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { InfoIcon } from "@/components/Icon/InfoIcon";
import { ImageUploader } from "@/components/ImageUploader/ImageUploader";
import { Textarea } from "@/components/Input/Textarea";
import { TextInput } from "@/components/Input/TextInput";
import { NumericStepper } from "@/components/NumericStepper/NumericStepper";
import { StepperSlide } from "@/components/StepperSlide/StepperSlide";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ApiError } from "@/lib/api/api-client";
import { ONBOARDING_CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants/category";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { formatDateTimeDisplay, formatDurationKorean, formatLocalDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import {
  SESSION_DURATION_MINUTES_DEFAULT,
  SESSION_DURATION_MINUTES_MAX,
  SESSION_DURATION_MINUTES_MIN,
  SESSION_DURATION_MINUTES_STEP,
  SESSION_PARTICIPANTS_DEFAULT,
  SESSION_PARTICIPANTS_MAX,
  SESSION_PARTICIPANTS_MIN,
} from "../constants/sessionLimits";
import { useCreateSession } from "../hooks/useSessionHooks";
import { validateSessionForm, type SessionFormErrors } from "../utils/validateSessionForm";

import type { CreateSessionRequest } from "../types";

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // 세부 설정 상태
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(SESSION_DURATION_MINUTES_DEFAULT); // 기본값 1시간 30분
  const [participants, setParticipants] = useState(SESSION_PARTICIPANTS_DEFAULT); // 기본값 5명
  const [achievementRange, setAchievementRange] = useState(50); // To do 달성도 범위

  // DatePicker 팝업 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 DatePicker 닫기
  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);
  useClickOutside(datePickerContainerRef, closeDatePicker, isDatePickerOpen);

  // 이미지 미리보기 URL 생성
  const imagePreviewUrl = useMemo(() => {
    if (!selectedImage) return null;
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  // 이미지 미리보기 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // validation / API 연동 상태
  const [formErrors, setFormErrors] = useState<SessionFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: createSession, isPending } = useCreateSession();

  const clearFieldError = useCallback((field: keyof SessionFormErrors) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // useState 값 → zod 스키마 형태로 매핑
    const validation = validateSessionForm({
      title: roomName,
      summary: roomDescription,
      notice,
      category: selectedCategory ?? undefined,
      startTime: startDateTime ?? undefined,
      sessionDurationMinutes: duration,
      maxParticipants: participants,
      requiredAchievementRate: achievementRange,
    });

    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    // CreateSessionRequest 구성 (Date → ISO 문자열 변환)
    const body: CreateSessionRequest = {
      title: validation.data.title,
      summary: validation.data.summary,
      notice: validation.data.notice,
      category: validation.data.category,
      startTime: formatLocalDateTime(validation.data.startTime),
      sessionDurationMinutes: validation.data.sessionDurationMinutes,
      maxParticipants: validation.data.maxParticipants,
      requiredFocusRate: 0,
      requiredAchievementRate: validation.data.requiredAchievementRate,
    };

    createSession(
      { body, image: selectedImage ?? undefined },
      {
        onSuccess: () => router.push("/"),
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          setServerError(message);
        },
      }
    );
  };

  return (
    <form className="gap-xl flex w-full flex-col" onSubmit={handleSubmit}>
      {/* 방 이름 */}
      <TextInput
        label="방 이름*"
        placeholder="예) 아침코딩모각작"
        maxLength={20}
        showCharacterCount
        value={roomName}
        onChange={(e) => {
          setRoomName(e.target.value);
          clearFieldError("title");
        }}
        onClear={() => setRoomName("")}
        error={!!formErrors.title}
        errorMessage={formErrors.title}
        containerClassName="max-w-full"
        className="max-w-full"
      />

      {/* 방 한줄 소개 */}
      <TextInput
        label="방 한줄 소개*"
        placeholder="예) 1일 1목표를 달성하는 방이에요"
        maxLength={50}
        showCharacterCount
        value={roomDescription}
        onChange={(e) => {
          setRoomDescription(e.target.value);
          clearFieldError("summary");
        }}
        onClear={() => setRoomDescription("")}
        error={!!formErrors.summary}
        errorMessage={formErrors.summary}
        containerClassName="max-w-full"
        className="max-w-full"
      />

      {/* 공지사항 */}
      <Textarea
        label="공지사항*"
        placeholder="예) 세션의 규칙, 공지사항을 작성해주세요"
        maxLength={100}
        showCharacterCount
        value={notice}
        onChange={(e) => {
          setNotice(e.target.value);
          clearFieldError("notice");
        }}
        error={!!formErrors.notice}
        errorMessage={formErrors.notice}
        containerClassName="max-w-full"
        className="h-[260px] max-w-full"
      />

      {/* 대표 이미지 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">대표 이미지</span>
        {imagePreviewUrl ? (
          <div className="relative max-w-95">
            <Image
              src={imagePreviewUrl}
              alt="대표 이미지 미리보기"
              width={380}
              height={144}
              unoptimized
              className="h-36 w-full rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="solid"
              colorScheme="tertiary"
              size="small"
              onClick={handleImageRemove}
              className="absolute top-2 right-2"
            >
              삭제
            </Button>
          </div>
        ) : (
          <ImageUploader
            hintText="최대 5MB 파일만 업로드 가능해요"
            accept="image/jpeg,image/png"
            containerClassName="max-w-[380px]"
            onFileSelect={setSelectedImage}
          />
        )}
        <span className="text-text-secondary text-sm">* .jpg, .png 파일만 가능해요</span>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">카테고리</span>
        <div className="flex flex-wrap gap-3">
          {ONBOARDING_CATEGORIES.map((category) => (
            <CategoryFilterButton
              key={category}
              isSelected={selectedCategory === category}
              onClick={() => {
                setSelectedCategory(category);
                clearFieldError("category");
              }}
              type="button"
            >
              {CATEGORY_LABELS[category]}
            </CategoryFilterButton>
          ))}
        </div>
        {formErrors.category && (
          <span className="text-status-error text-sm">{formErrors.category}</span>
        )}
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
                  onChange={(date) => {
                    setStartDateTime(date);
                    clearFieldError("startTime");
                  }}
                />
              </div>
            )}
            {formErrors.startTime && (
              <span className="text-status-error text-sm">{formErrors.startTime}</span>
            )}
          </div>

          {/* 진행시간 */}
          <NumericStepper
            label="진행시간"
            hint="5분 단위로 설정"
            value={duration}
            displayValue={formatDurationKorean(duration)}
            min={SESSION_DURATION_MINUTES_MIN}
            max={SESSION_DURATION_MINUTES_MAX}
            step={SESSION_DURATION_MINUTES_STEP}
            onChange={setDuration}
            className="w-45"
          />

          {/* 참여인원 */}
          <NumericStepper
            label="참여인원"
            hint="최대 10명까지 가능"
            value={participants}
            displayValue={`${participants}명`}
            min={SESSION_PARTICIPANTS_MIN}
            max={SESSION_PARTICIPANTS_MAX}
            step={1}
            onChange={setParticipants}
            className="w-45"
          />
        </div>
      </div>

      {/* To do 달성도 범위 설정 */}
      <div className="flex gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="text-text-secondary text-base leading-none">
              To do 달성도 범위 설정
            </span>
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
        {/* 상단 진행시간/참여인원과 너비 맞춤 */}
        <div className="w-45 shrink-0" aria-hidden="true" />
        <div className="w-45 shrink-0" aria-hidden="true" />
      </div>

      {/* 서버 에러 배너 */}
      {serverError && (
        <div className="bg-status-error/10 text-status-error rounded-sm px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="mt-20 mb-20 flex justify-center gap-4">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="large"
          className="w-full max-w-70.5"
          disabled={isPending}
          onClick={() => router.back()}
        >
          그만두기
        </Button>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="large"
          className="w-full max-w-70.5"
          disabled={isPending}
        >
          {isPending ? "생성 중..." : "세션 만들기"}
        </Button>
      </div>
    </form>
  );
}
