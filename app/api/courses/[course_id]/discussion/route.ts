import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { genaiFile, genaiText } from "@/lib/discussion/genai";

//API for insert data to discussion
export async function POST(
  req: NextRequest,
  { params }: { params: { course_id: string } }
) {
  const course_id = params.course_id;
  const supabase = await createClient();

  //Get user data
  const {
    data: { user },
    error: errorUser,
  } = await supabase.auth.getUser();
  if (errorUser) {
    return NextResponse.json(
      {
        message: errorUser.message,
        detailError: errorUser,
      },
      { status: 401 }
    );
  }
  const student_id = user?.id;

  try {
    //Get body request
    const body = await req.json();
    const { prompt, file } = body;
    let answer;

    //Generate AI text
    answer = await genaiText(prompt, course_id);

    //Generate AI file
    if (file && file.length != 0) {
      let question = `Kamu adalah asisten AI yang bertugas menjawab pertanyaan pengguna berdasarkan file yang telah mereka lampirkan. File tersebut sudah saya bacakan dan sampaikan langsung kepadamu, seolah-olah kamu membacanya sendiri.
            Jawablah pertanyaan pengguna dengan jelas, langsung, dan berdasarkan isi file tersebut. Hindari menyebut bahwa kamu mendapatkan ringkasan atau bantuan dari pihak lain.
            Pertanyaan dari pengguna: ${prompt}
            Berikut adalah isi file yang dilampirkan oleh pengguna:`;

      for (const fileData of file) {
        let answerFile = await genaiFile(fileData.name, fileData.path);
        question += `File ${fileData.name}: ${answerFile}, `;
      }
      answer = await genaiText(question, course_id);
    }

    //Insert data
    const { data: disData, error: disError } = await supabase
      .from("discussion")
      .insert({ course_id, student_id, prompt, answer })
      .select()
      .single();

    if (disError) {
      throw new Error(disError.message || "Insert failed");
    }

    //File upload
    if (file && file.length != 0) {
      let discussion_id = disData?.id;
      let file_type = "pdf";
      for (const fileData of file) {
        if (fileData.from == "material") {
          let mf_id = fileData.id;
          const { error } = await supabase
            .from("discussion_files")
            .insert({ discussion_id, mf_id })
            .select();
          if (error) {
            return NextResponse.json({
              message: error.message,
              detailError: error,
            });
          }
        } else {
          let file_name = fileData.name;
          let file_path = fileData.path;
          const { error } = await supabase
            .from("additional_discussion_files")
            .insert({ discussion_id, file_name, file_type, file_path })
            .select();
          if (error) {
            return NextResponse.json({
              message: error.message,
              detailError: error,
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: "Success insert data",
      data: disData,
    });
  } catch (error: any) {
    //Send error response
    return NextResponse.json(
      {
        message: error.message || "Unknown error",
        detailError: error,
      },
      { status: 500 }
    );
  }
}
