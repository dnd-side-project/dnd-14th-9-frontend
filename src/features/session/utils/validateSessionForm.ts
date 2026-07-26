import {
  createSessionFormSchema,
  editSessionFormSchema,
  type CreateSessionFormData,
} from "../schemas";

export type SessionFormFieldKey = keyof CreateSessionFormData;

export type SessionFormErrors = Partial<Record<SessionFormFieldKey, string>>;

interface ValidateSessionFormOptions {
  /**
   * startTime의 "현재 + 5분 이후" 미래 검증 적용 여부 (기본 true).
   * 수정 시 시작 시각을 변경하지 않은 경우 false로 넘겨 검증을 생략한다.
   */
  enforceFutureStartTime?: boolean;
}

/**
 * 세션 폼 데이터를 zod 스키마로 검증합니다.
 *
 * - 검증 성공 시: `{ success: true, data }` 반환 (파싱된 데이터 포함)
 * - 검증 실패 시: `{ success: false, errors }` 반환 (필드별 첫 번째 에러 메시지 맵)
 */
export function validateSessionForm(
  data: Partial<CreateSessionFormData>,
  options?: ValidateSessionFormOptions
): { success: true; data: CreateSessionFormData } | { success: false; errors: SessionFormErrors } {
  const enforceFutureStartTime = options?.enforceFutureStartTime ?? true;
  const schema = enforceFutureStartTime ? createSessionFormSchema : editSessionFormSchema;
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: SessionFormErrors = {};

  for (const issue of result.error.issues) {
    const fieldKey = issue.path[0] as SessionFormFieldKey | undefined;
    if (fieldKey && !errors[fieldKey]) {
      errors[fieldKey] = issue.message;
    }
  }

  return { success: false, errors };
}
