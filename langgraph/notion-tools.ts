import { Client } from "@notionhq/client";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

function addThinkingStep(message: string) {
    console.log(`🤖 ${message}`);
}

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

// Create Page Tool
export const createPageTool = tool(
    async (input) => {
        const { parentId, title, content, properties } = input as {
            parentId: string;
            title: string;
            content?: string;
            properties?: any;
        };

        try {
            addThinkingStep("Creating new Notion page 📝");
            
            const pageData: any = {                parent: {
                    type: "page_id",
                    page_id: parentId
                },
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: title
                                }
                            }
                        ]
                    },
                    ...properties
                }
            };

            if (content) {
                pageData.children = [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: content
                                    }
                                }
                            ]
                        }
                    }
                ];
            }

            const response = await notion.pages.create(pageData);
            addThinkingStep(`Page "${title}" created successfully ✨`);

            return JSON.stringify({
                success: true,
                pageId: response.id,
                url: `https://notion.so/${response.id.replace(/-/g, '')}`,
                message: `Page "${title}" created successfully`
            }, null, 2);

        } catch (error) {
            addThinkingStep(`Error creating page: ${error instanceof Error ? error.message : 'Unknown error'} ❌`);
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to create page "${title}"`
            }, null, 2);
        }
    },
    {
        name: "createNotionPage",
        description: "ALWAYS use this for ANY request to create, add, make, or build new pages, documents, notes, articles, or content in Notion. Handles creating pages with titles, initial content, and custom properties. Works for both standalone pages and database entries. Use for: 'create page', 'add note', 'make document', 'new page', 'build wiki page', 'add entry'.",
        schema: z.object({
            parentId: z.string().describe("The ID of the parent page or database"),
            title: z.string().describe("The title of the new page"),
            content: z.string().optional().describe("Initial content for the page"),
            properties: z.any().optional().describe("Additional properties for the page (for database pages)")
        })
    }
);

// Read Page Tool
export const readPageTool = tool(
    async (input) => {
        const { pageId, includeContent } = input as {
            pageId: string;
            includeContent?: boolean;
        };

        try {
            addThinkingStep("Reading Notion page content 📖");

            const page = await notion.pages.retrieve({ page_id: pageId });

            let content = null;
            if (includeContent) {
                const blocks = await notion.blocks.children.list({
                    block_id: pageId,
                });
                content = blocks.results;
            }

            return JSON.stringify({
                success: true,
                page: {
                    ...page,
                    url: `https://notion.so/${page.id.replace(/-/g, '')}`
                },
                ...(content && { content })
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to read page with ID: ${pageId}`
            }, null, 2);
        }
    },
    {
        name: "readNotionPage",
        description: "ALWAYS use this for ANY request to read, view, show, get, fetch, or retrieve page content from Notion. Returns page properties, metadata, and optionally all content blocks. Use for: 'show page', 'read content', 'get page info', 'view document', 'fetch page', 'what's in this page', 'page details'.",
        schema: z.object({
            pageId: z.string().describe("The ID of the page to read"),
            includeContent: z.boolean().optional().describe("Whether to include the page content blocks")
        })
    }
);

// Update Page Tool
export const updatePageTool = tool(
    async (input) => {
        const { pageId, properties, archived } = input as {
            pageId: string;
            properties?: any;
            archived?: boolean;
        };

        try {
            addThinkingStep("Updating Notion page properties ✏️");

            const updateData: any = {};

            if (properties) {
                updateData.properties = properties;
            }

            if (archived !== undefined) {
                updateData.archived = archived;
            }

            const response = await notion.pages.update({
                page_id: pageId,
                ...updateData
            });

            return JSON.stringify({
                success: true,
                pageId: response.id,
                message: `Page updated successfully`,
                updates: updateData
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to update page with ID: ${pageId}`
            }, null, 2);
        }
    },
    {
        name: "updateNotionPage",
        description: "ALWAYS use this for ANY request to update, modify, edit, change, or alter page properties, titles, or status in Notion. Handles property updates and archiving/unarchiving. Use for: 'update page', 'edit title', 'change properties', 'modify page', 'update status', 'rename page', 'alter page'.",
        schema: z.object({
            pageId: z.string().describe("The ID of the page to update"),
            properties: z.any().optional().describe("Properties to update"),
            archived: z.boolean().optional().describe("Whether to archive/unarchive the page")
        })
    }
);

