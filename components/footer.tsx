import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border card-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <Image
              src="/assets/image/logo.png"
              alt="star"
              width={100}
              height={100}
              className=""
            ></Image>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Platform pembelajaran cerdas berbasis AI yang membantu mahasiswa
              memahami materi, mengerjakan kuis, dan berdiskusi secara
              interaktif.
            </p>
          </div>
          <div className="lg:col-span-1"></div>
          <div className="lg:col-span-1">
            <h5 className="heading text-2xl font-semibold mb-4">
              Navigasi Cepat
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="#courses"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Kelas
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="heading text-2xl font-semibold mb-4">Legal</h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Panduan Pengguna
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="heading text-2xl font-semibold mb-4">Kontak</h5>
            <ul className="flex space-x-4">
              <li>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-darker transition-colors duration-200"
                >
                  <Instagram />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-darker transition-colors duration-200"
                >
                  <Facebook />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-darker transition-colors duration-200"
                >
                  <Twitter />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t card-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Studia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
