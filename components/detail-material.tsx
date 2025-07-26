'use client'
import { createClient } from "@/lib/supabase/client";
import { LucideNotepadText, User } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SimplifyMaterialButton from "./simplify-material-button";
import ReactMarkdown from 'react-markdown'


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

interface SimplifyMaterial {
    id: string;
    material_id: string
    student_id: string;
    title: string;
    simplified_content: string;
    created_at: string;
}


export default function DetailMaterial() {
    const params = useParams();
    const searchParams = useSearchParams();

    const [course, setCourse] = useState<Course>();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [simplify, setSimplify] = useState<SimplifyMaterial[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<SimplifyMaterial>();

    const courseId = params.course_id;
    const materialId = params.material_id;
    const simplifyId = searchParams.get('simplify_id');

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

        const fetchSimplify = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('simplify_materials')
                .select('*')
                .eq('material_id', materialId)

            if (error) {
                console.log("Failed fetch simplify");
                return;
            }

            setSimplify(data);
        }

        const fetchMaterials = async () => {
            const supabase = createClient();
            const { data: fetchedMaterials, error } = await supabase
                .from('materials')
                .select('*')
                .eq('id', materialId)

            if (error) {
                console.log("Failed Fetch Materials");
                return;
            }

            const materialsWithFiles: Material[] = [];

            for (const material of fetchedMaterials || []) {
                const { data: material_files, error: filesError } = await supabase
                    .from('material_files')
                    .select('*')
                    .eq('material_id', materialId);

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

        if (courseId && materialId) {
            fetchCourse();
            fetchMaterials();
            fetchSimplify();
        }
    }, [courseId, materialId]);


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

    useEffect(() => {
        if (simplifyId) {
            setSelectedMaterial(simplify.find(m => m.id === simplifyId));
        }
    }, [simplify, simplifyId]);

    return (
        simplifyId ? (
            <>
                <h2 className="text-xl font-medium">{selectedMaterial?.title}</h2>
                <p className="text-neutral-400 text-sm mb-3">{timeAgo(selectedMaterial?.created_at || '')}</p>
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{selectedMaterial?.simplified_content}</ReactMarkdown>
                </div>
            </>
        ) : (
            <>
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
                                    <p>{material.name}</p>
                                    {material.material_files.length > 0 ? (
                                        material.material_files.map((file, i) => (
                                            <Link href={file.file_url} key={i}>{file.file_name}</Link>
                                        ))
                                    ) : (
                                        <p className="text-neutral-400 italic">Belum ada file</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <hr className="my-5" />
                <h2 className="text-lg font-medium">Sederhanakan Materi</h2>
                <p className="text-neutral-500 mb-3">Gunakan bantuan AI untuk menyederhanakan materi supaya kamu mudah mengerti mengenai materi yang diberikan.</p>
                <SimplifyMaterialButton />
                <div className="flex flex-col gap-3 mt-3">
                    {simplify.map((data, index) => (
                        <Link href={`?simplify_id=${data.id}`} className="border p-5 rounded flex gap-3 items-center" key={index}>
                            <LucideNotepadText className="border rounded p-2 w-10 h-10 bg-neutral-800" />
                            <div>
                                <p>{data.title}</p>
                                <p className="text-neutral-400 text-sm">{timeAgo(data.created_at)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        )
    )
}