import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { genaiText } from "@/lib/discussion/genai";

//API for update data to discussion
export async function POST(req: NextRequest, {params}: {params: {course_id:string, discussion_id:string}}) {
    const supabase = await createClient();
    
    //Get user data
    const {data: {user}, error: errorUser} = await supabase.auth.getUser();
    if(errorUser){
        return NextResponse.json({
            message: errorUser.message,
            detailError: errorUser
        }, {status: 401});
    }
    const student_id = user?.id;
    
    try{
        //Get body request
        const body = await req.json();
        const {prompt} = body;
        let answer;

        //Generate AI text
        answer = await genaiText(prompt, params.course_id);

        //Update data
        const { data, error: disError } = await supabase
        .from('discussion')
        .update({answer})
        .eq("id", params.discussion_id)
        .eq("course_id", params.course_id)
        .eq("student_id", student_id)
        .select()
        .single()

        if(disError){
            throw new Error(disError.message || "Update failed");
        }

        return NextResponse.json({
            message: "Success update data",
            data: data
        });
    }catch(error:any){
        //Send error response
        return NextResponse.json({
            message: error.message || 'Unknown error',
            detailError: error
        }, {status: 500});
    }


}