// Delete/Archive Page Tool
export const deletePageTool = tool(
    async (input) => {
        const { pageId } = input as {
            pageId: string;
        };

        try {
            addThinkingStep("Archiving Notion page 🗑️");

            await notion.pages.update({
                page_id: pageId,
                archived: true
            });

            return JSON.stringify({
                success: true,
                pageId,
                message: `Page archived successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to archive page with ID: ${pageId}`
            }, null, 2);
        }
    },
    {
        name: "deleteNotionPage",
        description: "ALWAYS use this for ANY request to delete, remove, archive, trash, or eliminate pages in Notion. Note: Notion archives pages rather than permanently deleting them. Use for: 'delete page', 'remove page', 'archive page', 'trash page', 'get rid of page', 'eliminate document'.",
        schema: z.object({
            pageId: z.string().describe("The ID of the page to delete/archive")
        })
    }
);

// Create Database Tool
export const createDatabaseTool = tool(
    async (input) => {
        const { parentId, title, properties } = input as {
            parentId: string;
            title: string;
            properties: any;
        };

        try {
            addThinkingStep("Creating new Notion database 🗂️");

            const databaseData = {
                parent: {
                    type: "page_id" as const,
                    page_id: parentId
                },
                title: [
                    {
                        type: "text" as const,
                        text: {
                            content: title
                        }
                    }
                ],
                properties: properties
            };

            const response = await fetch('https://api.notion.com/v1/databases', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify(databaseData)
            });

            const result = await response.json();

            return JSON.stringify({
                success: true,
                databaseId: result.id,
                url: `https://notion.so/${result.id.replace(/-/g, '')}`,
                message: `Database "${title}" created successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to create database "${title}"`
            }, null, 2);
        }
    },
    {
        name: "createNotionDatabase",
        description: "ALWAYS use this for ANY request to create, build, make, or set up new databases, tables, lists, trackers, or structured data collections in Notion. Handles creating databases with custom properties, columns, and schema. Use for: 'create database', 'make table', 'build tracker', 'new database', 'setup list', 'create collection', 'make CRM', 'build todo list', 'task tracker', 'project database'.",
        schema: z.object({
            parentId: z.string().describe("The ID of the parent page"),
            title: z.string().describe("The title of the new database"),
            properties: z.any().describe("Database properties/columns definition")
        })
    }
);

// Read Database Tool
export const readDatabaseTool = tool(
    async (input) => {
        const { databaseId } = input as {
            databaseId: string;
        };

        try {
            addThinkingStep("Reading Notion database structure 📊");

            const database = await notion.databases.retrieve({ database_id: databaseId });

            return JSON.stringify({
                success: true,
                database: {
                    ...database,
                    url: `https://notion.so/${database.id.replace(/-/g, '')}`
                }
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to read database with ID: ${databaseId}`
            }, null, 2);
        }
    },
    {
        name: "readNotionDatabase",
        description: "ALWAYS use this for ANY request to read, view, show, get, or inspect database structure, schema, properties, or columns in Notion. Returns database metadata, properties, and configuration. Use for: 'show database', 'get database info', 'view schema', 'database structure', 'what columns', 'database properties', 'inspect database'.",
        schema: z.object({
            databaseId: z.string().describe("The ID of the database to read")
        })
    }
);

// Query Database Tool
export const queryDatabaseTool = tool(
    async (input) => {
        const { databaseId, filter, sorts, pageSize } = input as {
            databaseId: string;
            filter?: any;
            sorts?: any;
            pageSize?: number;
        };

        try {
            addThinkingStep("Querying Notion database for entries 🔍");

            const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({
                    filter,
                    sorts,
                    page_size: pageSize || 100
                })
            });

            const result = await response.json();

            return JSON.stringify({
                success: true,
                results: result.results,
                has_more: result.has_more,
                next_cursor: result.next_cursor,
                total_count: result.results?.length || 0
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to query database with ID: ${databaseId}`
            }, null, 2);
        }
    },
    {
        name: "queryNotionDatabase",
        description: "ALWAYS use this for ANY request to find, search, filter, query, get, list, or retrieve specific entries, rows, records, or items from Notion databases. Supports complex filtering, sorting, and pagination. Use for: 'find tasks', 'get pending items', 'show completed', 'list entries', 'search database', 'filter by status', 'my todos', 'overdue tasks', 'recent entries', 'find records'.",
        schema: z.object({
            databaseId: z.string().describe("The ID of the database to query"),
            filter: z.any().optional().describe("Filter criteria for the query"),
            sorts: z.any().optional().describe("Sort criteria for the query"),
            pageSize: z.number().optional().describe("Number of results to return (max 100)")
        })
    }
);

