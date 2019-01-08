import { ObjectType, Field } from "type-graphql";
import { v4 } from "uuid";

@ObjectType()
export class Response {
  constructor(path: string, message: string, error?: boolean, stacktrace?: string) {
    this.id = v4();
    this.path = path;
    this.message = message;
    this.error = error ? error : false;
    this.stacktrace = stacktrace ? stacktrace : '';
  }

  id: string;

  @Field()
  error: boolean;

  @Field()
  path: string;

  @Field()
  message: string;

  @Field()
  stacktrace: string;
}
