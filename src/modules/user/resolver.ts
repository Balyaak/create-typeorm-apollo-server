import { Resolver, Mutation, Arg, Field, InputType } from "type-graphql";
import { User } from "../../entity/User";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { GraphQLScalarType } from "graphql";
import { GraphQLUpload } from "graphql-upload";

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

  @Mutation()
  async register(@Arg("register") registerInput: RegisterInput): Promise<User> {
    const user = this.userRepository.create({
      ...registerInput
    });
    return await this.userRepository.save(user);
  }
}
