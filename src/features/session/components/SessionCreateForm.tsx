"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { DatePicker } from "@/components/DatePicker/DatePicker";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { InfoIcon } from "@/components/Icon/InfoIcon";
import { ImageUploader } from "@/components/ImageUploader/ImageUploader";
import { Textarea } from "@/components/Input/Textarea";
import { TextInput } from "@/components/Input/TextInput";
import { NumericStepper } from "@/components/NumericStepper/NumericStepper";
import { StepperSlide } from "@/components/StepperSlide/StepperSlide";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { ApiError } from "@/lib/api/api-client";
import {
  ONBOARDING_CATEGORIES,
  CATEGORY_LABELS,
  getCategoryValue,
  type Category,
} from "@/lib/constants/category";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";
import {
  formatDateTimeDisplay,
  formatLocalDateTime,
  formatSessionTimeRange,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import {
  SESSION_DURATION_MINUTES_DEFAULT,
  SESSION_DURATION_MINUTES_MAX,
  SESSION_DURATION_MINUTES_MIN,
  SESSION_DURATION_MINUTES_STEP,
  SESSION_PARTICIPANTS_DEFAULT,
  SESSION_PARTICIPANTS_MAX,
  SESSION_PARTICIPANTS_MIN,
  SESSION_RATE_DEFAULT,
} from "../constants/sessionLimits";
import { useCreateSession, useUpdateSession } from "../hooks/useSessionHooks";
import { clampToRateLimit, resolveSessionRateRange } from "../utils/sessionRateLimits";
import { validateSessionForm, type SessionFormErrors } from "../utils/validateSessionForm";

import { SessionCreateConfirmDialog } from "./SessionCreateConfirmDialog";

import type { CreateSessionFormData } from "../schemas";
import type { CreateSessionRequest, SessionDetailResponse, UpdateSessionRequest } from "../types";

interface SessionCreateFormProps {
  /** "create"(기본) 또는 "edit". edit이면 sessionId·initialValues 필수 */
  mode?: "create" | "edit";
  sessionId?: string;
  initialValues?: SessionDetailResponse;
}

// 시안은 모든 텍스트의 줄 높이가 1.4. Tailwind text-xs/sm/base는 자체 줄 높이(1.33/1.43/1.5)를 쓰므로
// --tw-leading은 상속되지 않아, 폼 범위에서 크기별 줄 높이 변수를 덮어쓴다.
const LINE_HEIGHT_1_4 =
  "leading-[1.4] [--text-xs--line-height:1.4] [--text-sm--line-height:1.4] [--text-base--line-height:1.4]";
// 날짜 선택기는 이번 시안 범위 밖이라 Tailwind 기본 줄 높이로 되돌린다.
const LINE_HEIGHT_DEFAULT =
  "leading-normal [--text-xs--line-height:calc(1/0.75)] [--text-sm--line-height:calc(1.25/0.875)] [--text-base--line-height:calc(1.5/1)]";
// 시안의 선은 모두 INSIDE(패딩 안쪽)라 border로 그리면 박스가 2px 커진다. 안쪽 링은 레이아웃에 영향이 없다.
const INSIDE_RING = "ring-border-subtle ring-1 ring-inset";
// 시안의 텍스트 입력 높이는 py 포함 54(모바일 42)로, 날짜 입력(56/44)과 다른 컴포넌트다.
const TEXT_FIELD_HEIGHT = "h-[42px] md:h-[54px]";

const FIELD_LABEL = "text-text-secondary text-xs font-semibold md:text-base";

function RequiredMark() {
  return (
    <span className="text-text-status-negative-default ml-1" aria-hidden="true">
      *
    </span>
  );
}

interface RateRangeFieldProps {
  label: string;
  /** 툴팁 두 줄 (시안은 줄바꿈 위치가 고정) */
  tooltip: [string, string];
  children: ReactNode;
}

/** 투두 달성률·집중률 범위 슬라이더 공통 틀: 라벨 + 호버 툴팁 + 테두리 컨테이너 */
function RateRangeField({ label, tooltip, children }: RateRangeFieldProps) {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-1">
      <div className="group gap-2xs flex w-fit items-center">
        <span className={FIELD_LABEL}>{label}</span>
        <span className="relative flex items-center">
          <InfoIcon size="xsmall" className="text-text-muted cursor-pointer" />
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-3.5 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="bg-surface-strong text-text-tertiary px-sm py-xs w-[231px] rounded-sm text-[11px] leading-[1.4] md:w-max md:text-[15px]">
              {tooltip.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="border-t-surface-strong absolute top-full left-0 border-x-[14px] border-t-[6px] border-x-transparent" />
          </div>
        </span>
      </div>
      <div className={cn(INSIDE_RING, "rounded-md px-5 py-5 xl:px-10")}>{children}</div>
    </div>
  );
}

export function SessionCreateForm({
  mode = "create",
  sessionId,
  initialValues,
}: SessionCreateFormProps = {}) {
  const isEdit = mode === "edit";
  const { data: meData } = useMe();
  const myProfile = meData?.result;

  // edit 모드: initialValues로 초기값을 시드한다. (category는 한글 라벨→enum 역변환)
  const [roomName, setRoomName] = useState(initialValues?.title ?? "");
  const [roomDescription, setRoomDescription] = useState(initialValues?.summary ?? "");
  const [notice, setNotice] = useState(initialValues?.notice ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removedInitialImage, setRemovedInitialImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    initialValues ? getCategoryValue(initialValues.category) : null
  );

  // 세부 설정 상태
  const [startDateTime, setStartDateTime] = useState<Date | null>(
    initialValues ? new Date(initialValues.startTime) : null
  );
  const [duration, setDuration] = useState(
    initialValues?.sessionDurationMinutes ?? SESSION_DURATION_MINUTES_DEFAULT
  ); // 기본값 1시간 30분
  const [participants, setParticipants] = useState(
    initialValues?.maxParticipants ?? SESSION_PARTICIPANTS_DEFAULT
  ); // 기본값 5명
  const [achievementRangeInput, setAchievementRange] = useState(
    initialValues ? (initialValues.requiredAchievementRate ?? 0) : SESSION_RATE_DEFAULT
  ); // To do 달성도 범위
  const [focusRangeInput, setFocusRange] = useState(
    initialValues ? (initialValues.requiredFocusRate ?? 0) : SESSION_RATE_DEFAULT
  ); // 집중도 범위

  // 참여 조건은 내 달성률·집중률을 넘을 수 없다. (안내 문구와 동일한 규칙)
  const { value: achievementRange, limit: achievementLimit } = resolveSessionRateRange({
    isEdit,
    input: achievementRangeInput,
    savedRate: initialValues?.requiredAchievementRate ?? 0,
    profileRate: myProfile?.todoCompletionRate,
  });
  const { value: focusRange, limit: focusLimit } = resolveSessionRateRange({
    isEdit,
    input: focusRangeInput,
    savedRate: initialValues?.requiredFocusRate ?? 0,
    profileRate: myProfile?.focusRate,
  });
  const defaultAchievementRange = clampToRateLimit(
    SESSION_RATE_DEFAULT,
    myProfile?.todoCompletionRate
  );
  const defaultFocusRange = clampToRateLimit(SESSION_RATE_DEFAULT, myProfile?.focusRate);

  // DatePicker 팝업 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 DatePicker 닫기
  const closeDatePicker = () => setIsDatePickerOpen(false);
  useClickOutside(datePickerContainerRef, closeDatePicker, isDatePickerOpen);

  // 새로 선택한 파일의 blob 미리보기 URL.
  // 렌더 중 URL.createObjectURL을 호출하면 무관한 리렌더마다 새 URL이 생성되어
  // 이미지가 재로딩되므로, 파일 선택/삭제 이벤트에서만 생성하고 effect는 해제만 담당한다.
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
    };
  }, [selectedImageUrl]);

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    setSelectedImageUrl(file ? URL.createObjectURL(file) : null);
  };

  // edit 모드에서 기존 썸네일: 새 파일이 없고 삭제하지 않았을 때만 노출
  const initialImageUrl = initialValues?.imageUrl || null;
  const showInitialImage = !selectedImage && !removedInitialImage && !!initialImageUrl;
  const imagePreviewUrl = selectedImageUrl ?? (showInitialImage ? initialImageUrl : null);

  const handleImageRemove = () => {
    setSelectedImage(null);
    setSelectedImageUrl(null);
    setRemovedInitialImage(true);
  };

  // validation / API 연동 상태
  const [formErrors, setFormErrors] = useState<SessionFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const router = useRouter();
  const { mutate: createSession, isPending: isCreating } = useCreateSession();
  const { mutate: updateSession, isPending: isUpdating } = useUpdateSession();
  const isPending = isCreating || isUpdating;

  const clearFieldError = (field: keyof SessionFormErrors) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // edit 모드: 초기값 대비 시작 시각 변경 여부 (검증·부분전송에 재사용)
  const initialStartMs = initialValues ? new Date(initialValues.startTime).getTime() : null;
  const startTimeChanged =
    initialStartMs !== null ? (startDateTime?.getTime() ?? null) !== initialStartMs : false;

  // edit 모드: 초기값 대비 변경 여부 (변경 없으면 저장 비활성)
  const editDirty =
    isEdit && initialValues
      ? roomName !== initialValues.title ||
        roomDescription !== initialValues.summary ||
        notice !== initialValues.notice ||
        selectedCategory !== getCategoryValue(initialValues.category) ||
        startTimeChanged ||
        duration !== initialValues.sessionDurationMinutes ||
        participants !== initialValues.maxParticipants ||
        achievementRange !== (initialValues.requiredAchievementRate ?? 0) ||
        focusRange !== (initialValues.requiredFocusRate ?? 0) ||
        selectedImage !== null ||
        (removedInitialImage && !!initialImageUrl)
      : false;

  const createDirty =
    roomName.trim().length > 0 ||
    roomDescription.trim().length > 0 ||
    notice.trim().length > 0 ||
    selectedImage !== null ||
    selectedCategory !== null ||
    startDateTime !== null ||
    duration !== SESSION_DURATION_MINUTES_DEFAULT ||
    participants !== SESSION_PARTICIPANTS_DEFAULT ||
    achievementRange !== defaultAchievementRange ||
    focusRange !== defaultFocusRange;

  const hasUnsavedChanges = isEdit ? editDirty : createDirty;

  useUnsavedChangesWarning(hasUnsavedChanges && !isPending);

  // useState 값 → zod 스키마 형태로 매핑
  // 수정 시 시작 시각을 바꾸지 않았다면 "현재+5분 이후" 미래 검증을 생략한다.
  const validateForm = () =>
    validateSessionForm(
      {
        title: roomName,
        summary: roomDescription,
        notice,
        category: selectedCategory ?? undefined,
        startTime: startDateTime ?? undefined,
        sessionDurationMinutes: duration,
        maxParticipants: participants,
        requiredAchievementRate: achievementRange,
        requiredFocusRate: focusRange,
      },
      { enforceFutureStartTime: isEdit ? startTimeChanged : true }
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateForm();

    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    if (isEdit) {
      handleUpdate(validation.data);
      return;
    }

    // 생성은 확인 모달을 거친 뒤 제출한다.
    setShowCreateConfirm(true);
  };

  // 생성 확인 모달의 "세션 만들기" 클릭: 재검증 후 제출
  // (모달이 열려 있는 동안 시간이 지나 startTime 검증이 어긋날 수 있으므로 재검증)
  const handleConfirmCreate = () => {
    const validation = validateForm();

    if (!validation.success) {
      setShowCreateConfirm(false);
      setFormErrors(validation.errors);
      return;
    }

    const { data } = validation;

    // CreateSessionRequest 구성 (Date → ISO 문자열 변환)
    const body: CreateSessionRequest = {
      title: data.title,
      summary: data.summary,
      notice: data.notice,
      category: data.category,
      startTime: formatLocalDateTime(data.startTime),
      sessionDurationMinutes: data.sessionDurationMinutes,
      maxParticipants: data.maxParticipants,
      requiredFocusRate: data.requiredFocusRate,
      requiredAchievementRate: data.requiredAchievementRate,
    };

    createSession(
      { body, image: selectedImage ?? undefined },
      {
        onSuccess: () => router.push("/"),
        onError: (error) => {
          setShowCreateConfirm(false);
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          setServerError(message);
          toast.error(message);
        },
      }
    );
  };

  // edit 모드 제출: 변경된 필드만 담아 PATCH (부분 수정)
  const handleUpdate = (data: CreateSessionFormData) => {
    if (!sessionId || !initialValues) return;

    const body: UpdateSessionRequest = {};
    if (data.title !== initialValues.title) body.title = data.title;
    if (data.summary !== initialValues.summary) body.summary = data.summary;
    if (data.notice !== initialValues.notice) body.notice = data.notice;
    if (data.category !== getCategoryValue(initialValues.category)) body.category = data.category;
    if (startTimeChanged) body.startTime = formatLocalDateTime(data.startTime);
    if (data.sessionDurationMinutes !== initialValues.sessionDurationMinutes) {
      body.sessionDurationMinutes = data.sessionDurationMinutes;
    }
    if (data.maxParticipants !== initialValues.maxParticipants) {
      body.maxParticipants = data.maxParticipants;
    }
    if (data.requiredFocusRate !== (initialValues.requiredFocusRate ?? 0)) {
      body.requiredFocusRate = data.requiredFocusRate;
    }
    if (data.requiredAchievementRate !== (initialValues.requiredAchievementRate ?? 0)) {
      body.requiredAchievementRate = data.requiredAchievementRate;
    }

    const image = selectedImage ?? undefined;
    // 기존 썸네일을 삭제한 채 새 이미지를 올리지 않았다면 삭제 의도를 전달한다.
    // (image 파트가 있으면 서버가 deleteImage를 무시하고 교체하므로 교체 시에는 보내지 않는다)
    if (!image && removedInitialImage && initialImageUrl) {
      body.deleteImage = true;
    }

    if (Object.keys(body).length === 0 && !image) {
      toast.info("변경된 내용이 없어요.");
      return;
    }

    updateSession(
      { sessionId, body, image },
      {
        onSuccess: () => {
          toast.success("세션을 수정했어요.");
          router.push(`/session/${sessionId}/waiting`);
        },
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          setServerError(message);
          toast.error(message);
        },
      }
    );
  };

  return (
    <form
      className={cn("flex w-full flex-col gap-6 md:gap-11 xl:gap-16", LINE_HEIGHT_1_4)}
      onSubmit={handleSubmit}
    >
      {/* 이름 · 한 줄 소개 · 공지사항 */}
      <div className="flex flex-col gap-4 md:gap-5">
        <TextInput
          label="세션 이름"
          required
          placeholder="예) 아침 코딩 모각작"
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
          fullWidth
          className={TEXT_FIELD_HEIGHT}
        />

        <TextInput
          label="한 줄 소개"
          required
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
          fullWidth
          className={TEXT_FIELD_HEIGHT}
        />

        <Textarea
          label="공지사항"
          required
          placeholder="예) 세션의 규칙을 작성해 주세요"
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
          className="max-w-full"
        />
      </div>

      {/* 대표 이미지 + 카테고리 (모바일은 세로, md 이상 50:50 가로) */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex flex-col gap-2 md:flex-1 md:gap-4">
          <span className={FIELD_LABEL}>대표 이미지</span>
          {imagePreviewUrl ? (
            <div className="relative w-full">
              <Image
                src={imagePreviewUrl}
                alt="대표 이미지 미리보기"
                width={574}
                height={224}
                unoptimized
                className="border-border-strong h-56 w-full rounded-sm border object-cover"
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
              mainText="대표 이미지를 등록해 주세요"
              hintText="최대 5MB의 jpg와 png만 가능해요"
              accept="image/jpeg,image/png"
              onFileSelect={handleImageSelect}
              className="md:h-56"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-1 md:gap-4">
          <span className={FIELD_LABEL}>
            카테고리
            <RequiredMark />
          </span>
          <div className="gap-xs md:gap-sm flex flex-wrap">
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
      </div>

      {/* 일정: 시작 일시 · 진행 시간 (모바일은 카드가 분리됨) */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <span className={FIELD_LABEL}>
            일정
            <RequiredMark />
          </span>
          {startDateTime && (
            <span className="text-text-disabled gap-2xs flex items-center text-xs md:text-base">
              <ClockIcon size="xsmall" aria-hidden="true" />
              {formatSessionTimeRange(startDateTime, duration)}
            </span>
          )}
        </div>

        <div
          className={cn(
            INSIDE_RING,
            "flex flex-col gap-3 rounded-md p-3 md:flex-row md:items-start md:gap-6 md:p-6"
          )}
        >
          {/* 시작 일시 */}
          <div ref={datePickerContainerRef} className="relative w-full md:flex-1">
            <div className="flex flex-col gap-3 md:gap-2">
              <span className="text-text-tertiary md:text-text-secondary text-xs font-semibold md:text-base">
                시작 일시
              </span>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                aria-expanded={isDatePickerOpen}
                className={cn(
                  "bg-surface-strong px-md flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-sm border text-left text-[13px] md:h-14 md:text-base",
                  "focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none",
                  startDateTime
                    ? "border-border-default text-text-primary"
                    : "border-border-subtle text-text-muted"
                )}
              >
                <span>{startDateTime ? formatDateTimeDisplay(startDateTime) : "MM.DD 00:00"}</span>
                <CalendarIcon size="medium" className="text-text-muted shrink-0" />
              </button>
            </div>

            {isDatePickerOpen && (
              <div
                className={cn(
                  "bg-surface-default border-border-subtle absolute top-full left-0 z-10 mt-1 rounded-md border shadow-lg",
                  LINE_HEIGHT_DEFAULT
                )}
              >
                <DatePicker
                  mode="single"
                  showTimePicker
                  value={startDateTime}
                  onChange={(date) => {
                    setStartDateTime(date);
                    clearFieldError("startTime");
                  }}
                  className="max-md:w-[calc(100vw-2rem)]"
                />
              </div>
            )}
            {formErrors.startTime && (
              <span className="text-status-error text-sm">{formErrors.startTime}</span>
            )}
          </div>

          {/* 진행 시간 (md 이상: 시작 일시와 같은 카드에 가로 배치) */}
          <div className="py-xs hidden w-full items-center justify-between gap-3 md:flex md:flex-1">
            <div className="gap-2xs flex flex-col">
              <span className="text-text-secondary text-base font-semibold">진행 시간</span>
              <span className="text-text-muted text-xs break-keep">5분 단위로 설정이 가능해요</span>
            </div>
            <NumericStepper
              label="진행 시간"
              hint="5분 단위로 설정이 가능해요"
              hideHeader
              value={duration}
              displayValue={`${duration}분`}
              min={SESSION_DURATION_MINUTES_MIN}
              max={SESSION_DURATION_MINUTES_MAX}
              step={SESSION_DURATION_MINUTES_STEP}
              onChange={setDuration}
              className="border-none p-0"
            />
          </div>
        </div>

        {/* 모바일: 진행 시간 + 참여 인원 2열 카드 */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className={cn(INSIDE_RING, "flex flex-col gap-3 rounded-md p-3")}>
            <div className="gap-3xs flex flex-col">
              <span className="text-text-tertiary text-xs font-semibold">진행 시간</span>
              <span className="text-text-muted text-[10px] break-keep">
                5분 단위로 설정이 가능해요
              </span>
            </div>
            <NumericStepper
              label="진행 시간"
              hint="5분 단위로 설정이 가능해요"
              hideHeader
              value={duration}
              displayValue={`${duration}분`}
              min={SESSION_DURATION_MINUTES_MIN}
              max={SESSION_DURATION_MINUTES_MAX}
              step={SESSION_DURATION_MINUTES_STEP}
              onChange={setDuration}
              className="mt-auto border-none p-0"
            />
          </div>
          <div className={cn(INSIDE_RING, "flex flex-col gap-3 rounded-md p-3")}>
            <div className="gap-3xs flex flex-col">
              <span className="text-text-tertiary text-xs font-semibold">참여 인원</span>
              <span className="text-text-muted text-[10px] break-keep">최대 10명까지 가능해요</span>
            </div>
            <NumericStepper
              label="참여 인원"
              hint="최대 10명까지 가능해요"
              hideHeader
              value={participants}
              displayValue={`${participants}명`}
              min={SESSION_PARTICIPANTS_MIN}
              max={SESSION_PARTICIPANTS_MAX}
              step={1}
              onChange={setParticipants}
              className="mt-auto border-none p-0"
            />
          </div>
        </div>
      </div>

      {/* 참여 인원 (md 이상: 테두리 카드) */}
      <div
        className={cn(
          INSIDE_RING,
          "hidden w-full items-center justify-between gap-6 rounded-md p-6 md:flex"
        )}
      >
        <div className="gap-2xs flex flex-col">
          <span className="text-text-secondary text-base font-semibold">참여 인원</span>
          <span className="text-text-muted text-xs break-keep">최대 10명까지 가능해요</span>
        </div>
        <NumericStepper
          label="참여 인원"
          hint="최대 10명까지 가능해요"
          hideHeader
          value={participants}
          displayValue={`${participants}명`}
          min={SESSION_PARTICIPANTS_MIN}
          max={SESSION_PARTICIPANTS_MAX}
          step={1}
          onChange={setParticipants}
          className="border-none p-0"
        />
      </div>

      {/* 투두 달성률 범위 + 집중률 범위 */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-5">
        <RateRangeField
          label="투두 달성률 범위"
          tooltip={[
            "참여 가능한 투두 달성률 범위를 설정해요.",
            "단, 나의 투두 달성률보다 높은 범위는 설정할 수 없어요.",
          ]}
        >
          <StepperSlide
            value={achievementRange}
            onChange={setAchievementRange}
            myFocusValue={myProfile?.todoCompletionRate}
            myFocusLabel="내 달성률"
            limit={achievementLimit}
            className="w-full"
          />
        </RateRangeField>
        <RateRangeField
          label="집중률 범위"
          tooltip={[
            "참여 가능한 집중률 범위를 설정해요.",
            "단, 나의 집중률보다 높은 범위는 설정할 수 없어요.",
          ]}
        >
          <StepperSlide
            value={focusRange}
            onChange={setFocusRange}
            myFocusValue={myProfile?.focusRate}
            myFocusLabel="내 집중률"
            limit={focusLimit}
            className="w-full"
          />
        </RateRangeField>
      </div>

      {/* 서버 에러 배너 */}
      {serverError && (
        <div className="bg-status-error/10 text-status-error rounded-sm px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      {/* 버튼 그룹: 입력이 없는 초기 상태에서는 제출 비활성. 시안의 "그만두기"는 md 이상에서 폭 77 고정 */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 md:mt-7 xl:mt-8">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="medium"
          className="md:py-md md:h-13.5 md:w-[77px] md:px-0 md:text-base"
          disabled={isPending}
          onClick={() => router.back()}
        >
          그만두기
        </Button>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="medium"
          className="md:px-xl md:py-md md:h-13.5 md:text-base"
          disabled={isPending || !hasUnsavedChanges}
        >
          {isEdit
            ? isPending
              ? "수정 중..."
              : "수정 완료"
            : isPending
              ? "생성 중..."
              : "세션 만들기"}
        </Button>
      </div>

      {showCreateConfirm && (
        <SessionCreateConfirmDialog
          onClose={() => setShowCreateConfirm(false)}
          onConfirm={handleConfirmCreate}
          isPending={isCreating}
        />
      )}
    </form>
  );
}
