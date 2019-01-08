import { AuthChecker } from "type-graphql";
import { Context } from "../modules/types/Context";

export const customAuthChecker: AuthChecker<Context> = ({ context }) => {
  return context.req.session && context.req.session.userId; // or false if access denied
};
