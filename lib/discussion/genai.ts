import { genAI } from "../genai/genai";
import { createClient } from "../supabase/server";

//Generate response from gen AI
async function genaiText(prompt: string, course_id: string) {
    const supabase = await createClient();

    //Get user data
    const { data: { user } } = await supabase.auth.getUser();

    //Get discussion data
    const { data } = await supabase
        .from("discussion")
        .select("*")
        .eq("course_id", course_id)
        .eq("student_id", user?.id);

    //Create history
    let history = [];

    //History push
    if (data) {
        for (const item of data) {
        history.push(
            {
            role: "user",
            parts: [{ text: item.prompt }]
            },
            {
            role: "model",
            parts: [{ text: item.answer }]
            }
        );
        }
    }
    history.push({
        role: "user",
        parts: [{ text: prompt }]
    });

    //Generate answer
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
    });

    return response.text;
}

export { genaiText };
