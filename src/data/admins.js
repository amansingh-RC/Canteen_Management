import { ROLES } from "@/config/auth";
export const adminAccounts = [
  {
    id: "ADM001",
    name: "Aman Singh",
    email: "aman@royalchains.com",
    password: "admin123",
    role: ROLES.ADMIN,
    initials: "AS",
  },
  {
    id: "ADM002",
    name: "Kunal ",
    email: "kunal@royalchains.com",
    password: "operator123",
    role: ROLES.OPERATOR,
    initials: "RO",
  },
];
