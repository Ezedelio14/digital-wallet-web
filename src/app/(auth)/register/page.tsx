import type { Metadata } from "next";
import { RegisterForm } from "@/components/shared/auth-forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return <RegisterForm />;
}
