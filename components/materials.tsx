'use client'
import { createClient } from "@/lib/supabase/client";
import { LucideNotepadText, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MaterialFile {
    id: string;
    material_id: string;
    file_name: string;
    file_path: string;
    file_url: string;
    created_at: string;
}

interface Material {
    id: string;
    name: string;
    course_id: string;
    material_files: MaterialFile[];
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


export default function MaterialPage() {
    const params = useParams();

    const [course, setCourse] = useState<Course>();
    const [materials, setMaterials] = useState<Material[]>([]);

    const courseId = params.course_id;

    useEffect(() => {
        const fetchCourse = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) {
                console.log("Failed Fetch Courses");
                return;
            }
            setCourse(data);
        };

        const fetchMaterials = async () => {
            const supabase = createClient();
            const { data: fetchedMaterials, error } = await supabase
                .from('materials')
                .select('*')
                .eq('course_id', courseId);

            if (error) {
                console.log("Failed Fetch Materials");
                return;
            }

            const materialsWithFiles: Material[] = [];

            for (const material of fetchedMaterials || []) {
                const { data: material_files, error: filesError } = await supabase
                    .from('material_files')
                    .select('*')
                    .eq('material_id', material.id);

                if (filesError) {
                    console.warn(`Failed fetch material_files to material_id: ${material.id}`, filesError);
                }

                materialsWithFiles.push({
                    ...material,
                    material_files: material_files || []
                });
            }

            setMaterials(materialsWithFiles);
        };

        if (courseId) {
            fetchCourse();
            fetchMaterials();
        }
    }, [courseId]);


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
        <>
            {materials.map((material, index) => (
                <Link href={`${courseId}/materials/${material.id}`} className="p-5 border rounded" key={index}>
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
                                <p>{material.name}</p>
                                {material.material_files.length > 0 ? (
                                    material.material_files.map((file, i) => (
                                        <p key={i}>{file.file_name}</p>
                                    ))
                                ) : (
                                    <p className="text-neutral-400 italic">Belum ada file</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </>
    )
}