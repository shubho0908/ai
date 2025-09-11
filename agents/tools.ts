import { z } from "zod";
import { MOCK_EMAILS } from "./constant.ts";
import { DeleteEmailSchema, ReadEmailsFromUserSchema, ReadEmailsSchema, WriteEmailSchema } from "./types.ts";

export async function executeReadEmails(input: z.infer<typeof ReadEmailsSchema>): Promise<string> {
    const emailsToShow = MOCK_EMAILS.slice(0, input.num);
    
    if (emailsToShow.length === 0) {
        return `No emails found.`;
    }

    return `Latest ${input.num} emails:\n${emailsToShow.map((email, i) => 
        `${i + 1}. ${email.subject}\n   From: ${email.from}\n   Date: ${email.date}\n   Preview: ${email.snippet}\n   ID: ${email.id}`
    ).join('\n\n')}`;
}

export async function executeReadEmailsFromUser(input: z.infer<typeof ReadEmailsFromUserSchema>): Promise<string> {
    const emailsFromUser = MOCK_EMAILS.filter(email => 
        email.from.toLowerCase().includes(input.email.toLowerCase())
    );
    
    if (emailsFromUser.length === 0) {
        return `No emails found from ${input.email}`;
    }

    return `Found ${emailsFromUser.length} emails from ${input.email}:\n${emailsFromUser.map((email, i) => 
        `${i + 1}. ${email.subject}\n   Date: ${email.date}\n   Preview: ${email.snippet}\n   ID: ${email.id}`
    ).join('\n\n')}`;
}

export async function executeWriteEmail(input: z.infer<typeof WriteEmailSchema>): Promise<string> {
    const mockId = 'msg_' + Math.random().toString(36).substring(2, 11);
    
    console.log(`\n📧 [MOCK] Sending email:`);
    console.log(`   To: ${input.email}`);
    console.log(`   Subject: ${input.subject}`);
    console.log(`   Content: ${input.content}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `Email successfully sent to ${input.email} with subject "${input.subject}". Message ID: ${mockId}`;
}

export async function executeDeleteEmail(input: z.infer<typeof DeleteEmailSchema>): Promise<string> {
    const emailExists = MOCK_EMAILS.find(email => email.id === input.id);
    
    if (!emailExists) {
        return `Email with ID ${input.id} not found`;
    }
    
    console.log(`🗑️ [MOCK] Deleting email: "${emailExists.subject}"`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `Email "${emailExists.subject}" (ID: ${input.id}) has been moved to trash successfully`;
}

export async function executeTool(toolName: string, input: any): Promise<string> {
    switch (toolName) {
        case "read_emails":
            const readEmailsInput = ReadEmailsSchema.parse(input);
            return await executeReadEmails(readEmailsInput);
            
        case "read_emails_from_user":
            const readEmailsFromUserInput = ReadEmailsFromUserSchema.parse(input);
            return await executeReadEmailsFromUser(readEmailsFromUserInput);
            
        case "write_email":
            const writeEmailInput = WriteEmailSchema.parse(input);
            return await executeWriteEmail(writeEmailInput);
            
        case "delete_email":
            const deleteEmailInput = DeleteEmailSchema.parse(input);
            return await executeDeleteEmail(deleteEmailInput);
            
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}