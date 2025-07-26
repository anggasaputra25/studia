"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?error=401");
        return;
      }

      // cek apakah user sudah ada di tabel users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // jika user belum ada di tabel users, tambahkan
      if (userError || !userData) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id,
            name: user.user_metadata.full_name || user.email,
            role: "user",
          },
        ]);

        if (insertError) {
          // gagal insert ke tabel users, logout dan tolak akses
          await supabase.auth.signOut();
          router.push("/auth/login?error=403");
          return;
        }
      }

      router.push("/");
    };

    checkUser();
  }, [router, supabase]);

  return <div className="text-white text-center p-8">Mengecek akun kamu...</div>;
}
