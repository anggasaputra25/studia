'use client'
import type { Discussion } from "@/app/types/discussion";
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

    //Input state
    const [inputPrompt, setInputPrompt] = useState("");
    const [inputPromptNew, setInputPromptNew] = useState("");

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

        //Get materials data

        fetchDiscussion()
    }, [course_id]);

    //Send message
    const sendMessage = async () => {
        if (!inputPrompt.trim()) return;

        setLoadingSendMessage(true);
        try {
            const res = await fetch(`/api/courses/${course_id}/discussion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: inputPrompt })
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
            <div ref={bottomRef} />

            {/* Input Area */}
            <div className="border-t border-gray-800 bg-[#0a0a0a] sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="relative">
                        {/* Text Input */}
                        <div className="flex items-end space-x-3 bg-[#1a1a1a] rounded-xl p-3 border border-gray-700 focus-within:border-orange-500 transition-colors">
                            <div className="flex-1">
                                <textarea
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Tulis pesan..."
                                    className="w-full bg-transparent border-0 resize-none outline-none text-white placeholder-gray-500 leading-relaxed"
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
                                className={`flex-shrink-0 p-2 rounded-lg transition-all ${!inputPrompt.trim() || loadingSendMessage
                                    ? 'text-gray-500 cursor-not-allowed'
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
                                        <AlertDialogTitle>Sederhanakan Materi</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Mulai sederhanakan dengan bantuan AI.
                                        </AlertDialogDescription>

                                        <AlertDialogTitle>Pilih file materi dari kelas</AlertDialogTitle>
                                        <div className="flex gap-3 flex-wrap">
                                            <button
                                                className={`border p-2 rounded-sm transition "bg-neutral-900 text-white"`}
                                            >
                                                Testing
                                            </button>
                                        </div>

                                        <AlertDialogTitle>Upload file</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Upload file tambahanmu di sini
                                        </AlertDialogDescription>

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            style={{ display: 'none' }}
                                        />

                                        {/* Trigger Button */}
                                        <button
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
                                            <div
                                                className="flex gap-2 items-center p-2 rounded"
                                            >
                                                <LucideNotepadText className="w-9 h-9 border p-1.5 rounded-sm bg-neutral-900" />
                                                <div className="flex-1">
                                                    <p className="text-sm">Nama File</p>
                                                    <AlertDialogDescription className="text-xs">
                                                        1 MB
                                                    </AlertDialogDescription>
                                                </div>
                                                <button>
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction className="bg-yellow-400">Ya</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="flex gap-3 ms-1">
                                {/* File Preview */}
                                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                                        <Paperclip className="w-4 h-4" />
                                        <span>materi.cnbsk.pdf</span>
                                    </div>
                                </div>

                                {/* File Preview */}
                                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                                        <Paperclip className="w-4 h-4" />
                                        <span>2 file lainnya</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discussion;