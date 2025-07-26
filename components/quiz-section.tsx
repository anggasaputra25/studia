"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Suspense, useEffect, useState } from "react";
import SkeletonList from "@/components/ui/skeleton-list";
import QuizList from "@/components/quiz-list";
import { useRouter, useSearchParams } from "next/navigation";
import CreateQuiz from "@/components/create-quiz";
import { DetailQuiz } from "@/components/detail-quiz";
import { DoQuiz } from "@/components/do-quiz";

export function QuizSection({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const create = searchParams.get("create") === "true";
  const tab = searchParams.get("tab") || (create ? "quiz" : "materials");
  const quizId = searchParams.get("q");
  const attempt = searchParams.get("attempt") === "true";
  const router = useRouter();

  const handleReplaceTab = () => {
    if ((tab === "quiz" && create) || (tab === "quiz" && !create && quizId)) {
      router.replace(`/courses/${courseId}?tab=quiz`);
    } else {
      router.replace(`/courses/${courseId}?tab=quiz&create=true`);
    }
  };
  return (
    <div className={"w-full rounded-xl"}>
      <Button
        onClick={handleReplaceTab}
        className="bg-primary font-semibold hover:bg-primary-darker drop-shadow-[0px_4px_0px#FFAE00]"
      >
        {(tab === "quiz" && create) || (tab === "quiz" && !create && quizId) ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          "Buat kuis"
        )}
      </Button>
      <Suspense fallback={<SkeletonList />}>
        {!create && tab === "quiz" && !quizId && !attempt && (
          <QuizList courseId={courseId} />
        )}
        {create && tab === "quiz" && !quizId && !attempt && (
          <CreateQuiz courseId={courseId} />
        )}
        {!create && tab === "quiz" && quizId && !attempt && <DetailQuiz />}
        {!create && tab === "quiz" && quizId && attempt && <DoQuiz />}
      </Suspense>
    </div>
  );
}