// Update Database Tool
export const updateDatabaseTool = tool(
    async (input) => {
        const { databaseId, title, properties } = input as {
            databaseId: string;
            title?: string;
            properties?: any;
        };

        try {
            addThinkingStep("Updating Notion database structure 📝");

            const updateData: any = {};

            if (title) {
                updateData.title = [
                    {
                        type: "text",
                        text: {
                            content: title
                        }
                    }
                ];
            }

            if (properties) {
                updateData.properties = properties;
            }

            const response = await notion.databases.update({
                database_id: databaseId,
                ...updateData
            });

            return JSON.stringify({
                success: true,
                databaseId: response.id,
                message: `Database updated successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to update database with ID: ${databaseId}`
            }, null, 2);
        }
    },
    {
        name: "updateNotionDatabase",
        description: "ALWAYS use this for ANY request to update, modify, edit, change, or alter database structure, title, properties, columns, or schema in Notion. Use for: 'update database', 'add column', 'modify properties', 'rename database', 'change schema', 'edit columns', 'alter database structure'.",
        schema: z.object({
            databaseId: z.string().describe("The ID of the database to update"),
            title: z.string().optional().describe("New title for the database"),
            properties: z.any().optional().describe("Properties/columns to add or update")
        })
    }
);

// Add Block Tool
export const addBlockTool = tool(
    async (input) => {
        const { parentId, blocks } = input as {
            parentId: string;
            blocks: any[];
        };

        try {
            addThinkingStep("Adding content blocks to Notion page 📝");

            const response = await notion.blocks.children.append({
                block_id: parentId,
                children: blocks
            });

            return JSON.stringify({
                success: true,
                results: response.results,
                message: `${blocks.length} block(s) added successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to add blocks to page/block with ID: ${parentId}`
            }, null, 2);
        }
    },
    {
        name: "addNotionBlocks",
        description: "ALWAYS use this for ANY request to add, insert, append, write, or create new content, text, paragraphs, headings, lists, or any blocks to existing Notion pages. Handles all content types including text, headers, bullets, numbered lists, quotes, code blocks. Use for: 'add content', 'write text', 'insert paragraph', 'add list', 'append text', 'add heading', 'write notes', 'insert blocks'.",
        schema: z.object({
            parentId: z.string().describe("The ID of the parent page or block"),
            blocks: z.array(z.any()).describe("Array of blocks to add")
        })
    }
);

