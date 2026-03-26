"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";

export default function InlineOtpSignIn() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setStep("otp");
      setCooldown(60);
      toast.success("Code sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      const result = await signIn("credentials", {
        email,
        isOtpLogin: "true",
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      toast.success("Signed in! Your order will be saved to your account.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border mt-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs tracking-[0.15em] uppercase font-body font-medium">
            Sign in to track your order history
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          {step === "email" ? (
            <form onSubmit={sendOtp} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
              />
              <input
                type="tel"
                required
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-body hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-3">
              <p className="text-xs font-body text-muted-foreground">
                Code sent to <span className="text-foreground">{email}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full bg-secondary/30 border border-border px-4 py-3 text-2xl font-body tracking-[0.5em] text-center focus:outline-none focus:border-primary"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-body hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => sendOtp()}
                  disabled={cooldown > 0 || loading}
                  className="px-4 py-2.5 border border-border text-xs font-body tracking-[0.1em] uppercase hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
