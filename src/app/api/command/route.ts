import { NextRequest, NextResponse } from 'next/server';

interface CommandRequest {
  command: string;
}

interface CommandResponse {
  output?: string;
  error?: string;
}

const commands: Record<string, (args: string[]) => string> = {
  help: () => `Available commands:
  help - Show this help message
  echo <message> - Echo the message back
  date - Show current date and time
  whoami - Show current user info
  ls - List sample files
  pwd - Show current directory
  clear - Clear terminal (client-side)
  calc <expression> - Simple calculator (e.g., calc 2+2)`,
  
  echo: (args) => args.join(' ') || 'Usage: echo <message>',
  
  date: () => new Date().toLocaleString(),
  
  whoami: () => 'terminal-user', // Ask for user name and store in persistent state
  
  ls: () => `total 8
drwxr-xr-x  3 user  staff   96 ${new Date().toLocaleDateString()} documents/
-rw-r--r--  1 user  staff  1024 ${new Date().toLocaleDateString()} readme.txt
-rw-r--r--  1 user  staff  2048 ${new Date().toLocaleDateString()} config.json`,
  
  pwd: () => '/home/terminal-user',

  cd: (args) => {
    const dir = args.join(' ') || '/home/terminal-user';
    return `Changed directory to ${dir}`;
  },

  calc: (args) => {
    const expression = args.join('').replace(/\s/g, '');
    if (!expression) return 'Usage: calc <expression> (e.g., calc 2+2)';
    
    try {
      // Simple math evaluation (safe for basic operations)
      const result = Function(`"use strict"; return (${expression.replace(/[^0-9+\-*/().\s]/g, '')})`)();
      return `${expression} = ${result}`;
    } catch (error) {
      return `Error: Invalid expression "${expression}"`;
    }
  },
};

export async function POST(request: NextRequest): Promise<NextResponse<CommandResponse>> {
  try {
    const body: CommandRequest = await request.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command format' },
        { status: 400 }
      );
    }

    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      return NextResponse.json({ output: '' });
    }

    const [cmd, ...args] = trimmedCommand.split(' ');
    const commandHandler = commands[cmd.toLowerCase()];

    if (commandHandler) {
      const output = commandHandler(args);
      return NextResponse.json({ output });
    } else {
      return NextResponse.json({
        error: `Command not found: ${cmd}. Type 'help' for available commands.`
      });
    }
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}