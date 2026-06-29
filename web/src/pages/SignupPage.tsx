import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerRequest } from "../api/auth.api";
import { getApiErrorMessage } from "../utils/apiError";
import { AuthLayout } from "../features/auth/AuthLayout";
import { AuthField } from "../features/auth/AuthField";
import { AuthDivider } from "../features/auth/AuthDivider";
import { GoogleSignInButton } from "../features/auth/GoogleSignInButton";
import { Button } from "../components/shared/Button";

export default function SignupPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/chat" replace />;

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { user: created } = await registerRequest({ name, email, password });
      login(created);
      navigate("/chat");
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <header className="mb-8">
        <h2 className="m-0 mb-1.5 font-display text-2xl font-bold tracking-tight text-fg">
          Create account
        </h2>
        <p className="m-0 text-sm text-muted">Join the conversation.</p>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-danger/25 bg-danger-surface px-3.5 py-2.5 text-[0.825rem] text-danger"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
        className="space-y-4"
      >
        <AuthField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          autoComplete="name"
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth isLoading={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <AuthDivider />
      <GoogleSignInButton text="signup_with" onError={setError} />

      <p className="mt-6 text-center text-[0.825rem] text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
