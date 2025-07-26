import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {genAI} from "@/lib/genai/genai";
import {GEMINI_MODEL} from "@/constant/constant";
import {createClient} from '@/lib/supabase/client';

const materialFilesSchema = z
    .string()
    .transform((str, ctx) => {
        try {
            const parsed = JSON.parse(str);

            // Validasi bahwa hasil parsing adalah array
            if (!Array.isArray(parsed)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "material_files must be a JSON string containing an array"
                });
                return z.NEVER;
            }

            // Validasi setiap item dalam array adalah URL yang valid
            const urlSchema = z.string().url();
            const validatedUrls = parsed.map((item, index) => {
                const result = urlSchema.safeParse(item);
                if (!result.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid URL at index ${index}: ${item}`,
                        path: [index]
                    });
                    return z.NEVER;
                }
                return result.data;
            });

            return validatedUrls;
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "material_files must be a valid JSON string"
            });
            return z.NEVER;
        }
    });

// Simplified file schema untuk FormData handling
const fileSchema = z.instanceof(File);

const additionalFieldsSchema = z.array(fileSchema);

const requestSchema = z.object({
    material_files: materialFilesSchema,
    additional_files: additionalFieldsSchema,
});


async function uploadRemotePDFUrl(url: string, displayName: string) {
    const pdfBuffer = await fetch(url)
        .then((response) => response.arrayBuffer());

    const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

    const file = await genAI.files.upload({
        file: fileBlob,
        config: {
            displayName: displayName,
        },
    });

    if(!file.name) throw new Error('File name is empty');
    // Wait for the file to be processed.
    let getFile = await genAI.files.get({ name: file.name });
    while (getFile.state === 'PROCESSING') {
        getFile = await genAI.files.get({ name: file.name });
        console.log(`current file status: ${getFile.state}`);
        console.log('File is still processing, retrying in 5 seconds');

        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
    }
    if (getFile.state === 'FAILED') {
        throw new Error('File processing failed.');
    }

    return getFile;
}

interface QuizContent {
    quiz_id: string;
    number: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
}

interface GenerateContentsResult {
    data: QuizContent[] | null;
    error: Error | null | string;
}

interface GenerateTitleResult {
    data: string | null;
    error: Error | null | string;
}

async function generateTitle(uploadedFiles: any[]): Promise<GenerateTitleResult> {
    const prompt = `
Analisis file yang telah saya berikan. Buatlah judul yang singkat dan menarik berdasarkan konten file tersebut. Judul harus menggambarkan isi dari seluruh file yang diberikan.

PENTING: Berikan response HANYA berupa text judul, tanpa tanda kutip atau format lainnya.`;

    try {
        const fileParts = uploadedFiles.map(file => ({
            fileData: {
                mimeType: file.mimeType || 'application/pdf',
                fileUri: file.uri
            }
        }));

        const contents = [
            {
                role: 'user',
                parts: [
                    {text: prompt},
                    ...fileParts
                ]
            }
        ];

        const response = await genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
        });

        if (!response.text) throw new Error('Response text is empty');
        return {
            data: response.text.trim(),
            error: null
        };

    } catch (error) {
        console.error("Error while generating title:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

async function generateContents(
    quizId: string,
    uploadedFiles: []
): Promise<GenerateContentsResult> {
    const format = `[
  {
    "quiz_id": "${quizId}",
    "number": 1,
    "question": "YOUR_QUESTION_HERE",
    "option_a": "OPTION_A_TEXT",
    "option_b": "OPTION_B_TEXT", 
    "option_c": "OPTION_C_TEXT",
    "option_d": "OPTION_D_TEXT",
    "correct_answer": "CORRECT_ANSWER_TEXT"
  }
]`;

    const prompt = `
Analisis file yang telah saya berikan pada Anda. Buatlah quiz dengan 10 soal. Pastikan semua soal berhubungan dengan file yang saya berikan. Jika ada beberapa file, maka pastikan semua file terdapat pada soal. Sesuaikan bahasa soal dan jawaban dengan bahasa file yang telah saya berikan. 

PENTING: Berikan response HANYA dalam format JSON array yang valid seperti contoh berikut:
${format}

- Buat 10 soal (number: 1 sampai 10)
- quiz_id harus "${quizId}"
- correct_answer harus berisi teks jawaban yang benar, bukan huruf opsi
- Pastikan JSON format valid dan bisa di-parse
- Jangan tambahkan teks apapun selain JSON array
`;

    try {
        // Prepare file parts for Gemini API
        const fileParts = uploadedFiles.map(file => ({
            fileData: {
                mimeType: file.mimeType || 'application/pdf',
                fileUri: file.uri
            }
        }));

        // Prepare contents for Gemini API
        const contents = [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    ...fileParts
                ]
            }
        ];

        const response = await genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
        });

        // Get response text
        if(!response.text) throw new Error('Response text is empty');
        const responseText = response.text.trim();

        // Clean response text (remove markdown code blocks if present)
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // Parse JSON response
        let quizData: QuizContent[];
        try {
            quizData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text:', cleanedResponse);
            throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
        }

        // Validate response structure
        if (!Array.isArray(quizData)) {
            throw new Error('AI response is not an array');
        }

        if (quizData.length !== 10) {
            console.warn(`Expected 10 questions, got ${quizData.length}`);
        }

        // Validate each quiz item
        const validatedData = quizData.map((item, index) => {
            if (!item.quiz_id || !item.question || !item.option_a || !item.option_b ||
                !item.option_c || !item.option_d || !item.correct_answer) {
                throw new Error(`Invalid quiz structure at index ${index}: missing required fields`);
            }

            return {
                quiz_id: String(item.quiz_id),
                number: Number(item.number) || (index + 1),
                question: String(item.question),
                option_a: String(item.option_a),
                option_b: String(item.option_b),
                option_c: String(item.option_c),
                option_d: String(item.option_d),
                correct_answer: String(item.correct_answer)
            };
        });

        console.log(`Successfully generated ${validatedData.length} quiz questions`);

        return {
            data: validatedData,
            error: null
        };

    } catch (error) {
        console.error("Error while generating quiz:");
        console.error(error);

        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}


async function uploadRemotePDFRequest(fileRequest: File, displayName: string) {
    const arrayBuffer = await fileRequest.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: 'application/pdf' });

    const file = await genAI.files.upload({
        file: fileBlob,
        config: {
            displayName: displayName,
        },
    });

    if(!file.name) throw new Error('File name is empty');
    // Wait for the file to be processed.
    let getFile = await genAI.files.get({ name: file.name });
    while (getFile.state === 'PROCESSING') {
        getFile = await genAI.files.get({ name: file.name });
        console.log(`current file status: ${getFile.state}`);
        console.log('File is still processing, retrying in 5 seconds');

        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
    }
    if (getFile.state === 'FAILED') {
        throw new Error('File processing failed.');
    }

    return getFile;
}



export async function POST(
    req: NextRequest,
    context: { params: Promise<{ course_id: string }> }
) {
    try {
        // Parse FormData dari request
        const formData = await req.formData();

        // Extract material_files (string)
        const materialFiles = formData.get('material_files');
        if (!materialFiles || typeof materialFiles !== 'string') {
            return NextResponse.json({
                message: "Validation error",
                detailError: "material_files field is required and must be a string"
            }, {status: 400});
        }

        // Extract additional_fields (files)
        const additionalFiles: File[] = [];

        // Ambil semua files dengan key 'additional_fields'
        const files = formData.getAll('additional_files');
        for (const file of files) {
            if (file instanceof File) {
                additionalFiles.push(file);
            }
        }

        // Prepare data untuk validation
        const requestData = {
            material_files: materialFiles,
            additional_files: additionalFiles
        };

        // Validate request dengan Zod
        const validation = requestSchema.safeParse(requestData);

        if (!validation.success) {
            const errors = validation.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return NextResponse.json({
                message: "Validation error",
                detailError: "Request data is invalid",
                errors: errors
            }, {status: 400});
        }

        // Data sudah tervalidasi
        const { material_files, additional_files } = validation.data;
        const {course_id: courseId} =  await context.params;
        const uploadedFiles = [];

        if (material_files && material_files.length > 0) {
            for (const [index, url] of material_files.entries()) {
                try {
                    const file = await uploadRemotePDFUrl(url, `material_file_${index}`);
                    if (file.name) {
                        uploadedFiles.push(file);
                    }
                } catch (error) {
                    console.error(`Error uploading material file ${index}:`, error);
                }
            }
        }

        if (additional_files && additional_files.length > 0) {
            for (const [index, file] of additional_files.entries()) {
                try {
                    const uploadedFile = await uploadRemotePDFRequest(file, `additional_file_${index}`);
                    if (uploadedFile.name) {
                        uploadedFiles.push(uploadedFile);
                    }
                } catch (error) {
                    console.error(`Error uploading additional file ${index}:`, error);
                }
            }
        }

        if (uploadedFiles.length === 0) {
            return NextResponse.json({
                message: "No valid files were processed",
                detailError: "All file uploads failed or no files were provided"
            }, {status: 400});
        }

        const {data: titleResponse, error: titleError} = await generateTitle(uploadedFiles);
        if (titleError) {
            return NextResponse.json({
                message: "Error while generating title",
                detailError: titleError
            }, {status: 500})
        }

        const supabase = createClient();

        const {data: quizData, error: insertError} = await supabase
            .from('quiz')
            .insert({
                course_id: courseId,
                title: titleResponse,
                student_id: "146a390d-7647-4cd0-a55c-a175ed8c7f31"
            })
            .select('id')
            .single()

        if (insertError) {
            return NextResponse.json({
                message: "Error inserting quiz data",
                detailError: insertError.message
            }, {status: 500})
        }

        const {data: contentResponse, error: contentError} = await generateContents(quizData.id, uploadedFiles);
        if (contentError) {
            // Delete the quiz if content generation fails
            await supabase.from('quiz').delete().eq('id', quizData.id);
            return NextResponse.json({
                message: "Error while generating quiz",
                detailError: contentError
            }, {status: 500})
        }

        // Insert quiz questions
        const {error: questionsError} = await supabase
            .from('quiz_questions')
            .insert(contentResponse);

        if (questionsError) {
            // Delete the quiz if questions insertion fails
            await supabase.from('quiz').delete().eq('id', quizData.id);
            return NextResponse.json({
                message: "Error inserting quiz questions",
                detailError: questionsError.message
            }, {status: 500})
        }


        return NextResponse.json({
            message: "Quiz generated successfully",
            data: {
                quiz: quizData,
                questions: contentResponse
            }
        }, {status: 200})


    } catch (error) {
        console.error("Error while generating quiz:");
        console.error(error);

        return NextResponse.json({
            message: "Error while generating quiz",
            detailError: "Something went wrong while processing the request"
        }, {status: 500});
    }
}