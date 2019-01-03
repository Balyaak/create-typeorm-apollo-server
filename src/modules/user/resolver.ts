import { Resolver, Mutation, Arg, Query } from "type-graphql";
import { User } from "../../entity/User";
import { RegisterInput } from "../types/registr-input";

@Resolver(User)
export class UserResolver {
  constructor() {}

  @Query(returns => User, { nullable: true })
  async me(@Arg("id", type => String) id: string) {
    return await User.findOne(id);
  }

  @Mutation(returns => String)
  async register(@Arg("input") input: RegisterInput) {
    const { email, username, password } = input;
    const userEmailAlreadyExists = await User.findOne({
      where: { email },
      select: ["id"]
    });
    const userNameAlreadyExists = await User.findOne({
      where: { username },
      select: ["id"]
    });
    if (userEmailAlreadyExists && userNameAlreadyExists) {
      return "Username and email are in use";
    }
    if (userEmailAlreadyExists) {
      return "Email is in use";
    }

    if (userNameAlreadyExists) {
      return "Username is in use";
    }
    await User.create({
      email,
      username,
      password
    }).save();
    return "Registration succesful";
  }
}
