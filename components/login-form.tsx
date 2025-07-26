"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- LOGIN Email + Password ---
  const handleEmailLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErrorMsg("Email atau password salah.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError || !userData) {
      setErrorMsg("403 - Akses Ditolak. Kamu belum terdaftar.");
      await supabase.auth.signOut();
      return;
    }

    router.push("/");
  };

  // --- LOGIN Google ---
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg("Gagal login dengan Google.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <input
        className="py-6 px-8 text-white bg-background border card-border rounded-lg"
        placeholder="Email.."
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="py-6 px-8 text-white bg-background border card-border rounded-lg"
        placeholder="Password.."
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleEmailLogin}
        className="bg-primary hover:bg-primary-darker text-background font-bold py-4 px-8 text-lg rounded-lg drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300 transform"
      >
        Masuk !
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-white hover:bg-white text-background font-bold py-4 px-8 text-lg rounded-lg drop-shadow-[0px_4px_0px#121212] transition-all duration-300 transform flex justify-center items-center gap-2"
      >
        Masuk dengan Google
        <Image
          src="/assets/image/google.png"
          width={30}
          height={30}
          alt="Google"
        ></Image>
      </button>

      {errorMsg && <p className="text-red-400 mt-2">{errorMsg}</p>}
    </div>
  );
}
