'use client'
import type { AdditionalDiscussionFiles, Discussion, DiscussionFile, DiscussionFiles, Material, MaterialFiles } from "@/app/types/discussion";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Paperclip, Bot, Plus, RotateCcw, Copy, Pencil, ArrowUp, LucideNotepadText, X } from "lucide-react";
import ReactMarkdown from 'react-markdown'
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
import { Button } from "@/components/ui/button";

const Discussion = () => {
    //Get params
    const { course_id } = useParams();

    //Initial supabase
    const supabase = createClient();

    //Initial loading
    const [loadingFetch, setLoadingFetch] = useState(true);
    const [loadingSendMessage, setLoadingSendMessage] = useState(false);
    const [loadingRegenerateAnswer, setLoadingRegenerateAnswer] = useState(false);
    const [loadingUpdatePrompt, setLoadingUpdatePrompt] = useState(false);

    //Initial error
    const [error, setError] = useState<string | null>(null);

    //Initial get data
    const [discussionData, setDiscussionData] = useState<Discussion[]>([]);
    const [discussionDataFile, setDiscussionDataFile] = useState<DiscussionFiles[]>([]);
    const [additionalDiscussionDataFile, setAdditionalDiscussionDataFile] = useState<AdditionalDiscussionFiles[]>([]);
    const [materialData, setMaterialData] = useState<Material[]>([]);
    const [materialFiles, setMaterialFiles] = useState<MaterialFiles[]>([]);

    //Input state
    const [inputPrompt, setInputPrompt] = useState("");
    const [inputPromptNew, setInputPromptNew] = useState("");

    //Initial file
    const [file, setFile] = useState<DiscussionFile[]>([]);
    const [additionalFile, setAdditionalFile] = useState<File[]>([]);

    //Bootomref
    const bottomRef = useRef<HTMLDivElement>(null);

    //Get data
    useEffect(() => {
        //Get discussion data
        const fetchDiscussion = async () => {
            try {
                const { data: { user }, error: errorUser } = await supabase.auth.getUser();
                if (errorUser) {
                    setError(errorUser.message)
                    console.log(errorUser)
                }

                const { data: dataDis, error: errorDis } = await supabase
                    .from("discussion")
                    .select("*")
                    .eq("course_id", course_id)
                    .eq("student_id", user?.id)
                    .order("created_at", { ascending: true });
                if (errorDis) {
                    throw new Error(errorDis.message);
                }
                setDiscussionData(dataDis);
                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (error: any) {
                //Handle errors
                setError(error.message);
                console.log(error);
            } finally {
                setLoadingFetch(false);
            }
        }

        //Get discussion files data
        const fetchDiscussionFile = async () => {
            try {
                const { data: dataDis, error: errorDis } = await supabase
                    .from("discussion_files")
                    .select("*")
                    .order("created_at", { ascending: true });
                if (errorDis) {
                    throw new Error(errorDis.message);
                }
                setDiscussionDataFile(dataDis);
                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (error: any) {
                //Handle errors
                setError(error.message);
                console.log(error);
            } finally {
                setLoadingFetch(false);
            }
        }

        //Get additional discussion files data
        const fetchAdditionalDiscussionFile = async () => {
            try {
                const { data: dataDis, error: errorDis } = await supabase
                    .from("additional_discussion_files")
                    .select("*")
                    .order("created_at", { ascending: true });
                if (errorDis) {
                    throw new Error(errorDis.message);
                }
                setAdditionalDiscussionDataFile(dataDis);
                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (error: any) {
                //Handle errors
                setError(error.message);
                console.log(error);
            } finally {
                setLoadingFetch(false);
            }
        }

        //Get material data
        const fetchMaterial = async () => {
            try {
                const { data: dataDis, error: errorDis } = await supabase
                    .from("materials")
                    .select("*")
                    .eq("course_id", course_id)
                    .order("created_at", { ascending: true });
                if (errorDis) {
                    throw new Error(errorDis.message);
                }
                setMaterialData(dataDis);
                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (error: any) {
                //Handle errors
                setError(error.message);
                console.log(error);
            } finally {
                setLoadingFetch(false);
            }
        }

        //Get material file
        const fetchMaterialFile = async () => {
            try {
                const { data: dataDis, error: errorDis } = await supabase
                    .from("material_files")
                    .select("*")
                    .order("created_at", { ascending: true });
                if (errorDis) {
                    throw new Error(errorDis.message);
                }
                setMaterialFiles(dataDis);
                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (error: any) {
                //Handle errors
                setError(error.message);
                console.log(error);
            } finally {
                setLoadingFetch(false);
            }
        }

        fetchDiscussion();
        fetchDiscussionFile();
        fetchAdditionalDiscussionFile();
        fetchMaterial();
        fetchMaterialFile();
    }, [course_id]);

    //Send message
    const sendMessage = async () => {
        // Scroll to bottom
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        if (!inputPrompt.trim()) return;
        let fileData: DiscussionFile[] = []

        //Handle material file
        if (file) {
            for (const item of file) {
                //Push fileData
                fileData.push({
                    id: item.id,
                    name: item.name,
                    path: item.path,
                    from: "material"
                });
            }
        }

        //Handle additional file
        if (additionalFile) {
            for (const item of additionalFile) {
                //Upload to storage supabase
                const { data, error } = await supabase.storage
                    .from("materialfiles")
                    .upload(`discussion/${Date.now()}-${item.name}`, item);

                if (error) {
                    throw new Error(error.message);
                }
                const publicUrl = supabase.storage
                    .from("materialfiles")
                    .getPublicUrl(data.path).data.publicUrl;

                //Push fileData
                fileData.push({
                    id: '' + Math.random(),
                    name: item.name,
                    path: publicUrl,
                    from: "additional"
                });
            }
        }

        setLoadingSendMessage(true);
        try {
            const res = await fetch(`/api/courses/${course_id}/discussion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: inputPrompt,
                    file: fileData || null
                })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.message || "Failed send message");

            setDiscussionData(prev => [...prev, json.data]);

            // Scroll to bottom
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error: any) {
            setError(error.message);
            console.log(error);
        } finally {
            setInputPrompt('');
            setLoadingSendMessage(false);
        }
    };
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    //Regenerate answer
    const regenerateAnswer = async (prompt: string, discussion_id: string) => {
        setLoadingRegenerateAnswer(true);
        try {
            const res = await fetch(`/api/courses/${course_id}/discussion/${discussion_id}/regenerate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.message || "Failed send message");

            setDiscussionData(prev =>
                prev.map(item =>
                    item.id === json.data.id
                        ? { ...item, answer: json.data.answer }
                        : item
                )
            );

        } catch (error: any) {
            setError(error.message);
            console.log(error);
        } finally {
            setInputPrompt('');
            setLoadingRegenerateAnswer(false);
        }
    };

    //Edit prompt
    const editAnswer = async (discussion_id: string) => {
        setLoadingUpdatePrompt(true);
        try {
            const res = await fetch(`/api/courses/${course_id}/discussion/${discussion_id}/regenerate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: inputPromptNew })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.message || "Failed send message");

            setDiscussionData(prev =>
                prev.map(item =>
                    item.id === json.data.id
                        ? { ...item, prompt: inputPromptNew, answer: json.data.answer }
                        : item
                )
            );

        } catch (error: any) {
            setError(error.message);
            console.log(error);
        } finally {
            setInputPrompt('');
            setLoadingUpdatePrompt(false);
        }
    };


    //Function copy
    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value)
    };

    const toggleFile = (id: string, name: string, path: string, from: string) => {
        setFile(prev => {
            const exists = prev.some(f =>
                f.id === id &&
                f.name === name &&
                f.path === path &&
                f.from === from
            );

            if (exists) {
                // Delete when file exists
                return prev.filter(f =>
                    !(f.id === id && f.name === name && f.path === path && f.from === from)
                );
            } else {
                // Add file
                return [...prev, { id, name, path, from }];
            }
        });
    };
    const handleDeleteFile = (index: number) => {
        setAdditionalFile(prev => prev.filter((_, i) => i !== index));
    };


    if (loadingFetch) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 max-w-md">
                <p className="text-red-400">Error: {error}</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#171717] flex flex-col text-white">
            {/* Chat Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {discussionData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Mulai percakapan</h3>
                            <p className="text-gray-400">Tanya apa saja untuk memulai.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {discussionData.map(item => (
                                <div key={item.id} className="space-y-6">
                                    {/* User Message */}
                                    <div className="flex gap-3 justify-end">
                                        {
                                            discussionDataFile.map(disFile => (
                                                disFile.discussion_id == item.id ?
                                                    materialFiles.map(matFile => (
                                                        disFile.mf_id == matFile.id ?
                                                            <a href={matFile.file_url} key={matFile.id} target="_blank" className="justify-end mt-0 flex items-center text-sm text-gray-400">
                                                                <div className="flex items-center bg-[#1a1a1a] rounded-lg px-3 py-2 border border-gray-500 hover:bg-orange-500 hover:text-white transition-all ease">
                                                                    <Paperclip className="w-4 h-4" />
                                                                    <span>
                                                                        {matFile.file_name}
                                                                    </span>
                                                                </div>
                                                            </a> : ''
                                                    ))
                                                    : ''
                                            ))
                                        }
                                        {
                                            additionalDiscussionDataFile.map(disFile => (
                                                disFile.discussion_id == item.id ?
                                                    <a href={disFile.file_path} key={disFile.id} target="_blank" className="justify-end mt-0 flex items-center text-sm text-gray-400">
                                                        <div className="flex items-center bg-[#1a1a1a] rounded-lg px-3 py-2 border border-gray-500 hover:bg-orange-500 hover:text-white transition-all ease">
                                                            <Paperclip className="w-4 h-4" />
                                                            <span>
                                                                {disFile.file_name}
                                                            </span>
                                                        </div>
                                                    </a>
                                                    : ''
                                            ))
                                        }
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="max-w-2xl">
                                            <div className="bg-[#2a2a2a] rounded-xl px-4 py-3 relative group">
                                                <p className="text-gray-200 leading-relaxed">{item.prompt}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Response Actions */}
                                    <div className="flex items-center space-x-2 justify-end">
                                        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group" onClick={() => handleCopy(item.prompt)}>
                                            <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                        </button>
                                        <AlertDialog>
                                            <AlertDialogTrigger className={`p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group ${loadingRegenerateAnswer ? 'cursor-not-allowed' : ''}`} onClick={() => setInputPromptNew(item.prompt)} disabled={loadingUpdatePrompt}><Pencil className="w-4 h-4 text-gray-500 group-hover:text-gray-300" /></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Edit Prompt</AlertDialogTitle>
                                                    <textarea
                                                        value={inputPromptNew}
                                                        onChange={(e) => setInputPromptNew(e.target.value)}
                                                        placeholder="Tulis pesan..."
                                                        className="w-full bg-[#1a1a1a] p-5 border-0 resize-none outline-none text-white placeholder-gray-500 leading-relaxed"
                                                        rows={1}
                                                        style={{
                                                            minHeight: '24px',
                                                            maxHeight: '200px',
                                                        }}
                                                        onInput={(e) => {
                                                            const target = e.target as HTMLTextAreaElement;
                                                            target.style.height = 'auto';
                                                            target.style.height = target.scrollHeight + 'px';
                                                        }}
                                                    />
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => editAnswer(item.id)} disabled={loadingUpdatePrompt}>Edit</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    {/* AI Response */}
                                    <div className="max-w-none">
                                        <div className="text-gray-200 leading-relaxed mb-4">
                                            <div className="prose prose-invert max-w-none mb-4">
                                                <ReactMarkdown>{item.answer}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Response Actions */}
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group" onClick={() => handleCopy(item.answer)}>
                                                <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                            </button>
                                            <button className={`p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group ${loadingRegenerateAnswer ? 'cursor-not-allowed' : ''}`}
                                                disabled={loadingRegenerateAnswer} onClick={() => regenerateAnswer(item.prompt, item.id)}>
                                                <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {loadingSendMessage && (
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 border border-gray-700">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />

            {/* Input Area */}
            <div className="bg-[#1a1a1a] sticky bottom-1 rounded-lg border border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="relative">
                        {/* Text Input */}
                        <div className="flex items-start space-x-3 rounded-xl p-3 border-none transition-colors pb-0">
                            <div className="flex-1">
                                <textarea
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Tulis pesan..."
                                    className="w-full h-full bg-transparent border-0 resize-none outline-none text-white placeholder-gray-500 leading-relaxed"
                                    rows={1}
                                    style={{
                                        minHeight: '24px',
                                        maxHeight: '200px',
                                    }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                className={`flex-shrink-0 p-2 rounded-lg m-0 transition-all ${!inputPrompt.trim() || loadingSendMessage
                                    ? 'text-gray-500 cursor-not-allowed border border-gray-800'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}
                                disabled={!inputPrompt.trim() || loadingSendMessage}
                                onClick={sendMessage}
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>

                        {/* File Upload Area */}
                        <div className="mb-4 flex">
                            {/* Dialog Add */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 text-sm p-2 mt-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"><Plus className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Pilih Materi</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Pelajari materi dengan bantuan AI.
                                        </AlertDialogDescription>

                                        <AlertDialogTitle>Pilih file materi dari kelas</AlertDialogTitle>
                                        <div className="flex gap-3 flex-wrap">
                                            {materialData.map(item =>
                                                materialFiles
                                                    .filter(fileItem => fileItem.material_id === item.id)
                                                    .map(fileItem => {
                                                        const isSelected = file.some(f =>
                                                            f.id === fileItem.id &&
                                                            f.name === fileItem.file_name &&
                                                            f.path === fileItem.file_url &&
                                                            f.from === 'material'
                                                        );

                                                        return (
                                                            <button
                                                                key={fileItem.id}
                                                                onClick={() => toggleFile(fileItem.id, fileItem.file_name, fileItem.file_url, 'material')}
                                                                className={`border p-2 rounded-sm transition ${isSelected ? 'bg-yellow-400 text-black' : 'bg-neutral-900 text-white'
                                                                    }`}
                                                            >
                                                                {fileItem.file_name}
                                                            </button>
                                                        );
                                                    })
                                            )}
                                        </div>

                                        <AlertDialogTitle>Upload file</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Upload file tambahanmu di sini
                                        </AlertDialogDescription>

                                        {/* Hidden File Input */}
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            accept="application/pdf"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setAdditionalFile(prev => [...prev, file]);
                                                }
                                            }}
                                        />

                                        {/* Trigger Button */}
                                        <button
                                            type="button"
                                            onClick={handleButtonClick}
                                            className="w-full p-2 rounded-sm bg-neutral-900 flex flex-col justify-center items-center border border-dashed"
                                        >
                                            <LucideNotepadText className="py-4 w-20 h-20 border rounded-sm mb-2" />
                                            <p>Klik untuk Upload File</p>
                                            <p className="text-sm text-gray-400">File PDF</p>
                                        </button>

                                        {/* File List */}
                                        <div className="flex gap-2 flex-col mt-4">
                                            {additionalFile.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2 items-center p-2 rounded border bg-neutral-800 text-white"
                                                >
                                                    <LucideNotepadText className="w-9 h-9 border p-1.5 rounded-sm bg-neutral-900" />
                                                    <div className="flex-1">
                                                        <p className="text-sm">{file.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleDeleteFile(index)}>
                                                        <X className="w-6 h-6 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => { setFile([]); setAdditionalFile([]) }}>Batal</AlertDialogCancel>
                                        <AlertDialogAction className="bg-yellow-400">Oke</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="flex gap-3 ms-1">
                                {
                                    [...file, ...additionalFile].length > 0 && (
                                        <>
                                            {/* Show 1 file */}
                                            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                                                <div className="flex items-center space-x-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                                                    <Paperclip className="w-4 h-4" />
                                                    <span>
                                                        {
                                                            // Get name from DiscussionFile or File
                                                            'name' in [...file, ...additionalFile][0]
                                                                ? [...file, ...additionalFile][0].name
                                                                : [...file, ...additionalFile][0].file_name
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {
                                                [...file, ...additionalFile].length > 1 && (
                                                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                                                        <div className="flex items-center space-x-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                                                            <Paperclip className="w-4 h-4" />
                                                            <span>{[...file, ...additionalFile].length - 1} file lainnya</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discussion;