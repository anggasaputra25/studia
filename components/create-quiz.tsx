import {QuizIcon} from "@/components/ui/quiz-icon";
import {useEffect, useRef, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import SkeletonList from "@/components/ui/skeleton-list";
import {File, X} from "lucide-react";
import {formatBytes} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {
    AlertDialog,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import GeneratingQuizIcon from "@/components/ui/generating-quiz";
import {useRouter} from "next/navigation";

interface MaterialFile {
    id: string;
    material_id: string;
    file_name: string;
    file_path: string;
    file_url: string;
    created_at: string;
}

export default function CreateQuiz({courseId}: {courseId: string}) {
    const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([]);
    const [selectedMaterialFiles, setSelectedMaterialFiles] = useState<Map<number, string>>(new Map());
    const [materialLoading, setMaterialLoading] = useState(true);
    const [generateLoading, setGenerateLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement | null>(null)
    const supabase = createClient();
    const router = useRouter();

    const handleSelectMaterialFile = (index: number, materialFileUrl: string) => {
        setSelectedMaterialFiles(prev => {
            const newMap = new Map(prev);
            if (!newMap.has(index)) {
                newMap.set(index, materialFileUrl);
            } else {
                newMap.delete(index);
            }
            return newMap;
        });
    }

    const handleClickInput = () => {
        if (fileInput.current) {
            fileInput.current.click();
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const validFiles = files.filter(file => {
                if (file.size > 50 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large. Maximum size is 50MB`);
                    return false;
                }
                if (file.type !== 'application/pdf') {
                    toast.error(`File ${file.name} is not a PDF file`);
                    return false;
                }
                return true;
            });
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        try {
            const materialFiles = Array.from(selectedMaterialFiles.values());
            console.log("materialFiles: ");
            console.log(materialFiles);
            formData.append('material_files', JSON.stringify(materialFiles));
            uploadedFiles.forEach(file => {
                formData.append('additional_files', file);
            })
            setGenerateLoading(true);

            const response = await fetch(`/api/courses/${courseId}/quiz`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            console.log("datass: ");
            console.log(data);
            toast.success('Quiz berhasil dibuat');
            router.replace(`?tab=quiz&q=${data.data.quiz.id}`);
        } catch (error) {
            console.log(error);
            setError(error instanceof Error ? error.message : 'An error occurred');
            toast.error(error instanceof Error ? error.message : 'An error occurred');
            setGenerateLoading(false);
        }finally {
            setGenerateLoading(false);
        }
    }

    useEffect(() => {
        const fetchMaterialFiles = async () => {
            try{
                const {data, error} = await supabase
                    .from('material_files')
                    .select(`
                    *,
                    materials!inner()
                `)
                    .eq('materials.course_id', courseId);
                if(error) throw error;
                if(!data) throw new Error('No material files provided');

                 setMaterialFiles(data);
            }catch(error) {
                console.log(error);
                setError(error instanceof Error ? error.message : 'An error occurred');
                setMaterialLoading(false);
                toast.error(error instanceof Error ? error.message : 'An error occurred');
            }finally {
                setMaterialLoading(false);
            }

        };

        fetchMaterialFiles();
    }, [courseId]);


    return (
        <div>
            <div className={'flex gap-5 mt-5'}>
                <div className={'p-5 rounded-xl bg-gray-500/10 border-2 border-gray-500/20 w-15 h-15'}>
                    <QuizIcon/>
                </div>

                <div className={'flex flex-col justify-center'}>
                    <h2 className={'text-lg font-bold'}>Buat quiz</h2>
                    <p className={'text-sm text-gray-400'}>Pilih materi dan AI akan membuat quiz secara otomatis.</p>
                </div>
            </div>

            <div className={'mt-7'}>
                <h2 className={'font-bold text-md'}>Pilih file materi dari kelas</h2>
                {materialLoading ?
                    <div className={'mt-5'}>
                        <SkeletonList/>
                    </div> :
                    <div className={'flex gap-3 mt-5'}>
                        {materialFiles.map((materialFile, index: number) => {
                        const backround = !selectedMaterialFiles.has(index) ? 'bg-gray-500/10 border-2 border-gray-500/10 rounded-full px-5 py-1' : 'bg-gray-500/30 border-2 border-gray-500/20 rounded-full px-5 py-1';
                        return (
                            <div
                                onClick={() => handleSelectMaterialFile(index, materialFile.file_url)}
                                key={materialFile.id} className={`cursor-pointer text-[#A1A1A1] ${backround}`}>
                                <p>{materialFile.file_name}</p>
                            </div>
                        )
                    })}
                    </div>
                }
            </div>
            <div className={'mt-5'}>
                <h3 className={'font-bold text-md'}>
                    Upload file
                </h3>
                <p className={'text-sm text-gray-400'}>
                    Upload file tambahanmu di sini
                </p>

                <div className={'mt-5'}>
                    <input
                        ref={fileInput}
                        className={'hidden'}
                        type={'file'}
                        accept={'application/pdf'}
                        multiple
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={handleClickInput}
                        className={'p-5 border-dashed border-2 cursor-pointer bg-gray-500/5 border-gray-500/50 rounded-xl w-full h-64 flex flex-col justify-center items-center text-gray-400'}>
                        <div className={'bg-gray-500/10 border-2 border-gray-500/30 rounded-xl p-8'}>
                            <File size={40}/>
                        </div>
                        <div className={'mt-3 items-center flex flex-col'}>
                            <h3 className={'text-lg font-bold'}>
                                Klik untuk mengunggah file
                            </h3>
                            <p className={'text-sm text-gray-500'}>
                                Tipe file <strong>  .pdf</strong> max 50 MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={'mt-5'}>
                {uploadedFiles.map((file, index: number) => {
                    return (
                      <div key={index} className={'py-2 flex justify-between'}>
                          <div className={'flex gap-3 items-center'}>
                              <div className={'p-3 rounded-xl bg-gray-500/10 border-2 border-gray-500/20 w-15 h-15'}>
                                  <File/>
                              </div>

                              <div className={'flex flex-col justify-center'}>
                                  <h2 className={'font-medium'}>{file.name}</h2>
                                  <p className={'text-sm text-gray-300'}>{formatBytes(file.size)}</p>
                              </div>
                          </div>

                          <div className={'cursor-pointer self-center'} onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}>
                              <X/>
                          </div>
                      </div>
                    );
                })}
            </div>

            <div className={'mt-5 flex justify-end gap-5'}>
                <AlertDialog open={generateLoading} onOpenChange={setGenerateLoading}>
                    <AlertDialogTrigger asChild>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedMaterialFiles.size === 0 && uploadedFiles.length === 0 || generateLoading}
                            className={'bg-[#FFCB67] font-medium hover:bg-[#FFCB67] drop-shadow-[0px_4px_0px#FFAE00]'}>
                            {generateLoading ? 'Generating...' : 'Buat'}
                        </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                        <AlertDialogHeader className={'flex flex-col  justify-center items-center'}>
                            <div className={'w-1/2 h-3/4 p-10 bg-gray-500/10 border-gray-500 rounded-xl flex justify-center items-center mx-auto'}>
                                <GeneratingQuizIcon/>
                            </div>
                            <AlertDialogTitle>Quiz sedang dibuat</AlertDialogTitle>
                            <AlertDialogDescription className={'text-center'}>
                                Mohon tunggu sebentar, quiz sedang dalam proses pembuatan. Ini mungkin memakan waktu beberapa menit.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </AlertDialogContent>

                </AlertDialog>

            </div>

        </div>
    )
}