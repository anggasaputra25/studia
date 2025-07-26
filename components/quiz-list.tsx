import { QuizIcon } from "@/components/ui/quiz-icon";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SkeletonList from "@/components/ui/skeleton-list";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  quiz_id: string;
  course_id: string;
  title: string;
  question_count: number;
  poin_per_question: number;
  attended: boolean;
  finished: boolean;
  created_at: string;
};

export default function QuizList({ courseId }: { courseId: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const { data, error } = await supabase
          .from("quiz")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setQuizzes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [courseId]);

  if (loading) {
    return (
      <div className={"mt-5"}>
        <SkeletonList />
      </div>
    );
  }

  const handleQuizAttempt = async (quiz: Quiz) => {
    if (quiz.attended && quiz.finished) {
      router.replace(`?tab=quiz&q=${quiz.id}`);
      return;
    }
    try {
      const { error } = await supabase
        .from("quiz")
        .update({ attended: true })
        .eq("id", quiz.id);

      if (error) throw error;

      router.push(`/courses/${courseId}?tab=quiz&q=${quiz.id}&attempt=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (error && error.length > 0) {
    return (
      <div
        className={
          "w-full border border-card-border/10 rounded-xl flex justify-between items-center p-3 mt-5"
        }
      >
        <p className={"text-red-500 text-center"}>Error: {error}</p>
      </div>
    );
  }
  return (
    <div>
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className={
              "w-full border border-card-border/10 rounded-xl flex justify-between p-3 mt-5"
            }
          >
            <div className={"flex gap-4"}>
              <div
                className={
                  "p-5 rounded-xl bg-gray-500/10 border border-card-border/10 w-15 h-15"
                }
              >
                <QuizIcon />
              </div>

              <div className={"flex flex-col justify-center"}>
                <Link
                  href={`/courses/${courseId}?tab=quiz&q=${quiz.id}`}
                  passHref={true}
                  key={quiz.id}
                  className={"cursor-pointer"}
                >
                  <h2 className={"font-bold"}>{quiz.title}</h2>
                </Link>
                <p className={"text-sm text-gray-500"}>
                  {quiz.question_count} soal • {quiz.poin_per_question}{" "}
                  poin/soal
                </p>
              </div>
            </div>

            <div className={"flex gap-2 items-center"}>
              <Button
                onClick={() => handleQuizAttempt(quiz)}
                size={"sm"}
                className={`${
                  !(
                    (!quiz.attended && !quiz.finished) ||
                    (quiz.attended && !quiz.finished)
                  ) ||
                  "drop-shadow-[0px_4px_0px#FFAE00] bg-[#FFCB67] font-semibold hover:bg-primary-darker"
                }`}
              >
                {quiz.attended && quiz.finished && "Lihat hasil"}
                {quiz.attended && !quiz.finished && "Lanjutkan..."}
                {!quiz.attended && !quiz.finished && "Mulai"}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center mt-5">
          <p>Kuis kamu lagi kosong</p>
        </div>
      )}
    </div>
  );
}
