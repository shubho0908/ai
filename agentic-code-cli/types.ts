import { z } from "zod";

const StepSchema = z.object({
    step: z.enum(["START", "THINK", "PLAN", "TOOL", "OUTPUT"]),
    content: z.string().optional(),
    tool: z.string().optional(),
    input: z.record(z.string(), z.any()).optional()
}).refine((data) => {
    if (data.step === "TOOL") {
        return data.tool && data.input;
    } else {
        return data.content;
    }
}, {
    message: "TOOL steps must have 'tool' and 'input', other steps must have 'content'"
});

export const AgentResponseSchema = z.object({
    steps: z.array(StepSchema),
    isCompleted: z.boolean()
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;

export const ReadFileSchema = z.object({
    filePath: z.string()
});

export const WriteFileSchema = z.object({
    filePath: z.string(),
    content: z.string()
});

export const UpdateFileSchema = z.object({
    filePath: z.string(),
    searchText: z.string(),
    replaceText: z.string()
});

export const DeleteFileSchema = z.object({
    filePath: z.string()
});

export const ReadFolderSchema = z.object({
    folderPath: z.string()
});

export const CreateFolderSchema = z.object({
    folderPath: z.string()
});

export const DeleteFolderSchema = z.object({
    folderPath: z.string()
});

export type ReadFileInput = z.infer<typeof ReadFileSchema>;
export type WriteFileInput = z.infer<typeof WriteFileSchema>;
export type UpdateFileInput = z.infer<typeof UpdateFileSchema>;
export type DeleteFileInput = z.infer<typeof DeleteFileSchema>;
export type ReadFolderInput = z.infer<typeof ReadFolderSchema>;
export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;
export type DeleteFolderInput = z.infer<typeof DeleteFolderSchema>;