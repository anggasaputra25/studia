"use client";

import { useState, useEffect } from "react";
import { Clock, User, Search, FileText, LucideNotepadText } from "lucide-react";
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

interface MaterialType {
  id: string;
  name: string;
  course_id: string;
  course?: { name: string }; // relasi dari foreign key
  created_at: string;
}

export default function Courses() {
  const supabase = createClient();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const daysInCurrentMonth = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        setCourses(data || []);
      }
    };

    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from("materials")

        .select("id, name, course_id, courses(name), created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      if (error) {
        console.error("Error fetching materials:", error.message);
      } else {
        const formattedMaterials =
          data?.map((material: any) => ({
            id: material.id,
            name: material.name,
            course_id: material.course_id,
            course: material.courses,
            created_at: material.created_at,
          })) || [];
        setMaterials(formattedMaterials);
      }
    };

    fetchCourses();
    fetchMaterials();
  }, [supabase]);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-dark text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-card border border-card-border/10 rounded-lg p-6 shadow-lg">
              <h2 className="text-heading text-xl font-semibold mb-4">
                Kalender
              </h2>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="text-white hover:text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span className="text-white font-medium">
                  {currentMonth.toLocaleString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="text-white hover:text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-sm">
                {["Mi", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"].map((day) => (
                  <div
                    key={day}
                    className="text-muted-foreground font-medium mb-2"
                  >
                    {day}
                  </div>
                ))}
                {daysInCurrentMonth.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md ${
                      day && day.toDateString() === new Date().toDateString()
                        ? "bg-primary text-background font-bold"
                        : day
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {day ? day.getDate() : ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-card-border/10 rounded-lg p-6 shadow-lg">
              <h2 className="text-heading text-xl font-semibold mb-4">
                Materi Baru
              </h2>
              <div className="space-y-4">
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between bg-dark-font border border-card-border/10 rounded-md p-3"
                    >
                      <div className="flex items-center gap-3">
                      <LucideNotepadText className="border rounded p-2 w-10 h-10 bg-neutral-800" />
                        <div>
                          <p className="text-white font-medium">
                            {material.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {material.course?.name || material.course_id}{" "}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${material.course_id}/materials/${material.id}`}
                        className="bg-primary hover:bg-primary-darker text-background font-semibold py-2 px-4 rounded-lg text-sm drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300"
                      >
                        Lihat
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    Tidak ada materi baru ditemukan.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-card border border-card-border/10 rounded-lg p-6 shadow-lg">
              <h2 className="text-heading text-xl font-semibold mb-4">Kelas</h2>

              <div className="relative mb-6">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Cari"
                  className="w-full pl-10 pr-4 py-3 bg-dark-font border border-card-border rounded-lg text-white focus:outline-none focus:ring-primary focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-dark-font border border-card-border/10 rounded-lg p-6 flex flex-col shadow-md"
                    >
                      <h3 className="text-heading text-xl font-bold mb-2">
                        {course.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {course.program}
                      </p>
                      <div className="flex items-center gap-3 mb-2 text-sm text-muted-foreground">
                        <User size={16} />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>
                          {course.weeks}, {course.time_start?.slice(0, 5)} -{" "}
                          {course.time_end?.slice(0, 5)}
                        </span>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="bg-primary hover:bg-primary-darker text-background font-semibold py-2 px-6 rounded-lg drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300 transform self-start"
                      >
                        Lihat
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center col-span-full">
                    Tidak ada kelas yang ditemukan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
