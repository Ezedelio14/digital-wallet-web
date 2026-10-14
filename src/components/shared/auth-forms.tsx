"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useLogin, useRegister } from "@/hooks/use-auth";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validators";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} icon={<Lock />} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 animate-fade-up">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("expired")) {
      toast.info("Sua sessão expirou. Entre novamente.");
    }
  }, []);

  function onSubmit(values: LoginInput) {
    login.mutate(values, {
      onError: (error) => toast.error(getErrorMessage(error, "Não foi possível entrar.")),
    });
  }

  return (
    <>
      <AuthHeading title="Bem-vindo de volta" subtitle="Entre para acessar sua carteira digital." />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid animate-fade-up gap-5 [animation-delay:80ms]"
        noValidate
      >
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            icon={<Mail />}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <Button type="submit" size="lg" loading={login.isPending} className="mt-1">
          Entrar
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Criar carteira
          </Link>
        </p>
      </form>
    </>
  );
}

export function RegisterForm() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterInput) {
    registerUser.mutate(values, {
      onSuccess: () =>
        toast.success("Conta criada!", { description: "Sua carteira em USD já está ativa." }),
      onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar a conta.")),
    });
  }

  return (
    <>
      <AuthHeading
        title="Crie sua carteira"
        subtitle="Uma carteira em USD é provisionada automaticamente."
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid animate-fade-up gap-5 [animation-delay:80ms]"
        noValidate
      >
        <Field label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Seu nome"
            icon={<User />}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            icon={<Mail />}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Senha" htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Mín. 6 caracteres"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </Field>
          <Field label="Confirmar" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repita a senha"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </Field>
        </div>
        <Button type="submit" size="lg" loading={registerUser.isPending} className="mt-1">
          Criar conta
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </>
  );
}
