import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { AuthCard } from "../../components/auth/AuthCard";
import styles from "../../components/auth/AuthCard.module.css";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { ROUTES } from "../../constants/route.constant";
import { authService } from "../../api/services/auth.service";
import { applyServerErrors } from "../../utils/form.helper";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../validation/auth.schemas";

const backToLogin = (
  <Link to={ROUTES.LOGIN} className={styles.link}>
    ← Back to sign in
  </Link>
);

export default function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setServerError("");
    try {
      setSentMessage(await authService.forgotPassword(email));
    } catch (error) {
      setServerError(applyServerErrors(error, setError, ["email"]));
    }
  });

  if (sentMessage) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="The link expires in 15 minutes. Check your spam folder if it doesn't arrive."
        footer={backToLogin}
      >
        <Alert variant="success">{sentMessage}</Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a link to reset it."
      footer={backToLogin}
    >
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
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
