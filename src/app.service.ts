import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly uploadsDir = path.join(__dirname, '..', 'uploads');
  private readonly historyFile = path.join(__dirname, '..', 'history.json');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir);
    }
    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([]));
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  compareCertificates(file1: Express.Multer.File, file2: Express.Multer.File): { isSame: boolean; message: string; diffData?: any[] } {
    if (!file1 || !file2) {
      return { isSame: false, message: 'Two files are required for comparison.' };
    }

    // Save files
    const timestamp = Date.now();
    const file1Name = `${timestamp}_${file1.originalname}`;
    const file2Name = `${timestamp}_${file2.originalname}`;

    fs.writeFileSync(path.join(this.uploadsDir, file1Name), file1.buffer);
    fs.writeFileSync(path.join(this.uploadsDir, file2Name), file2.buffer);

    const buffer1 = file1.buffer;
    const buffer2 = file2.buffer;

    const isSame = buffer1.equals(buffer2);
    let diffData: any[] | undefined = undefined;

    if (!isSame) {
      try {
        // Heuristic: check if files are text (no null bytes in first 1024 bytes)
        // This handles PEM, TXT, JSON, etc.
        const isText1 = buffer1.subarray(0, Math.min(buffer1.length, 1024)).indexOf(0) === -1;
        const isText2 = buffer2.subarray(0, Math.min(buffer2.length, 1024)).indexOf(0) === -1;

        if (isText1 && isText2) {
          const text1 = buffer1.toString('utf-8');
          const text2 = buffer2.toString('utf-8');
          // Use diffLines from the 'diff' package
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const Diff = require('diff');
          diffData = Diff.diffLines(text1, text2);
        }
      } catch (err) {
        console.error('Diff generation failed', err);
      }
    }

    // Update History
    const historyEntry = {
      id: timestamp.toString(),
      timestamp: new Date().toISOString(),
      file1: file1Name,
      file2: file2Name,
      result: isSame ? 'Match' : 'Mismatch',
    };
    const history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
    history.push(historyEntry);
    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));

    return {
      isSame,
      message: isSame ? 'Certificates are identical.' : 'Certificates are different.',
      diffData,
    };
  }

  getHistory() {
    return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
  }

  clearHistory() {
    fs.writeFileSync(this.historyFile, JSON.stringify([]));
    return { message: 'History cleared' };
  }

  getFiles() {
    const files = fs.readdirSync(this.uploadsDir);
    return files.map(file => {
      const stats = fs.statSync(path.join(this.uploadsDir, file));
      return { name: file, size: stats.size, created: stats.birthtime };
    });
  }

  clearFiles() {
    const files = fs.readdirSync(this.uploadsDir);
    for (const file of files) {
      fs.unlinkSync(path.join(this.uploadsDir, file));
    }
    return { message: 'All certificates deleted' };
  }
}
