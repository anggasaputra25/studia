'use client'
import { useParams } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Brain, LucideNotepadText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MaterialFile {
    id: string;
    material_id: string;
    file_name: string;
    file_path: string;
    file_url: string;
    created_at: string;
}



export default function SimplifyMaterialButton() {
    const params = useParams();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [files, setFiles] = useState<File[]>([]);
    const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([])
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);

    const courseId = params.course_id;
    const material_id = params.material_id;

    const toggleUrl = (url: string) => {
        setSelectedUrls(prev =>
            prev.includes(url)
                ? prev.filter(item => item !== url)
                : [...prev, url]
        );
    };

    useEffect(() => {
        const fetchMaterialFiles = async () => {
            const supabase = createClient();
            const { data: material_files, error } = await supabase
                .from('material_files')
                .select('*')
                .eq('material_id', material_id)
            if (error) {
                console.error("Error fetch material_files: ", error)
                return;
            }
            setMaterialFiles(material_files)
        }
        if (material_id) {
            fetchMaterialFiles()
        }
    }, [material_id])

    const handleFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = event.target.files?.[0];
        if (newFile) {
            setFiles(prev => [...prev, newFile]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        setFiles([]);
        setSelectedUrls([]);
    }

    const handleSubmit = async () => {
        if (files.length === 0 && selectedUrls.length === 0) {
            alert("Silakan pilih setidaknya satu file atau URL terlebih dahulu.");
            return;
        }

        setLoadingGenerate(true)

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("files", file);
            });
            selectedUrls.forEach((url) => {
                formData.append("urls", url);
            });

            const res = await fetch(`http://localhost:3000/api/courses/${courseId}/materials/${material_id}/simplify_materials`, {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            console.log(result);

            setFiles([]);
            setSelectedUrls([]);
        } catch (error) {
            console.log("Failed submit: ", error)
        } finally {
            setLoadingGenerate(false);
        }
    };


    return (
        <div>
            {/* Dialog Add */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline"><Brain />Mulai</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sederhanakan Materi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mulai sederhanakan dengan bantuan AI.
                        </AlertDialogDescription>

                        <AlertDialogTitle>Pilih file materi dari kelas</AlertDialogTitle>
                        <div className="flex gap-3 flex-wrap">
                            {materialFiles.map((file, index) => {
                                const isSelected = selectedUrls.includes(file.file_url);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => toggleUrl(file.file_url)}
                                        className={`border p-2 rounded-sm transition ${isSelected ? "bg-neutral-900 text-white" : ""
                                            }`}
                                    >
                                        {file.file_name}
                                    </button>
                                );
                            })}
                        </div>

                        <AlertDialogTitle>Upload file</AlertDialogTitle>
                        <AlertDialogDescription>
                            Upload file tambahanmu di sini
                        </AlertDialogDescription>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {/* Trigger Button */}
                        <button
                            onClick={handleFile}
                            className="w-full p-2 rounded-sm bg-neutral-900 flex flex-col justify-center items-center border border-dashed"
                        >
                            <LucideNotepadText className="py-4 w-20 h-20 border rounded-sm mb-2" />
                            <p>Klik untuk Upload File</p>
                            <AlertDialogDescription>
                                File pdf
                            </AlertDialogDescription>
                        </button>

                        {/* File List */}
                        <div className="flex gap-2 flex-col mt-4">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-center p-2 rounded"
                                >
                                    <LucideNotepadText className="w-9 h-9 border p-1.5 rounded-sm bg-neutral-900" />
                                    <div className="flex-1">
                                        <p className="text-sm">{file.name}</p>
                                        <AlertDialogDescription className="text-xs">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </AlertDialogDescription>
                                    </div>
                                    <button onClick={() => handleRemoveFile(index)}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} className="bg-yellow-400">Ya</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading */}
            <AlertDialog open={loadingGenerate}>
                <AlertDialogContent className="h-1/2">
                    <AlertDialogHeader className="flex flex-col justify-center items-center">
                        <Brain className="text-yellow-500 w-20 h-20 mb-5 animate-spin ease-linear" style={{ animationDuration: "10s" }} />
                        <AlertDialogTitle>Materi sedang disederhanakan</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Tunggu hingga selesai. Ini mungkin memakan<br />waktu yang banyak.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}