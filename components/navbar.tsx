"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) setUser(session.user);
        else setUser(null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      setUser(null);
      setIsProfileDropdownOpen(false);
      router.push("/");
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-dark text-white py-4 shadow-md relative z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="w-[150px] flex-shrink-0">
          <Image
            src="/assets/image/logo.png"
            alt="Brand Logo"
            width={100}
            height={100}
            className="h-auto max-w-full"
          />
        </Link>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <ul className="hidden md:flex items-center space-x-8 text-lg font-medium">
          <li>
            <Link
              href="/"
              className={`hover:text-primary transition-colors duration-200 ${
                isActive("/") ? "text-primary" : ""
              }`}
            >
              Beranda
            </Link>
          </li>
          <li>
            <Link
              href="/courses"
              className={`hover:text-primary transition-colors duration-200 ${
                isActive("/courses") ? "text-primary" : ""
              }`}
            >
              Kelas
            </Link>
          </li>
        </ul>

        {user ? (
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <Image
                src={
                  user.user_metadata?.avatar_url || "/assets/image/profile.png"
                }
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full border-2 border-primary-darker object-cover"
              />
              <span className="text-white font-medium">
                {user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "Pengguna"}
              </span>
              <svg
                className={`ml-1 w-4 h-4 transform transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <ul className="absolute top-full right-0 mt-2 w-48 bg-card border border-card-border rounded-md shadow-lg py-2 z-20">
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-card rounded-md transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link href="/auth/login">
            <button className="hidden md:block bg-primary hover:bg-primary-darker text-dark-font font-semibold py-2 px-6 rounded-lg shadow-md shadow-primary-darker transition-all duration-300 transform">
              Masuk
            </button>
          </Link>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-dark pb-4 shadow-lg">
          <ul className="flex flex-col items-center space-y-4 text-lg font-medium py-4">
            <li>
              <Link
                href="/"
                className={`block hover:text-primary transition-colors duration-200 ${
                  isActive("/") ? "text-primary" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className={`block hover:text-primary transition-colors duration-200 ${
                  isActive("/courses") ? "text-primary" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kelas
              </Link>
            </li>

            {user ? (
              <>
                <li className="relative w-full text-center">
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center justify-center gap-2 w-full text-white hover:text-primary transition-colors duration-200 focus:outline-none"
                  >
                    <Image
                      src={
                        user.user_metadata?.avatar_url ||
                        "/assets/image/profile.png"
                      }
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-primary-darker object-cover"
                    />
                    <span className="font-medium">
                      {user.user_metadata?.full_name ||
                        user.email?.split("@")[0] ||
                        "Pengguna"}
                    </span>
                    <svg
                      className={`ml-1 w-4 h-4 transform transition-transform duration-200 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {isProfileDropdownOpen && (
                    <ul className="mt-2 w-full bg-card border border-card-border rounded-md shadow-lg py-2 z-20">
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-card rounded-md transition-colors duration-200"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <li>
                <Link href="/auth/login">
                  <button className="bg-primary hover:bg-primary-darker text-dark-font font-semibold py-2 px-6 rounded-lg shadow-md shadow-primary-darker transition-all duration-300 transform">
                    Masuk
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
