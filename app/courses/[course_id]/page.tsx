"use client";
import MaterialPage from "@/components/materials";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// pages/courses/[id]/discussion/page.tsx
import dynamic from 'next/dynamic';
import { QuizSection } from "@/components/quiz-section";

const Discussion = dynamic(() => import('@/components/discussion'), { ssr: false });



interface Course {
  id: string;
  name: string;
  program: string;
  instructor: string;
  weeks: string;
  time_start: string;
  time_end: string;
  created_at: string;
  student_count: number;
}

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [course, setCourse] = useState<Course>();

  const tab = searchParams.get("tab");
  const courseId = params.course_id;

  useEffect(() => {
    const fetchCourse = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        console.log("Failed Fetch Courses");
        return;
      }
      setCourse(data);
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
const courseIdStr = courseId?.toString();
  return (
    <main className="min-h-screen bg-dark text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="bg-card border border-card-border/10 rounded-lg p-6 shadow-lg mb-6">
          <h1 className="text-3xl font-semibold">{course?.name}</h1>
          {/* <p className="text-muted-foreground text-sm">{course?.program}</p> */}
          <div className="flex justify-between mt-10 flex-col md:flex-row gap-5">
            <div>
              <p className="text-lg">Program Studi</p>
              <p className="text-muted-foreground text-sm">{course?.program}</p>
            </div>
            <div>
              <p className="text-lg">Dosen Pengajar</p>
              <p className="text-muted-foreground text-sm">
                {course?.instructor}
              </p>
            </div>
            <div>
              <p className="text-lg">Jumlah Mahasiswa</p>
              <p className="text-muted-foreground text-sm">
                {course?.student_count}
              </p>
            </div>
            <div>
              <p className="text-lg">Jadwal</p>
              <p className="text-muted-foreground text-sm">{`${course?.weeks}, ${course?.time_start?.slice(0, 5)} - ${course?.time_end?.slice(0, 5)}`}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-5 flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-card border border-card-border/10 rounded-lg p-6 shadow-lg flex flex-col gap-6 h-fit">
            <Link
              href="/courses"
              className="flex justify-center items-center gap-2 bg-primary hover:bg-primary-darker text-background font-bold py-2 px-6 rounded-lg drop-shadow-[0px_4px_0px#FFAE00] transition-all duration-300 transform w-fit"
            >
              <ChevronLeft /> Kembali
            </Link>
            <Link
              href={`/courses/${courseId}?tab=materials`}
              className="flex items-center gap-2"
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.5 2.5H6.5C5.70435 2.5 4.94129 2.81607 4.37868 3.37868C3.81607 3.94129 3.5 4.70435 3.5 5.5V19.5C3.5 20.2956 3.81607 21.0587 4.37868 21.6213C4.94129 22.1839 5.70435 22.5 6.5 22.5H18.5C19.2956 22.5 20.0587 22.1839 20.6213 21.6213C21.1839 21.0587 21.5 20.2956 21.5 19.5V11.5H15.5C14.7044 11.5 13.9413 11.1839 13.3787 10.6213C12.8161 10.0587 12.5 9.29565 12.5 8.5V2.5ZM21.5 9.5V9.328C21.4996 8.53276 21.1834 7.77023 20.621 7.208L16.793 3.378C16.2304 2.81572 15.4674 2.4999 14.672 2.5H14.5V8.5C14.5 8.76522 14.6054 9.01957 14.7929 9.20711C14.9804 9.39464 15.2348 9.5 15.5 9.5H21.5Z"
                  fill="#E5E5E5"
                />
              </svg>
              Materi
            </Link>
            <Link
              href={`/courses/${courseId}?tab=quiz`}
              className="flex items-center gap-2"
            >
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_365_488)">
                  <path
                    d="M12.7792 0.525003C10.9545 0.406031 9.12711 0.712767 7.44123 1.421C5.75257 2.1295 4.25199 3.2213 3.05823 4.61C1.86031 6.00133 0.999676 7.65037 0.543335 9.42873C0.0869941 11.2071 0.0472624 13.0668 0.427233 14.863C0.804261 16.6587 1.59143 18.3429 2.72723 19.784C3.8603 21.2228 5.31167 22.3791 6.96723 23.162C8.61999 23.9444 10.4322 24.3314 12.2604 24.2921C14.0886 24.2529 15.8826 23.7886 17.5002 22.936C17.5521 22.9095 17.61 22.8973 17.6682 22.9004C17.7263 22.9036 17.7826 22.9221 17.8312 22.954C19.3674 23.9828 21.1795 24.5215 23.0282 24.499C23.0719 24.4993 23.1152 24.4909 23.1556 24.4743C23.196 24.4577 23.2327 24.4332 23.2636 24.4024C23.2945 24.3715 23.3189 24.3348 23.3355 24.2944C23.3521 24.254 23.3605 24.2107 23.3602 24.167V20.129C23.3607 20.0501 23.3333 19.9736 23.2828 19.913C23.2322 19.8524 23.1619 19.8117 23.0842 19.798C22.7039 19.7374 22.3324 19.6303 21.9782 19.479C21.9122 19.4494 21.8577 19.3989 21.8232 19.3353C21.7887 19.2717 21.7761 19.1985 21.7872 19.127C21.793 19.0793 21.8102 19.0337 21.8372 18.994C22.9923 17.2554 23.6714 15.2444 23.8069 13.1615C23.9424 11.0786 23.5294 8.99655 22.6092 7.123C21.6915 5.2523 20.2974 3.65616 18.5672 2.495C16.8411 1.33642 14.8396 0.654414 12.7652 0.518003L12.7792 0.525003ZM4.84323 12.398C4.84216 10.9735 5.26132 9.58039 6.04823 8.393C6.83428 7.20954 7.95289 6.28507 9.26323 5.736C10.573 5.18814 12.0164 5.04375 13.4087 5.32132C14.801 5.59889 16.0787 6.28578 17.0782 7.294C18.0811 8.30509 18.7636 9.58949 19.0402 10.9865C19.3168 12.3835 19.1752 13.831 18.6332 15.148C18.0911 16.4635 17.1714 17.5888 15.9902 18.382C14.6122 19.3056 12.9558 19.7213 11.3049 19.5578C9.65407 19.3944 8.1114 18.6619 6.94123 17.486C5.59642 16.1335 4.84054 14.3043 4.83823 12.397L4.84323 12.398Z"
                    fill="#E5E5E5"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_365_488">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
              Kuis
            </Link>
            <Link
              href={`/courses/${courseId}?tab=discussion`}
              className="flex items-center gap-2"
            >
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_374_524)">
                  <path
                    d="M5.3335 13.1666V7.83325H3.3335C2.80306 7.83325 2.29436 8.04397 1.91928 8.41904C1.54421 8.79411 1.3335 9.30282 1.3335 9.83325V21.8333C1.33449 21.9571 1.36994 22.0782 1.43588 22.183C1.50182 22.2877 1.59564 22.3721 1.70683 22.4266C1.81395 22.4753 1.93205 22.4948 2.04915 22.4831C2.16624 22.4714 2.27814 22.4289 2.3735 22.3599L5.80683 19.8333H14.7668C15.0195 19.8407 15.271 19.7962 15.5058 19.7026C15.7406 19.6089 15.9536 19.468 16.1317 19.2886C16.3099 19.1092 16.4493 18.8952 16.5413 18.6598C16.6333 18.4244 16.6761 18.1725 16.6668 17.9199V17.1666H9.3335C8.27263 17.1666 7.25521 16.7452 6.50507 15.995C5.75492 15.2449 5.3335 14.2275 5.3335 13.1666Z"
                    fill="#E5E5E5"
                  />
                  <path
                    d="M20.6668 3.16675H9.3335C8.80306 3.16675 8.29435 3.37746 7.91928 3.75253C7.54421 4.12761 7.3335 4.63632 7.3335 5.16675V13.1667C7.3335 13.6972 7.54421 14.2059 7.91928 14.581C8.29435 14.956 8.80306 15.1667 9.3335 15.1667H18.3668L21.5535 17.6401C21.6482 17.7101 21.7598 17.7538 21.8769 17.7667C21.994 17.7796 22.1125 17.7612 22.2202 17.7134C22.3336 17.6594 22.4295 17.5744 22.4967 17.4682C22.5639 17.3621 22.5998 17.2391 22.6002 17.1134V5.16675C22.6005 4.64767 22.3989 4.14881 22.0381 3.77559C21.6774 3.40238 21.1856 3.18405 20.6668 3.16675Z"
                    fill="#E5E5E5"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_374_524">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
              Diskusi
            </Link>
          </div>
          <div className="w-full bg-card border border-card-border/10 rounded-lg p-6 shadow-lg flex flex-col gap-3">
            {(!tab || tab === "materials") && <MaterialPage />}
            {(!tab || tab === "quiz" && courseIdStr) && <QuizSection courseId={courseIdStr} />}
            {(!tab || tab === "discussion") && <Discussion />}
          </div>
        </div>
      </div>
    </main>
  );
}
