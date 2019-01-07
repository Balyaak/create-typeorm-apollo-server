import { InputType, Field } from "type-graphql";
import { User } from "../../entity/User";
import { IsEmail, MinLength, MaxLength, IsString } from "class-validator";

@InputType()
export class LoginInput implements Partial<User> {
  @Field()
  @IsEmail()
  @IsString()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;
}
