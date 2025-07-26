import {useEffect, useState} from 'react'
import {createClient} from '@/lib/supabase/client'
import {useRouter, useSearchParams} from 'next/navigation'
import {QuizIcon} from "@/components/ui/quiz-icon";
import SkeletonList from "@/components/ui/skeleton-list";
import {Button} from "@/components/ui/button";
import {Trash} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {toast} from "sonner";


type Quiz = {
    id: string
    course_id: string
    student_id: string
    title: string
    question_count: number
    poin_per_question: number
    attended: boolean
    finished: boolean
    created_at: string
    quiz_result: Result | null

}

type Result = {
    id: string,
    quiz_id: string,
    student_id: string,
    total_point: number,
    created_at: string,
}



type Question = {
    id: string
    quiz_id: string
    number: number
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    created_at: string
    quiz_answer: Answer | null
}

type Answer = {
    id: string
    qq_id: string
    student_id: string
    option: string
    student_answer: string
    is_correct: boolean
    created_at: string
}

export function DetailQuiz() {
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const searchParams = useSearchParams()
    const quizId = searchParams.get('q')
    const supabase = createClient()

    useEffect(() => {
        async function fetchQuizData() {
            try {
                if (!quizId) return

                const {data: quizData, error: quizError} = await supabase
                    .from('quiz')
                    .select('*, quiz_result(*))')
                    .eq('id', quizId)
                    .single()

                if (quizError) throw quizError

                const {data: questionsData, error: questionsError} = await supabase
                    .from('quiz_questions')
                    .select('*, quiz_answer(*)')
                    .eq('quiz_id', quizId)
                    .order('number', {ascending: true})

                if (questionsError) throw questionsError

                setQuiz(quizData)
                setQuestions(questionsData)
            } catch (err) {
                console.log(err);
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchQuizData()
    }, [quizId])

    if(!quizId) {
        return <div className={'mt-5 w-full'}>
            <p className={'text-center'}>Quiz not found</p>
        </div>
    }

    if (loading) {
        return <div className={'flex flex-col items-center justify-center mt-5 w-full'}>
            <SkeletonList/>
        </div>
    }

    if (error) {
        return <div className="text-red-500 text-center mt-5">Error: {error}</div>
    }


    return (
        <div className="space-y-6 mt-5">
            {quiz && (
                <div className={'border-2 flex  items-center gap-4 justify-between border-gray-500/20 rounded-xl p-4'}>
                    <div className="flex  gap-2 items-center">
                        <div className={'bg-gray-500/10 border-gray-500/20 border-2 rounded-xl p-3'}>
                            <QuizIcon/>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{quiz.title}</h2>
                            <p className="text-sm text-gray-400">
                                {quiz.question_count} soal • {quiz.poin_per_question} poin/soal
                            </p>
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger>
                            <div
                                className={'flex p-3 rounded-full cursor-pointer bg-red-500/5 border-2 border-red-500/50 gap-2 items-center'}>
                                <Trash className={'text-red-500'} size={20}/>
                            </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Quiz</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin menghapus quiz ini? Aksi ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={async () => {
                                        try {
                                            const {error} = await supabase
                                                .from('quiz')
                                                .delete()
                                                .eq('id', quiz?.id)
                                            if (error) throw error
                                            router.replace(`?tab=quiz`)
                                            toast.success('Quiz berhasil dihapus')
                                        } catch (err) {
                                            setError(err instanceof Error ? err.message : 'An error occurred')
                                        }
                                    }}
                                    className={'bg-red-500 hover:bg-red-600'}
                                >
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {quiz && !quiz.attended && !quiz.finished && (
                <div className={'flex flex-col items-center justify-center mt-5'}>
                    <h2 className={'text-xl font-medium'}>
                        Kamu belum mengerjakan quiz ini 😢
                    </h2>
                    <p className={'text-sm text-gray-300 mt-2'}>Ayo kerjakan sekarang dan lihat hasilnya</p>
                    <Button
                        onClick={() => router.replace(`?tab=quiz&q=${quiz.id}&attempt=true`)}
                     className={'bg-[#FFCB67] font-medium hover:bg-[#FFCB67] drop-shadow-[0px_4px_0px#FFAE00] mt-5'}
                    >
                        Kerjakan sekarang
                    </Button>
                </div>
            )}

            {quiz && quiz.attended && quiz.finished && (
                <div className={'mt-5'}>
                    <div className={'p-5 border-gray-500/20 rounded-xl'}>
                        <p className={'text-md font-lg font-bold '}>
                            Poin {quiz.quiz_result?.total_point}/100 diperoleh
                        </p>
                        <p className={'text-sm text-gray-400'}>
                            Selesai pada {quiz.quiz_result?.created_at ? new Date(quiz.quiz_result.created_at).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            }) : ''}
                        </p>
                    </div>

                    {questions && questions.map((question, index: number) => {
                        const options = [
                            {
                                option: 'A',
                                answer: question.option_a
                            },
                            {
                                option: 'B',
                                answer: question.option_b
                            },
                            {
                                option: 'C',
                                answer: question.option_c
                            },
                            {
                                option: 'D',
                                answer: question.option_d
                            }
                        ]

                        return (
                            <div key={index} className={'mt-5 p-5 rounded-xl'}>
                                <h1 className={'text-md font-bold'}>
                                    Soal {question.number}
                                </h1>
                                <p className={'text-md'}>
                                    {question.question}
                                </p>

                                {options.map((option, index: number) => {
                                    const background = question.quiz_answer?.option === option.option
                                        ? question.quiz_answer.is_correct
                                            ? 'bg-green-500/5 border-2 border-green-500/20'
                                            : 'bg-red-500/5 border-2 border-red-500/20'
                                        : 'bg-gray-500/5 border-2 border-gray-500/20'
                                    return (
                                        <div key={index} className={`p-5 ${background} rounded-xl mt-3`}>
                                        <h1 className={'text-md font-bold'}>
                                                {option.option}
                                            </h1>
                                            <p className={'text-md'}>
                                                {option.answer}
                                            </p>
                                        </div>
                                    )
                                })}

                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}