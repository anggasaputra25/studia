interface Discussion{
    id: string,
    course_id: string,
    student_id: string,
    prompt: string,
    answer: string,
    created_at: string
}
interface Material{
    id: string,
    name: string,
    course_id: string,
    created_at: string
}
interface MaterialFiles{
    id: string,
    material_id: string,
    file_name: string,
    file_path: string,
    file_url: string,
    created_at: string
}
interface DiscussionFiles{
    id: string,
    discussion_id: string,
    mf_id: string,
    created_at: string
}
interface AdditionalDiscussionFiles{
    id: string,
    discussion_id: string,
    file_name: string,
    file_type: string,
    file_path: string,
    created_at: string
}
interface DiscussionFile{
    id: string,
    name: string,
    path: string,
    from: string
}

export {Discussion, Material, MaterialFiles, DiscussionFiles, AdditionalDiscussionFiles, DiscussionFile}