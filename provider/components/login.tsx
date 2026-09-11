"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { login, logout, apiError } from "@/provider/lib/api";
import { useProviderState } from "./provider-state";

export function ProviderLoginPage() {
  const router = useRouter();
  const { user, setUser, notify } = useProviderState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // If already authenticated as PLATFORM_ADMIN, forward to dashboard
  useEffect(() => {
    if (user && user.role === "PLATFORM_ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide your admin email and password.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const authUser = await login(email.trim().toLowerCase(), password);
      if (authUser.role !== "PLATFORM_ADMIN") {
        await logout();
        const portalHint =
          authUser.role === "TENANT_ADMIN"
            ? " Use the Tenant Dashboard instead."
            : authUser.role === "CUSTOMER"
              ? " Use the Customer Portal instead."
              : "";
        throw new Error(
          `Access denied. This console requires a Platform Super Admin account.${portalHint}`,
        );
      }
      setUser(authUser);
      notify(`Welcome back, ${authUser.name}`);
    } catch (cause) {
      setError(
        apiError(
          cause,
          "Invalid credentials. Please verify your admin email and password.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="provider-login-root">
      <div className="provider-login-ambient orb-1" aria-hidden="true" />
      <div className="provider-login-ambient orb-2" aria-hidden="true" />
      <div className="provider-login-grid" aria-hidden="true" />

      <div className="provider-login-card">
        <div className="provider-login-header">
          <div className="provider-login-logo">
            <Sparkles size={24} />
          </div>
          <div className="provider-login-badge">
            <ShieldCheck size={13} />
            <span>Platform Super Admin</span>
          </div>
          <h1>Serenity Cloud</h1>
          <p>
            Command center for multi-tenant salon orchestration, subscriptions,
            and global support.
          </p>
        </div>

        <form className="provider-login-form" onSubmit={submit} noValidate>
          <div className="provider-field">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="input-group">
              <span className="input-icon">
                <Mail size={16} />
              </span>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@serenity.cloud"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="provider-field">
            <label htmlFor="admin-password">Master Password</label>
            <div className="input-group">
              <span className="input-icon">
                <LockKeyhole size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="provider-login-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            id="provider-login-submit"
            type="submit"
            className="provider-submit-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In to Super Admin</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="provider-login-footer">
          <div className="provider-portal-links">
            <span>Operating Salons?</span>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="portal-link"
            >
              Tenant Dashboard ↗
            </a>
          </div>
          <div className="security-note">
            <ShieldCheck size={12} />
            <span>Encrypted cloud session • Strict role authorization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
