export type User = 
{
  id: number;
  email: string;
  username: string;
  password: string;
};

export type RegisterBody =
{
  email: string;
  username: string;
  password: string;
};