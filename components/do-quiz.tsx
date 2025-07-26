"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { createClient } from "@/lib/supabase/client";
import { QuizIcon } from "@/components/ui/quiz-icon";
import SkeletonList from "@/components/ui/skeleton-list";
import { toast } from "sonner";

type Quiz = {
  id: string;
  course_id: string;
  student_id: string;
  title: string;
  question_count: number;
  poin_per_question: number;
  attended: boolean;
  finished: boolean;
  created_at: string;
};

type StudentAnswer = {
  option: string;
  student_answer: string;
};

type AnswerOption = {
  option: string;
  answer: string;
};

type Question = {
  id: string;
  quiz_id: string;
  number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_at: string;
  quiz_answers: Answer | null;
};

type Answer = {
  id: string;
  qq_id: string;
  student_id: string;
  option: string;
};

export function DoQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("q");
  const number = parseInt(searchParams.get("n") || "1");
  const [question, setQuestion] = useState<Question | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const optionsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [studentAnswer, setStudentAnswer] = useState<StudentAnswer>({
    option: "",
    student_answer: "",
  });
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[] | null>(
    null
  );

  useEffect(() => {
    const supabase = createClient();
    async function fetchQuiz() {
      try {
        if (!quizId) return;

        const { data, error: quizError } = await supabase
          .from("quiz")
          .select("*")
          .eq("id", quizId)
          .single();

        if (quizError) throw quizError;
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setQuizLoading(false);
      } finally {
        setQuizLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    const supabase = createClient();
    async function fetchQuestion() {
      try {
        if (!quizId) return;

        const { data, error: questionError } = await supabase
          .from("quiz_questions")
          .select(
            "*, quiz_answer(id, qq_id, student_id, option, student_answer)"
          )
          .eq("quiz_id", quizId)
          .eq("number", number)
          .single();

        if (questionError) throw questionError;
        setQuestion(data);
        setAnswerOptions([
          {
            option: "A",
            answer: data.option_a,
          },
          {
            option: "B",
            answer: data.option_b,
          },
          {
            option: "C",
            answer: data.option_c,
          },
          {
            option: "D",
            answer: data.option_d,
          },
        ]);

        setStudentAnswer({
          option: data.quiz_answer.option,
          student_answer: data.quiz_answer.student_answer,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setQuestionLoading(false);
      } finally {
        setQuestionLoading(false);
      }
    }

    fetchQuestion();
  }, [number, quizId]);

  const debouncedSubmit = useDebouncedCallback(
    async (questionId: string, studentAnswer: StudentAnswer) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("quiz_answer").upsert(
          {
            qq_id: questionId,
            option: studentAnswer.option,
            student_id: quiz?.student_id || "",
            student_answer: studentAnswer.student_answer,
            is_correct:
              studentAnswer.student_answer === question?.correct_answer,
          },
          {
            onConflict: "qq_id",
          }
        );

        if (error) throw error;
      } catch (err) {
        console.error("Error submitting answer:", err);
      }
    },
    50
  );

  const handleAnswering = (option: AnswerOption) => {
    // Remove async here
    const newStudentAnswer = {
      option: option.option,
      student_answer: option.answer,
    };

    setStudentAnswer(newStudentAnswer);

    if (question?.id) {
      debouncedSubmit(question.id, newStudentAnswer); // Remove await here
    } else {
      console.error("Question ID is missing");
      setError("Question ID is missing");
      toast.error("Question ID is missing");
    }
  };

  const handleFinish = async () => {
    try {
      const supabase = createClient();
      const { data: answers, error: answersError } = await supabase
        .from("quiz_answer")
        .select("is_correct, quiz_questions!inner()")
        .eq("quiz_questions.quiz_id", quizId);

      if (answersError) throw answersError;

      console.log(answers);
      const { error: updateError } = await supabase
        .from("quiz")
        .update({
          finished: true,
          attended: true,
        })
        .eq("id", quizId);

      if (updateError) throw updateError;

      const totalPoint = answers.reduce((acc, answer) => {
        return answer.is_correct ? acc + 10 : acc;
      }, 0);
      console.log(`total point : ${totalPoint}`);
      const { error: quizResultError } = await supabase
        .from("quiz_result")
        .insert({
          quiz_id: quizId,
          student_id: quiz?.student_id || "",
          total_point: totalPoint,
        });

      if (quizResultError) throw quizResultError;

      toast.success("Hore! Kamu sudah menyelesaikan kuis ini");
      router.replace(`?tab=quiz&q=${quizId}`);
    } catch (err) {
      console.error("Error finishing quiz:", err);
      toast.error("Error finishing quiz");
    }
  };

  const handleNextAnswering = async () => {
    if (number === 10) {
      await handleFinish();
    } else {
      router.replace(`?tab=quiz&q=${quizId}&n=${number + 1}&attempt=true`, {
        scroll: false,
      });
    }
  };
  return (
    <div className={"mt-5"}>
      {quiz && (
        <div className="border flex  items-center gap-4 border-gray-500/20 rounded-xl p-4">
          <div
            className={
              "bg-gray-500/10 border-gray-500/20 border rounded-xl p-3"
            }
          >
            <QuizIcon />
          </div>
          <div>
            <h2 className="text-lg font-bold">{quiz.title}</h2>
            <p className="text-sm text-gray-400">
              {quiz.question_count} soal • {quiz.poin_per_question} poin/soal
            </p>
          </div>
        </div>
      )}

      {questionLoading ? (
        <div className={"flex flex-col items-center justify-center mt-5"}>
          <SkeletonList />
        </div>
      ) : (
        <div className={"mt-5"}>
          <h1 className={"text-md font-bold"}>Soal {number}</h1>
          <p className={"text-md"}>{question?.question}</p>
          <div className={"flex items-center justify-between mt-5 gap-2"}>
            <input
              type="radio"
              name={"option"}
              id="option"
              value={question?.option_a}
              ref={(el) => {
                optionsRef.current[0] = el;
              }}
              className={"hidden"}
            />
            <input
              type="radio"
              value={question?.option_b}
              name={"option"}
              id="option"
              ref={(el) => {
                optionsRef.current[1] = el;
              }}
              className={"hidden"}
            />
            <input
              type="radio"
              name={"option"}
              value={question?.option_c}
              id="option"
              ref={(el) => {
                optionsRef.current[2] = el;
              }}
              className={"hidden"}
            />
            <input
              type="radio"
              value={question?.option_d}
              name={"option"}
              id="option"
              ref={(el) => {
                optionsRef.current[3] = el;
              }}
              className={"hidden"}
            />

            {!answerOptions ? (
              <div className={"flex gap-5 items-center justify-center mt-5"}>
                <SkeletonList />
              </div>
            ) : (
              answerOptions.map((option, index: number) => {
                const backround =
                  option.answer === studentAnswer.student_answer
                    ? "bg-green-500/5 border border-green-500/30"
                    : "bg-gray-500/10 border border-card-border/10";
                return (
                  <div
                    onClick={() => handleAnswering(option)}
                    key={index}
                    className={`cursor-pointer flex flex-col items-center p-10 rounded-xl flex-1 gap-2 min-w-[200px] w-[200px] min-h-[160px] ${backround}`}
                  >
                    <h1 className={"text-xl font-bold"}>{option.option}</h1>
                    <p className={"text-md text-center"}>{option.answer}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {!questionLoading && (
        <div className={"mt-5 flex justify-end"}>
          <div className="flex justify-between mt-5 gap-2">
            <Button
              onClick={() =>
                router.replace(
                  `?tab=quiz&q=${quizId}&n=${number - 1}&attempt=true`, {scroll: false}
                )
              }
              disabled={number <= 1}
              className="bg-[#FFCB67] font-semibold hover:bg-primary-darker drop-shadow-[0px_4px_0px#FFAE00]"
            >
              Sebelumnya
            </Button>
            <Button
              onClick={() => handleNextAnswering()}
              className="bg-[#FFCB67] font-semibold hover:bg-primary-darker drop-shadow-[0px_4px_0px#FFAE00]"
            >
              {number >= 10 ? "Selesai" : "Selanjutnya"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
