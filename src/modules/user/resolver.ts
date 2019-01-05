import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { User } from "../../entity/User";
import { RegisterInput } from "./registr-input";
import { LoginInput } from "./login-input";
import * as argon2 from "argon2";
import { Context } from "../types/Context";

//@todo : Add response object
@Resolver(User)
export class UserResolver {
  constructor() {}

  @Query(returns => User, { nullable: true })
  async me(@Arg("id", type => String) id: string, @Ctx() { session }: Context) {
    const later = "{where: { id: session.userId } }";
    return await User.findOne({ where: { id: session.userId } });
  }

  @Mutation(returns => String)
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

  @Mutation(returns => String)
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { req, session, redis }: Context
  ) {
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
