"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { auth, ApiError, setToken } from "@/lib/api";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { token } = await auth.login(formData.email, formData.password);
      setToken(token);
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ email: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-fg">Welcome back</h2>
        <p className="text-fg-500 mt-1">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange("password")}
          error={errors.password}
        />

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-fg-500 hover:text-accent transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-fg-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-accent hover:text-accent-600 transition-colors"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
