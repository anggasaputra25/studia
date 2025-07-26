import { genAI } from "@/lib/genai/genai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const geminiText = async (text: string) => {
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: text,
    });
    return response.text;
}

const geminiDocument = async (buffer: ArrayBuffer) => {
    const contents = [
        { text: "Rangkumlah keseluruhan isi file berikut ini. Jangan isi penjelasan lain seperti 'file ini berisi bla-bla', langsung berikan rangkumannya" },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(buffer).toString("base64")
            }
        }
    ];

    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents
    });

    return response;
}

export async function POST(req: NextRequest, { params }: { params: { course_id: string, material_id: string } }) {
    const supabase = await createClient();
    const formData = await req.formData();
    const files = formData.getAll("files");
    const urls = formData.getAll("urls");

    const {
        data: { user },
        error: errorUser
    } = await supabase.auth.getUser();

    if (errorUser || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let combinedText = '';
    if (files.length != 0) {
        for (const file of files) {
            if (file instanceof File) {
                const buffer = await file.arrayBuffer();
                const response = await geminiDocument(buffer);
                combinedText += `${response.text}\n\n`;
            } else {
                console.warn("FormData entry is not a file:", file);
            }
        }
    }
    if (urls.length != 0) {
        for (const url of urls) {
            if (typeof url === "string") {
                const buffer = await fetch(url).then((response) => response.arrayBuffer());
                const response = await geminiDocument(buffer);
                combinedText += `${response.text}\n\n`;
            } else {
                console.warn("Nilai bukan URL string:", url);
            }
        }
    }

    const summary = await geminiText(`Berikut ini adalah rangkuman dari beberapa file, berikan aku penjelasan yang mudah dimengerti dan ringkas. Jawab prompt ini tanpa penjelasan lainnya dan hanya berikan ringkasannya saja\n\n${combinedText}`);
    const title = await geminiText(`Berikan aku satu judul yang cocok untuk rangkuman ini. Jawab prompt ini tanpa penjelasan lain dan hanya judulnya saja\n\n${summary}`);


    const { data, error } = await supabase
        .from('simplify_materials')
        .insert([
            {
                material_id: params.material_id,
                student_id: user.id,
                title: title,
                simplified_content: summary
            },
        ])
        .select()

    if (error) {
        return NextResponse.json({ message: "Tidak dapat insert data ke simplify materials", error: error })
    }

    return NextResponse.json({ message: "Upload sukses", data: data });
}