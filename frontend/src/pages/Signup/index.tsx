import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import { AuthCard } from "../../components/auth/AuthCard";
import styles from "../../components/auth/AuthCard.module.css";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { PasswordField } from "../../components/ui/PasswordField";
import { PasswordStrength } from "../../components/ui/PasswordStrength";
import { TextField } from "../../components/ui/TextField";
import { ROUTES } from "../../constants/route.constant";
import { useAuth } from "../../hooks/useAuth";
import { applyServerErrors } from "../../utils/form.helper";
import { signupSchema, type SignupFormValues } from "../../validation/auth.schemas";

export default function SignupPage() {
  const { signup } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError("");
    try {
      // confirmPassword stays on the client; the API rejects unknown fields
      await signup({ name, email, password });
    } catch (error) {
      setServerError(applyServerErrors(error, setError, ["name", "email", "password"]));
    }
  });

  return (
    <AuthCard
      title="Create your account"
      subtitle="Get your team organised in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className={styles.link}>
            Sign in
          </Link>
        </>
      }
    >
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Work email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password?.message}
          hint={<PasswordStrength password={password} />}
          {...register("password")}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
