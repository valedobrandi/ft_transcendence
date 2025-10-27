import { playerStatus } from "../enum_status/enum_userStatus.js";

export type User = 
{
  id: number;
  email: string;
  username: string;
  password: string;
  avatar: string;
  status: playerStatus;
  wins: number;
  losses: number;
  created_at: string;
  updated_at: string;
};

export type RegisterBody =
{
  id: number;
  email: string;
  username: string;
  password: string;
};