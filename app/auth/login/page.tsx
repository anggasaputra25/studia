import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden min-h-screen bg-background flex justify-center items-center p-4 bg-dark mb-20 md:mb-32 lg:mb-40">
      <div className="container mx-auto px-4">
        <div className="bg-card border card-boder rounded-lg flex flex-col lg:flex-row items-center justify-between px-4 py-6 lg:px-12 lg:py-20 relative">
          <div className="lg:w-3/5">
            <h1 className="text-heading text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
              Masuk ke Akunmu dan Mulai Belajar!
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10">
              Akses berbagai fitur pembelajaran pintar seperti penyederhanaan
              materi, kuis otomatis, dan diskusi interaktif bersama AI. Login
              menggunakan akun Google atau email untuk melanjutkan.
            </p>
          </div>
          <div className="lg:w-2/5 flex justify-end">
            <LoginForm />
          </div>
          <Image
            src="/assets/image/star-yellow.png"
            alt="star"
            width={40}
            height={40}
            className="absolute top-8 left-4 rounded-full transform rotate-45 animate-pulse hidden md:block"
          ></Image>
          <Image
            src="/assets/image/star-white.png"
            alt="star"
            width={40}
            height={40}
            className="absolute bottom-1/4 left-1/4 rounded-full transform -rotate-30 animate-pulse hidden md:block"
          ></Image>
          <Image
            src="/assets/image/star-yellow.png"
            alt="star"
            width={40}
            height={40}
            className="absolute top-8 right-8 rounded-full transform rotate-60 animate-pulse hidden md:block"
          ></Image>
        </div>
      </div>
    </section>
  );
}
