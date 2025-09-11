import z from "zod";

export const ReadEmailsSchema = z.object({
    num: z.number().int().positive().describe("Number of latest emails to read")
});

export const ReadEmailsFromUserSchema = z.object({
    email: z.string().email().describe("Email address to read emails from")
});

export const WriteEmailSchema = z.object({
    email: z.string().email().describe("Email address to send email to"),
    subject: z.string().describe("Email subject"),
    content: z.string().describe("Email content")
});

export const DeleteEmailSchema = z.object({
    id: z.string().describe("Email ID to delete")
});

export const AgentStepSchema = z.discriminatedUnion("step", [
    z.object({
        step: z.literal("START"),
        content: z.string()
    }),
    z.object({
        step: z.literal("THINK"),
        content: z.string()
    }),
    z.object({
        step: z.literal("PLAN"),
        content: z.string()
    }),
    z.object({
        step: z.literal("TOOL"),
        tool: z.enum(["read_emails", "read_emails_from_user", "write_email", "delete_email"]),
        input: z.union([
            ReadEmailsSchema,
            ReadEmailsFromUserSchema,
            WriteEmailSchema,
            DeleteEmailSchema
        ])
    }),
    z.object({
        step: z.literal("OUTPUT"),
        content: z.string()
    })
]);

export const AgentResponseSchema = z.object({
    steps: z.array(AgentStepSchema),
    isCompleted: z.boolean().describe("Whether the task is fully completed and no further processing is needed")
});
