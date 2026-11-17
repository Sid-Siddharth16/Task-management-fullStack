import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router";
import { AuthCard } from "../../components/auth/AuthCard";
import styles from "../../components/auth/AuthCard.module.css";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { PasswordField } from "../../components/ui/PasswordField";
import { TextField } from "../../components/ui/TextField";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";
import { applyServerErrors } from "../../utils/form.helper";
import { loginSchema, type LoginFormValues } from "../../validation/auth.schemas";

export default function LoginPage() {
  const { login, signOutReason } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  // on success GuestRoute redirects automatically
  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await login(values);
    } catch (error) {
      setServerError(applyServerErrors(error, setError, ["email", "password"]));
      resetField("password");
      setFocus("password");
    }
  });

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to={ROUTES.SIGNUP} className={styles.link}>
            Create one
          </Link>
        </>
      }
    >
      {notice && <Alert variant="success">{notice}</Alert>}
      {!notice && signOutReason === "expired" && (
        <Alert variant="info">Your session expired. Please sign in again.</Alert>
      )}
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          labelAction={
            <Link to={ROUTES.FORGOT_PASSWORD} className={styles.smallLink}>
              Forgot password?
            </Link>
          }
          {...register("password")}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
