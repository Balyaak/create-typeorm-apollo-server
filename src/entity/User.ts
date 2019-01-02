import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import * as argon2 from "argon2";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("text")
  password: string;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await argon2.hash(this.password, { hashLength: 12 });
  }
}
