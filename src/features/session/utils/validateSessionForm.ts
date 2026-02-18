import { createSessionFormSchema, type CreateSessionFormData } from "../schemas";

export type SessionFormFieldKey = keyof CreateSessionFormData;

export type SessionFormErrors = Partial<Record<SessionFormFieldKey, string>>;

/**
 * 세션 생성 폼 데이터를 zod 스키마로 검증합니다.
 *
 * - 검증 성공 시: `{ success: true, data }` 반환 (파싱된 데이터 포함)
 * - 검증 실패 시: `{ success: false, errors }` 반환 (필드별 첫 번째 에러 메시지 맵)
 */
export function validateSessionForm(
  data: Partial<CreateSessionFormData>
): { success: true; data: CreateSessionFormData } | { success: false; errors: SessionFormErrors } {
  const result = createSessionFormSchema.safeParse(data);

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
