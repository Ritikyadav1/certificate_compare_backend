import { Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('compare')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'certificate1', maxCount: 1 },
    { name: 'certificate2', maxCount: 1 },
  ], {
    limits: { fileSize: 1024 * 1024 }, // 1MB Limit
  }))
  compareCertificates(@UploadedFiles() files: { certificate1?: Express.Multer.File[], certificate2?: Express.Multer.File[] }) {
    const file1 = files.certificate1?.[0];
    const file2 = files.certificate2?.[0];
    return this.appService.compareCertificates(file1 as any, file2 as any);
  }

  @Get('history')
  getHistory() {
    return this.appService.getHistory();
  }

  @Post('history/clear')
  clearHistory() {
    return this.appService.clearHistory();
  }

  @Get('files')
  getFiles() {
    return this.appService.getFiles();
  }

  @Post('files/clear')
  clearFiles() {
    return this.appService.clearFiles();
  }
}
