import { http, HttpResponse } from "msw";

import type {
  CreateSubtaskRequest,
  UpdateGoalRequest,
  UpdateTodoRequest,
} from "@/features/task/api";

import { MockJsonParseError, readRequiredJson } from "./json";
import {
  createMockSubtasks,
  deleteMockSubtask,
  MockSubtaskNotFoundError,
  MockTaskNotFoundError,
  toggleMockSubtaskCompletion,
  updateMockSubtask,
  updateMockTaskGoal,
} from "./session-state";
import { fail, ok } from "./utils";

function toNumber(value: string | readonly string[] | undefined): number {
  return Number(Array.isArray(value) ? value[0] : value) || 0;
}

async function taskJson<T>(producer: () => T | Promise<T>) {
  try {
    return HttpResponse.json(ok(await producer()));
  } catch (error) {
    if (error instanceof MockTaskNotFoundError) {
      return HttpResponse.json(fail("TASK404_1", "존재하지 않는 목표입니다.", "NOT_FOUND"), {
        status: 404,
      });
    }
    if (error instanceof MockSubtaskNotFoundError) {
      return HttpResponse.json(fail("SUBTASK404_1", "존재하지 않는 할 일입니다.", "NOT_FOUND"), {
        status: 404,
      });
    }
    if (error instanceof MockJsonParseError) {
      return HttpResponse.json(fail("COMMON400", error.message, "BAD_REQUEST"), { status: 400 });
    }

    throw error;
  }
}

export const taskHandlers = [
  http.patch("*/api/tasks/:taskId", ({ request, params }) => {
    return taskJson(async () => {
      const body = await readRequiredJson<UpdateGoalRequest>(request, "task goal update");
      updateMockTaskGoal(toNumber(params.taskId), body.goalContent);
      return null;
    });
  }),

  http.post("*/api/tasks/:taskId/subtasks", ({ request, params }) => {
    return taskJson(async () => {
      const body = await readRequiredJson<CreateSubtaskRequest>(request, "subtask create");
      return createMockSubtasks(toNumber(params.taskId), body);
    });
  }),

  http.patch("*/api/subtasks/:subtaskId", ({ request, params }) => {
    return taskJson(async () => {
      const body = await readRequiredJson<UpdateTodoRequest>(request, "subtask update");
      updateMockSubtask(toNumber(params.subtaskId), body.todoContent);
      return null;
    });
  }),

  http.delete("*/api/subtasks/:subtaskId", ({ params }) => {
    return taskJson(() => {
      deleteMockSubtask(toNumber(params.subtaskId));
      return null;
    });
  }),

  http.post("*/api/subtasks/:subtaskId/completion", ({ params }) => {
    return taskJson(() => {
      toggleMockSubtaskCompletion(toNumber(params.subtaskId));
      return null;
    });
  }),
];
