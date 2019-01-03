import { Resolver, Mutation, Arg, Field, InputType, Query } from "type-graphql";
import { User } from "../../entity/User";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

@InputType()
export class RegisterInput implements Partial<User> {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver(User)
export class UserResolver {
  constructor() {}

  @Query(() => String)
  async me() {
    return "hi";
  }

  @Mutation(returns => User)
  async register(@Arg("register") registerInput: RegisterInput): Promise<User> {
    const user = User.create({
      ...registerInput
    });
    return await User.save(user);
  }
}
