import Image from "next/image";

export default function Feature() {
  return (
    <section className="bg-dark mb-20 md:mb-32 lg:mb-40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-heading text-4xl md:text-5xl font-semibold mb-4">
            Fitur Unggulan, Belajar Lebih Efisien
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            LMS ini dirancang untuk memudahkan mahasiswa memahami materi kuliah
            dengan cepat dan mendalam melalui teknologi terkini seperti AI dan
            otomatisasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-6">
          <div className="bg-card border border-card-border/10 rounded-lg flex flex-col md:flex-row items-center text-center md:text-left shadow-lg">
            <div className="md:w-2/3 p-8">
              <h3 className="text-heading text-2xl font-semibold mb-3">
                Sederhanakan Materi
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Ringkas materi kuliah yang kompleks menjadi lebih mudah dipaham
                hanya dalam beberapa klik. Cocok untuk review cepat dan
                pemahaman mendalam.
              </p>
            </div>
            <div className="md:w-1/3 h-full mt-6 md:mt-0 flex justify-center">
              <Image
                src="/assets/image/fitur-1.png"
                alt="Ilustrasi wanita belajar dengan laptop"
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
          </div>

          <div className="bg-card border border-card-border/10 rounded-lg flex flex-col md:flex-row items-center text-center md:text-left shadow-lg">
            <div className="md:w-2/3 p-8">
              <h3 className="text-heading text-2xl font-semibold mb-3">
                Quiz Generator Otomatis
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Buat soal kuis secara instan berdasarkan materi yang kamu
                pelajari. Cocok untuk latihan mandiri atau uji pemahaman sebelum
                ujian.
              </p>
            </div>
            <div className="md:w-1/3 h-full mt-6 md:mt-0 flex justify-center">
              <Image
                src="/assets/image/fitur-2.png"
                alt="Ilustrasi pria mengerjakan kuis di komputer"
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
          </div>

          <div className="bg-card border border-card-border/10 rounded-lg flex flex-col md:flex-row items-center text-center md:text-left shadow-lg">
            <div className="md:w-2/3 p-8">
              <h3 className="text-heading text-2xl font-semibold mb-3">
                Diskusi Interaktif dengan AI
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Tanyakan apa pun terkait materi dan berdiskusi langsung dengan
                AI. Dapatkan jawaban yang cepat, jelas, dan relevan.
              </p>
            </div>
            <div className="md:w-1/3 h-full mt-6 md:mt-0 flex justify-center">
              <Image
                src="/assets/image/fitur-3.png"
                alt="Ilustrasi pria berdiskusi dengan AI"
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
          </div>

          <div className="bg-card border border-card-border/10 rounded-lg flex flex-col md:flex-row items-center text-center md:text-left shadow-lg">
            <div className="md:w-2/3 p-8">
              <h3 className="text-heading text-2xl font-semibold mb-3">
                Login Aman dan Praktis
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Masuk dengan akun Google atau email secara cepat dan aman. Tidak
                perlu repot, langsung terhubung ke dashboard kamu.
              </p>
            </div>
            <div className="md:w-1/3 h-full mt-6 md:mt-0 flex justify-center">
              <Image
                src="/assets/image/fitur-4.png"
                alt="Ilustrasi wanita login dengan aman"
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