// Read Blocks Tool
export const readBlocksTool = tool(
    async (input) => {
        const { blockId, pageSize } = input as {
            blockId: string;
            pageSize?: number;
        };

        try {
            console.log("Reading Notion blocks 📖");

            const response = await notion.blocks.children.list({
                block_id: blockId,
                page_size: pageSize || 100
            });

            return JSON.stringify({
                success: true,
                results: response.results,
                has_more: response.has_more,
                next_cursor: response.next_cursor
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to read blocks from ID: ${blockId}`
            }, null, 2);
        }
    },
    {
        name: "readNotionBlocks",
        description: "ALWAYS use this for ANY request to read, view, show, get, or retrieve content blocks, text, paragraphs, or any content from Notion pages. Returns all child blocks and their content. Use for: 'show content', 'read text', 'get blocks', 'view content', 'what's written', 'page content', 'read notes', 'show text'.",
        schema: z.object({
            blockId: z.string().describe("The ID of the parent page or block"),
            pageSize: z.number().optional().describe("Number of blocks to return (max 100)")
        })
    }
);

// Update Block Tool
export const updateBlockTool = tool(
    async (input) => {
        const { blockId, block } = input as {
            blockId: string;
            block: any;
        };

        try {
            console.log("Updating Notion block ✏️");

            const response = await notion.blocks.update({
                block_id: blockId,
                ...block
            });

            return JSON.stringify({
                success: true,
                block: response,
                message: `Block updated successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to update block with ID: ${blockId}`
            }, null, 2);
        }
    },
    {
        name: "updateNotionBlock",
        description: "ALWAYS use this for ANY request to update, modify, edit, change, or alter specific content blocks, text, paragraphs, headings, or any existing content in Notion pages. Use for: 'edit text', 'update content', 'modify paragraph', 'change text', 'alter content', 'edit heading', 'update block'.",
        schema: z.object({
            blockId: z.string().describe("The ID of the block to update"),
            block: z.any().describe("Block content to update")
        })
    }
);

// Delete Block Tool
export const deleteBlockTool = tool(
    async (input) => {
        const { blockId } = input as {
            blockId: string;
        };

        try {
            console.log("Deleting Notion block 🗑️");

            await notion.blocks.delete({
                block_id: blockId
            });

            return JSON.stringify({
                success: true,
                blockId,
                message: `Block deleted successfully`
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to delete block with ID: ${blockId}`
            }, null, 2);
        }
    },
    {
        name: "deleteNotionBlock",
        description: "ALWAYS use this for ANY request to delete, remove, clear, erase, or eliminate specific content blocks, text, paragraphs, or content from Notion pages. Use for: 'delete text', 'remove content', 'clear block', 'erase paragraph', 'delete heading', 'remove block'.",
        schema: z.object({
            blockId: z.string().describe("The ID of the block to delete")
        })
    }
);

// Search Tool
export const searchNotionTool = tool(
    async (input) => {
        const { query, filter, sort, pageSize } = input as {
            query: string;
            filter?: any;
            sort?: any;
            pageSize?: number;
        };

        try {
            console.log("Searching Notion 🔍");

            const response = await notion.search({
                query,
                filter,
                sort,
                page_size: pageSize || 100
            });

            return JSON.stringify({
                success: true,
                results: response.results,
                has_more: response.has_more,
                next_cursor: response.next_cursor,
                total_count: response.results?.length || 0
            }, null, 2);

        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to search for: "${query}"`
            }, null, 2);
        }
    },
    {
        name: "searchNotion",
        description: "ALWAYS use this for ANY request to search, find, look for, locate, or discover content across your entire Notion workspace. Searches through all pages, databases, and content. Use for: 'search notion', 'find in notion', 'look for', 'search workspace', 'find pages about', 'locate content', 'search for tasks', 'find notes', 'discover content', 'hunt for information'.",
        schema: z.object({
            query: z.string().describe("Search query text"),
            filter: z.any().optional().describe("Filter criteria for the search"),
            sort: z.any().optional().describe("Sort criteria for the search results"),
            pageSize: z.number().optional().describe("Number of results to return (max 100)")
        })
    }
);

// Export all tools
export const notionTools = [
    createPageTool,
    readPageTool,
    updatePageTool,
    deletePageTool,
    createDatabaseTool,
    readDatabaseTool,
    queryDatabaseTool,
    updateDatabaseTool,
    addBlockTool,
    readBlocksTool,
    updateBlockTool,
    deleteBlockTool,
    searchNotionTool
];