import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from "type-graphql";
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
  async me(@Ctx() { req }: Context) {
    console.log(req.session!.userId);
    return User.findOne(req.session!.userId);
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
    return "Registration successful";
  }
  // const {userId} = req.session!;
  @Mutation(() => String)
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

    session.userId = user.id;

    if (req.sessionID) {
      await redis.lpush(`sess:${user.id}`, req.sessionID);
    }
    return "Successful";
  }

  @Mutation(() => Boolean)
  async logout(@Arg("userId") userId: string, @Ctx() ctx: Context) {
    // console.log(req);
    console.log(ctx.req.session);
    console.log(ctx.req.session!.userId);
    console.log(ctx.session);
    console.log(ctx.session.userId);

    return true;
    // console.log(`USER ID         : ${req.session!.userId}`); // WILL BE UNDEFINED SINCE userId only exist on session.userId
    // console.log(`SESSION USER ID : ${session.userId}`); // Session.userId is never set
    // const sessionIds = await redis.lrange(`sess:${userId}`, 0, -1); // req.session!.userId === undefinded for some reason
    // console.log(`SESSION ID : ${sessionIds}`);
    // await redis.del(`sess:${sessionIds}`);

    // return new Promise(res =>
    //   req.session!.destroy(err => {
    //     console.log(err);
    //     res(!!err);
    //   })
    // );
  }
}
