import { cache } from "react";

import { sessionApi } from "../api";

export const getSessionDetail = cache(sessionApi.getDetail);
