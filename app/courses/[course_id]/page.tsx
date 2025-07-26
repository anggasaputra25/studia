'use client'
import MaterialPage from "@/components/materials";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

    const tab = searchParams.get('tab');
    const courseId = params.course_id;

    useEffect(() => {
        const fetchCourse = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single()

            if (error) {
                console.log("Gagal Fetch Courses");
                return;
            }
            setCourse(data);
        }
        if (courseId) {
            fetchCourse();
        }
    }, [courseId])

    return (
        <div className="m-5">
            <div className="bg-neutral-900 p-5 rounded border mb-5">
                <h1 className="text-3xl">{course?.name}</h1>
                <p>{course?.program}</p>
                <div className="flex justify-between mt-10 flex-col md:flex-row gap-5">
                    <div>
                        <p>Program Studi</p>
                        <p>{course?.program}</p>
                    </div>
                    <div>
                        <p>Dosen Pengajar</p>
                        <p>{course?.instructor}</p>
                    </div>
                    <div>
                        <p>Jumlah Mahasiswa</p>
                        <p>{course?.student_count}</p>
                    </div>
                    <div>
                        <p>Jadwal</p>
                        <p>{`${course?.weeks}, ${course?.time_start} - ${course?.time_end}`}</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-5 flex-col md:flex-row">
                <div className="w-full md:w-1/3 rounded border bg-neutral-900 p-5 flex flex-col gap-5 h-fit">
                    <button className="py-1 px-2 bg-yellow-600 rounded text-black w-fit">Kembali</button>
                    <Link href={`/courses/${courseId}?tab=materials`} >Materi</Link>
                    <Link href={`/courses/${courseId}?tab=quiz`} >Kuis</Link>
                    <Link href={`/courses/${courseId}?tab=discussion`} >Diskusi</Link>
                </div>
                <div className="w-full rounded border bg-neutral-900 p-5 flex flex-col gap-3">
                    {(!tab || tab === 'materials') && (
                        <MaterialPage />
                    )}
                    {(tab === 'quiz') && (
                        <h1>Quiz</h1>
                    )}
                    {(tab === 'discussion') && (
                        <h1>Discussion</h1>
                    )}
                </div>
            </div>
        </div>
    )
}