import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full mb-20 md:mb-32 lg:mb-40 overflow-hidden z-10">
      <div className="container mx-auto px-4">
        <div className="bg-card border card-boder rounded-lg mx-auto pt-12 lg:pt-0 ps-2 pe-2 lg:pe-0 lg:ps-12 flex flex-col lg:flex-row items-center justify-between relative z-10">
          <div className="lg:w-3/5 text-center lg:text-left mb-12 lg:mb-0">
            <span className="inline-block bg-card text-white text-sm font-medium px-4 py-2 border card-border rounded-lg mb-6">
              Belajar dengan AI
            </span>

            <h1 className="text-heading text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Optimalisasi Pembelajaran
              <br className="hidden md:block" /> di Era Digital
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg mx-auto lg:mx-0">
              Sederhanakan materi, diskusikan dengan AI, dan tingkatkan
              pemahamanmu.
            </p>

            <Link href="#courses" className="bg-primary hover:bg-primary-darker text-background font-bold py-3 px-8 rounded-lg drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300 transform">
              Jelajahi lagi
            </Link>
          </div>

          <div className="lg:w-2/5 flex justify-center lg:justify-end">
          <Image
              src="/assets/image/hero-image.png"
              alt="Seorang wanita muda tersenyum sambil memegang laptop"
              width={500}
              height={500}
              className="object-contain max-w-full h-auto"
              priority
            />

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
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-gray-900 opacity-90"></div>
    </section>
  );
}
