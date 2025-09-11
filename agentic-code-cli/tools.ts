import fs from "fs/promises";
import path from "path";
import { 
    ReadFileSchema, 
    WriteFileSchema, 
    UpdateFileSchema, 
    DeleteFileSchema,
    ReadFolderSchema,
    CreateFolderSchema,
    DeleteFolderSchema,
    type ReadFileInput,
    type WriteFileInput,
    type UpdateFileInput,
    type DeleteFileInput,
    type ReadFolderInput,
    type CreateFolderInput,
    type DeleteFolderInput
} from "./types.ts";

export async function executeTool(toolName: string, input: any): Promise<string> {
    switch (toolName) {
        case "readFile":
            const readFileInput = ReadFileSchema.parse(input);
            return await executeReadFile(readFileInput);
            
        case "writeFile":
            const writeFileInput = WriteFileSchema.parse(input);
            return await executeWriteFile(writeFileInput);
            
        case "updateFile":
            const updateFileInput = UpdateFileSchema.parse(input);
            return await executeUpdateFile(updateFileInput);
            
        case "deleteFile":
            const deleteFileInput = DeleteFileSchema.parse(input);
            return await executeDeleteFile(deleteFileInput);
            
        case "readFolder":
            const readFolderInput = ReadFolderSchema.parse(input);
            return await executeReadFolder(readFolderInput);
            
        case "createFolder":
            const createFolderInput = CreateFolderSchema.parse(input);
            return await executeCreateFolder(createFolderInput);
            
        case "deleteFolder":
            const deleteFolderInput = DeleteFolderSchema.parse(input);
            return await executeDeleteFolder(deleteFolderInput);
            
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function executeReadFile(input: ReadFileInput): Promise<string> {
    try {
        const content = await fs.readFile(input.filePath, 'utf-8');
        return `File content from ${input.filePath}:\n${content}`;
    } catch (error) {
        return `Error reading file ${input.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeWriteFile(input: WriteFileInput): Promise<string> {
    try {
        // Ensure directory exists
        const dir = path.dirname(input.filePath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(input.filePath, input.content, 'utf-8');
        return `Successfully wrote content to ${input.filePath}`;
    } catch (error) {
        return `Error writing file ${input.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeUpdateFile(input: UpdateFileInput): Promise<string> {
    try {
        const content = await fs.readFile(input.filePath, 'utf-8');
        const updatedContent = content.replace(new RegExp(input.searchText, 'g'), input.replaceText);
        
        if (content === updatedContent) {
            return `No matches found for "${input.searchText}" in ${input.filePath}`;
        }
        
        await fs.writeFile(input.filePath, updatedContent, 'utf-8');
        return `Successfully updated ${input.filePath}, replaced "${input.searchText}" with "${input.replaceText}"`;
    } catch (error) {
        return `Error updating file ${input.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeDeleteFile(input: DeleteFileInput): Promise<string> {
    try {
        await fs.unlink(input.filePath);
        return `Successfully deleted file ${input.filePath}`;
    } catch (error) {
        return `Error deleting file ${input.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeReadFolder(input: ReadFolderInput): Promise<string> {
    try {
        const items = await fs.readdir(input.folderPath, { withFileTypes: true });
        const files = items.filter(item => item.isFile()).map(item => item.name);
        const folders = items.filter(item => item.isDirectory()).map(item => item.name);
        
        let result = `Contents of ${input.folderPath}:\n`;
        if (folders.length > 0) {
            result += `\nFolders:\n${folders.map(f => `  📁 ${f}`).join('\n')}`;
        }
        if (files.length > 0) {
            result += `\nFiles:\n${files.map(f => `  📄 ${f}`).join('\n')}`;
        }
        if (files.length === 0 && folders.length === 0) {
            result += '\n(Empty folder)';
        }
        
        return result;
    } catch (error) {
        return `Error reading folder ${input.folderPath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeCreateFolder(input: CreateFolderInput): Promise<string> {
    try {
        await fs.mkdir(input.folderPath, { recursive: true });
        return `Successfully created folder ${input.folderPath}`;
    } catch (error) {
        return `Error creating folder ${input.folderPath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function executeDeleteFolder(input: DeleteFolderInput): Promise<string> {
    try {
        await fs.rmdir(input.folderPath, { recursive: true });
        return `Successfully deleted folder ${input.folderPath} and all its contents`;
    } catch (error) {
        return `Error deleting folder ${input.folderPath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}