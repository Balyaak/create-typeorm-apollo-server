import { AuthChecker } from "type-graphql";
import { Context } from "../types/Context";

export const customAuthChecker: AuthChecker<Context> = ({ context }) => {
  console.log(context.req.session!.userId);
  return context.req.sessionID && context.req.session!.userId;
};
