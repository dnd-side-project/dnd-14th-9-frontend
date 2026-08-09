"use client";

import { useState, useRef, useEffect } from "react";

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
  SESSION_RATE_DEFAULT,
} from "../constants/sessionLimits";
import { useCreateSession, useUpdateSession } from "../hooks/useSessionHooks";
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
  // 소수점 비율이 와도 상한을 넘기지 않도록 내림한다.
  const achievementLimit = myProfile?.todoCompletionRate;
  const focusLimit = myProfile?.focusRate;
  const clampToLimit = (rate: number, limit: number | undefined) =>
    limit === undefined ? rate : Math.min(rate, Math.max(0, Math.floor(limit)));

  // 생성 모드: 프로필 로딩 전에 잡힌 기본값(50)이 상한을 넘으면 상한으로 낮춰 사용한다.
  // 수정 모드: 이미 저장된 값은 상한을 넘더라도 임의로 낮추지 않고, 상향 조작만 슬라이더에서 막는다.
  const achievementRange = isEdit
    ? achievementRangeInput
    : clampToLimit(achievementRangeInput, achievementLimit);
  const focusRange = isEdit ? focusRangeInput : clampToLimit(focusRangeInput, focusLimit);
  const defaultAchievementRange = clampToLimit(SESSION_RATE_DEFAULT, achievementLimit);
  const defaultFocusRange = clampToLimit(SESSION_RATE_DEFAULT, focusLimit);

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

      {/* 대표 이미지 + 카테고리 (태블릿에서만 가로 정렬, 모바일·PC는 세로) */}
      <div className="gap-xl xl:gap-xl flex flex-col md:flex-row md:items-start md:gap-5 xl:flex-col xl:items-stretch">
        {/* 대표 이미지 */}
        <div className="flex flex-col gap-2 md:w-95 md:shrink-0">
          <span className="text-text-secondary text-base">대표 이미지</span>
          {imagePreviewUrl ? (
            <div className="relative w-full">
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
              onFileSelect={handleImageSelect}
            />
          )}
          <span className="text-text-secondary text-sm">* .jpg, .png 파일만 가능해요</span>
        </div>

        {/* 카테고리 */}
        <div className="flex flex-col gap-2 md:flex-1 xl:flex-none">
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
      </div>

      {/* 세션 세부 설정 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">세션 세부 설정</span>
        <div className="flex flex-col gap-3 xl:flex-row xl:gap-5">
          {/* 시작일시 */}
          <div
            ref={datePickerContainerRef}
            className="relative w-full rounded-sm border border-gray-700 px-3 py-4 xl:flex-1"
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
                  className="max-md:w-[calc(100vw-2rem)]"
                />
              </div>
            )}
            {formErrors.startTime && (
              <span className="text-status-error text-sm">{formErrors.startTime}</span>
            )}
          </div>

          {/* 진행시간 + 참여인원 (모바일·태블릿에서 가로 정렬) */}
          <div className="grid grid-cols-2 gap-3 xl:contents">
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
              className="w-full xl:w-45"
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
              className="w-full xl:w-45"
            />
          </div>
        </div>
      </div>

      {/* To do 달성도 범위 설정 */}
      <div className="flex flex-col gap-3 xl:flex-row xl:gap-5">
        <div className="flex w-full flex-col gap-2 xl:flex-1">
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
              myFocusValue={myProfile?.todoCompletionRate}
              myFocusLabel="내 달성률"
              limit={achievementLimit}
              className="w-[80%]"
            />
          </div>
        </div>
        {/* 집중도 범위 설정 */}
        <div className="flex w-full flex-col gap-2 xl:flex-1">
          <div className="flex items-center gap-1">
            <span className="text-text-secondary text-base leading-none">집중도 범위 설정</span>
            <div className="group relative flex items-center">
              <InfoIcon size="xsmall" className="text-text-muted cursor-pointer" />
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-sm bg-gray-700 px-3 py-2 text-xs whitespace-nowrap text-gray-200">
                  내 집중도보다 높은 범위는 설정할 수 없어요.
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-sm border border-gray-700 p-4">
            <StepperSlide
              value={focusRange}
              onChange={setFocusRange}
              myFocusValue={myProfile?.focusRate}
              limit={focusLimit}
              className="w-[80%]"
            />
          </div>
        </div>
      </div>

      {/* 서버 에러 배너 */}
      {serverError && (
        <div className="bg-status-error/10 text-status-error rounded-sm px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="mt-10 mb-10 flex flex-col gap-3 md:mt-20 md:mb-20 md:flex-row md:justify-center md:gap-4">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="large"
          className="px-md py-sm md:px-xl md:py-md w-full text-xs md:max-w-70.5 md:text-base"
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
          className="px-md py-sm md:px-xl md:py-md w-full text-xs md:max-w-70.5 md:text-base"
          disabled={isPending || (isEdit && !editDirty)}
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
