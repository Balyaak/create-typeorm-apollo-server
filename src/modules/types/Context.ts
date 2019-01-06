import { Request } from "express";
import { Redis } from "ioredis";

export interface Session extends Express.Session {
  userId?: string;
}

export interface Context {
  req: Request;
  session: Session;
  redis: Redis;
}
