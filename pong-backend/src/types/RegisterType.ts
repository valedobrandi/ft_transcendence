import { playerStatus } from "../enum_status/enum_userStatus.js";

export type User = 
{
  id: number;
  email: string;
  username: string;
  password: string;
  avatar_url: string | null;
  status: playerStatus;
  wins: number;
  losses: number;
  twoFA_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type RegisterBody =
{
  email: string;
  username: string;
  password: string;
};