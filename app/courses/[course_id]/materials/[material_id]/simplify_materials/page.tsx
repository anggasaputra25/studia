'use client'
import SimplifyMaterialButton from "@/components/simplify-material-button";
import { createClient } from "@/lib/supabase/client";
import { LucideNotepadText, User } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Material {
    id: string;
    name: string;
    course_id: string;
    created_at: string;
}

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
    const [materials, setMaterials] = useState<Material[]>([]);

    const tab = searchParams.get('tab');
    const courseId = params.course_id;
    const material_id = params.material_id;

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
        const fetchMaterials = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('course_id', courseId)

            if (error) {
                console.log("Gagal Fetch Materials");
                return;
            }

            setMaterials(data);
        }
        if (courseId) {
            fetchMaterials();
            fetchCourse();
        }
    }, [courseId])

    useEffect(() => {
        console.log(materials);
    }, [materials])
    useEffect(() => {
        console.log(course);
    }, [course])

    // Set Time
    function timeAgo(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // dalam detik

        if (diff < 60) return `Baru saja`;
        if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu yang lalu`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan yang lalu`;
        return `${Math.floor(diff / 31536000)} tahun yang lalu`;
    }

    return (
        <div className="m-5">
            <div className="bg-neutral-900 p-5 rounded border mb-5">
                <h1 className="text-3xl">{course?.name}</h1>
                <p>{course?.program}</p>
                <div className="flex justify-between mt-10">
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
            <div className="flex gap-5">
                <div className="w-1/3 rounded border bg-neutral-900 p-5 flex flex-col gap-5 h-fit">
                    <button className="py-1 px-2 bg-yellow-600 rounded text-black w-fit">Kembali</button>
                    <Link href={`/courses/${courseId}?tab=materials`} >Materi</Link>
                    <Link href={`/courses/${courseId}?tab=quiz`} >Kuis</Link>
                    <Link href={`/courses/${courseId}?tab=discussion`} >Diskusi</Link>
                </div>
                <div className="w-full rounded border bg-neutral-900 p-5 flex flex-col gap-3">
                    {materials.map((material, index) => (
                        <div className="p-5 border rounded" key={index}>
                            <div className="flex items-center gap-3">
                                <User className="border rounded-full p-2 w-10 h-10 bg-neutral-800" />
                                <div>
                                    <p>{`${course?.instructor} menambahkan materi pada > ${course?.name}`}</p>
                                    <p>{course?.created_at ? timeAgo(course.created_at) : ""}</p>
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="flex items-center gap-3">
                                    <LucideNotepadText className="border rounded p-2 w-10 h-10 bg-neutral-800" />
                                    <div>
                                        <p>Materi cara nabung</p>
                                        <p>Materi.pdf</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}