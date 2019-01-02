import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

import * as argon2 from "argon2";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Field()
  @Column("varchar", { length: 255 })
  email: string;

  @Field()
  @Column("text")
  password: string;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await argon2.hash(this.password, { hashLength: 12 });
  }
}
