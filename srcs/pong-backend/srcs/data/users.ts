import fs from 'fs';
import path from 'path';
import { User } from '../types/types.js';

const usersFile = path.join('./srcs/data/users.json');

export let users: User[] = [];

// Charger les utilisateurs existants dans users 
try {
  const data = fs.readFileSync(usersFile, 'utf-8');
  users = JSON.parse(data);
} catch (err) {
  console.log('users.json not found.');
}

// Fonction pour sauvegarder les utilisateurs
export const saveUsers = () => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};