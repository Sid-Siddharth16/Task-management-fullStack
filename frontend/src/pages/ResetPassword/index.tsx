import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authService } from "../../api/services/auth.service";
import { AuthCard } from "../../components/auth/AuthCard";
import styles from "../../components/auth/AuthCard.module.css";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { PasswordField } from "../../components/ui/PasswordField";
import { PasswordStrength } from "../../components/ui/PasswordStrength";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";
import { applyServerErrors } from "../../utils/form.helper";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../../validation/auth.schemas";

export default function ResetPasswordPage() {
  const { clearSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // read once, then strip it from the address bar so it doesn't linger in history
  const [token] = useState(() => searchParams.get("token"));
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (searchParams.has("token")) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  const requestNewLink = (
    <Link to={ROUTES.FORGOT_PASSWORD} className={styles.link}>
      Request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" footer={requestNewLink}>
        <Alert variant="error">
          This password reset link is missing or malformed. Please request a new one.
        </Alert>
      </AuthCard>
    );
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    setServerError("");
    try {
      const message = await authService.resetPassword({ token, password });
      // all sessions were revoked server-side; drop ours too
      clearSession();
      navigate(ROUTES.LOGIN, { replace: true, state: { notice: message } });
    } catch (error) {
      setServerError(applyServerErrors(error, setError, ["password"]));
    }
  });

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before. You'll be signed out everywhere."
      footer={requestNewLink}
    >
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          autoFocus
          error={errors.password?.message}
          hint={<PasswordStrength password={password} />}
          {...register("password")}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
