import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth.api";
import { getApiErrorMessage } from "../utils/apiError";
import { AuthLayout } from "../features/auth/AuthLayout";
import { AuthField } from "../features/auth/AuthField";
import { AuthDivider } from "../features/auth/AuthDivider";
import { GoogleSignInButton } from "../features/auth/GoogleSignInButton";
import { Button } from "../components/shared/Button";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/chat" replace />;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { user: signedIn } = await loginRequest({ email, password });
      login(signedIn);
      navigate("/chat");
    } catch (err) {
      setError(getApiErrorMessage(err, "Wrong email or password. Try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <header className="mb-8">
        <h2 className="m-0 mb-1.5 font-display text-2xl font-bold tracking-tight text-fg">
          Welcome back
        </h2>
        <p className="m-0 text-sm text-muted">Your conversations are waiting.</p>
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <Button type="submit" fullWidth isLoading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <AuthDivider />
      <GoogleSignInButton text="signin_with" onError={setError} />

      <p className="mt-6 text-center text-[0.825rem] text-muted">
        No account?{" "}
        <Link to="/signup" className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
