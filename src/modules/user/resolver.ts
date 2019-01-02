import { Resolver, Mutation, Arg, Field, InputType } from "type-graphql";
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
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  @Mutation(returns => User)
  async register(@Arg("register") registerInput: RegisterInput): Promise<User> {
    const user = this.userRepository.create({
      ...registerInput
    });
    return await this.userRepository.save(user);
  }
}
