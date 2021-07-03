import { cors, route, server } from "../../../packages/http/dist";
import { auth } from "../Middleware/Auth";

export const hts = server([cors(), auth(), route()]);
