import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from "type-graphql";
import { User } from "../../entity/User";
import { RegisterInput } from "./registr-input";
import { LoginInput } from "./login-input";
import * as argon2 from "argon2";
import { Context } from "../types/Context";
import { Response } from "../../entity/Response";
import { formatResponse } from "../../utils/foramtResponse";

// @todo : Add response object
@Resolver(User)
export class UserResolver {
  constructor() {}

  @Query(() => User, { nullable: true })
  async me(@Ctx() { session }: Context) {
    return User.findOne({ where: { id: session.userId } });
  }

  @Mutation(() => Response)
  async register(@Arg("input") { email, password }: RegisterInput) {
    const userAlreadyExists = await User.findOne({
      where: { email },
      select: ["id"]
    });

    if (userAlreadyExists) {
      return formatResponse(new Response("Email", "Email is in use", true));
    }

    await User.create({
      email,
      password
    }).save();
    return formatResponse(new Response("Success", "You successfully registered a new user"));
  }

  @Mutation(() => Response)
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { req, session, redis }: Context
  ) {
    if (req.session!.userId) {
      return formatResponse(new Response("Success", "You are successfully logged in"));
    }
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return formatResponse(new Response("Login", "invalid login", true));
    }

    const passwordValid = argon2.verify(user.password, password);
    if (!passwordValid) {
      return new Response("Login", "invalid login", true);
    }

    session.userId! = user.id;

    if (req.sessionID) {
      await redis.lpush(`sess:${user.id}`, req.sessionID);
    }
    return formatResponse(new Response("Success", "You are successfully logged in"));
  }

  @Authorized()
  @Mutation(() => Response, {nullable: true})
  async logout(
    @Ctx() { session, redis }: Context,
    @Arg("logoutAll") logoutAll?: boolean,
  ) {
    try {
      const sessionIds = await redis.lrange(`sess:${session.userId}`, 0, -1);
      if (logoutAll) {
        const promises = [];
        for (const sessionId of sessionIds) {
          promises.push(redis.del(`sess:${sessionId}`));
        }
        await Promise.all(promises);
        return formatResponse(new Response("Success", "You are successfully logged out"));
      } else {
        await redis.lrem(`sess:${session.userId}`, 0, `sess:${session.id}`);
      }

      session.destroy(err => {
        if (err) {
          console.log(err);
        }
      });
      return formatResponse(new Response("Success", "You are successfully logged out"));
    } catch (err) {
      return formatResponse(new Response("Error", "No active sessions", true));
    }
  }
}
