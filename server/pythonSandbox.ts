import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface PythonExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  artifacts: {
    id: string;
    filename: string;
    mimeType: string;
    dataBase64?: string;
    url?: string;
  }[];
}

const SANDBOX_DIR = path.resolve(process.cwd(), '.cypher_sandbox');

// Ensure sandbox directory exists
if (!fs.existsSync(SANDBOX_DIR)) {
  fs.mkdirSync(SANDBOX_DIR, { recursive: true });
}

export async function executePythonCode(
  code: string,
  timeoutMs = 20000
): Promise<PythonExecutionResult> {
  const executionId = 'py-' + crypto.randomUUID();
  const execDir = path.join(SANDBOX_DIR, executionId);
  fs.mkdirSync(execDir, { recursive: true });

  const scriptPath = path.join(execDir, 'script.py');

  // Prepend headless matplotlib support and auto-save for show()
  const fortifiedCode = `
import sys
import os

# Ensure headless plotting if matplotlib is imported
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    original_show = plt.show
    def auto_save_show(*args, **kwargs):
        plot_idx = len([f for f in os.listdir('.') if f.startswith('plot_') and f.endswith('.png')]) + 1
        plt.savefig(f'plot_{plot_idx}.png', bbox_inches='tight', dpi=150)
        plt.close()
    plt.show = auto_save_show
except Exception:
    pass

${code}
`;

  fs.writeFileSync(scriptPath, fortifiedCode, 'utf-8');

  const startTime = Date.now();

  return new Promise((resolve) => {
    execFile(
      'python3',
      [scriptPath],
      {
        cwd: execDir,
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10MB max buffer
      },
      (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        const exitCode = error ? (error.code as number) || 1 : 0;

        // Detect generated files in the execution directory
        const artifacts: PythonExecutionResult['artifacts'] = [];
        try {
          const files = fs.readdirSync(execDir);
          for (const file of files) {
            if (file === 'script.py') continue;
            const fullPath = path.join(execDir, file);
            const ext = path.extname(file).toLowerCase();
            let mimeType = 'application/octet-stream';

            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.csv') mimeType = 'text/csv';
            else if (ext === '.json') mimeType = 'application/json';
            else if (ext === '.pdf') mimeType = 'application/pdf';

            const fileBuffer = fs.readFileSync(fullPath);
            const artifactId = 'art-' + crypto.randomUUID();

            artifacts.push({
              id: artifactId,
              filename: file,
              mimeType,
              dataBase64: fileBuffer.toString('base64'),
              url: `/api/artifacts/${artifactId}`,
            });
          }
        } catch (err) {
          console.warn('Error reading sandbox artifacts:', err);
        }

        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: (stderr || '') + (error && error.killed ? '\n[Délai dépassé (Timeout)]' : ''),
          exitCode,
          executionTimeMs,
          artifacts,
        });
      }
    );
  });
}
