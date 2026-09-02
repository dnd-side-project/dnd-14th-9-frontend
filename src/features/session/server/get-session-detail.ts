import { cache } from "react";

import { sessionServerApi } from "./api";

export const getSessionDetail = cache(sessionServerApi.getDetail);
