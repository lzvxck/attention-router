import { neon } from "@neondatabase/serverless";
import { env } from "./env";
export const db = () => neon(env.databaseUrl());
