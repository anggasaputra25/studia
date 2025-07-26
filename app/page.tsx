import Course from "@/components/section/courses";
import Feature from "@/components/section/feature";
import Hero from "@/components/section/hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-dark text-white">
      <Hero/>
      <Feature/>
      <Course/>
    </main>
  );
}
