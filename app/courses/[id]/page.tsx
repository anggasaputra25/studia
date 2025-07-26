import {QuizSection} from "@/components/quiz-section";

export default  function Page({params}: {params: {id: string}}) {
    const {id: courseId} = params;
    return <div className={'p-5'}>
        <QuizSection courseId={courseId}/>
    </div>
}