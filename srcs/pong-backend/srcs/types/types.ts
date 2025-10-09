export type User = 
{
  id: number;
  email: string;
  username: string;
  password: string;
  created_at: string;
};

export type RegisterBody =
{
  email: string;
  username: string;
  password: string;
};