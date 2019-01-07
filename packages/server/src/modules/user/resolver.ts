import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { User } from "../../entity/User";
import { RegisterInput } from "./registr-input";
import { LoginInput } from "./login-input";
import * as argon2 from "argon2";
import { Context } from "../types/Context";

// @todo : Add response object
@Resolver(User)
export class UserResolver {
  constructor() {}

  @Query(() => User, { nullable: true })
  async me(@Ctx() { session }: Context) {
    return User.findOne({ where: { id: session.userId } });
  }

  @Mutation(() => String)
  async register(@Arg("input") { email, password }: RegisterInput) {
    const userAlreadyExists = await User.findOne({
      where: { email },
      select: ["id"]
    });

    if (userAlreadyExists) {
      return "Email is in use";
    }

    await User.create({
      email,
      password
    }).save();
    return "Registration succesful";
  }

  @Mutation(() => String)
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { req, session, redis }: Context
  ) {
    if (req.session!.userId) {
      return "Already logged in";
    }
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return "Invalid login";
    }

    const passwordValid = argon2.verify(user.password, password);
    if (!passwordValid) {
      return "Invalid login";
    }

    session.userId! = user.id;

    if (req.sessionID) {
      await redis.lpush(`sess:${user.id}`, req.sessionID);
    }
    return "Successful";
  }
}
