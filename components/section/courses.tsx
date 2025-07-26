"use client";

import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface CourseType {
  id: string;
  name: string;
  program: string;
  instructor: string;
  weeks: string;
  time_start: string;
  time_end: string;
  student_count: number;
  created_at: string;
}

export default function Course() {
  const supabase = createClient();
  const [courses, setCourses] = useState<CourseType[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Fetch error:", error.message);
      } else {
        setCourses(data || []);
      }
    };

    fetchCourses();
  }, [supabase]);

  const truncateName = (name: string, maxLength: number) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + "...";
    }
    return name;
  };

  return (
    <section className="bg-dark mb-20 md:mb-32 lg:mb-40" id="courses">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-heading text-4xl md:text-5xl font-semibold mb-4">
            Kelas-kelas mu
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Temukan berbagai kelas dengan materi terstruktur, topik yang
            relevan, dan siap digunakan untuk belajar mandiri, berdiskusi dengan
            AI, atau menguji diri lewat kuis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card border border-card-border/10 rounded-lg flex flex-col md:flex-row items-center text-center md:text-left shadow-lg"
            >
              <div className="p-8 w-full">
                <h3 className="text-heading text-2xl font-semibold mb-3">
                  {truncateName(course.name, 30)}{" "}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  {course.program}
                </p>
                <div className="flex gap-2 mb-2 items-center text-sm text-muted-foreground">
                  <User size={18} />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex gap-2 mb-8 items-center text-sm text-muted-foreground">
                  <Clock size={18} />
                  <span>
                    {course.weeks}, {course.time_start?.slice(0, 5)} -{" "}
                    {course.time_end?.slice(0, 5)}
                  </span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="bg-primary hover:bg-primary-darker text-background font-bold py-3 px-8 rounded-lg drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300 transform"
                >
                  Lihat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
