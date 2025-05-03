import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { BackupService } from 'src/services/backup.service';

@Controller('backup')
export class BackupController { 

    constructor(
        private readonly backupService: BackupService
    ) { }

    @Post('create')
    async createBackup(
        @Res() res: Response
    ) {
        try {
            const result = await this.backupService.createBackup();
            return res.redirect('/?message=Backup created successfully');
        } catch (error) {
            return res.redirect(`/?error=${error.message}`);
        }
    }

    @Get('list')
    async listBackups(
        @Query('month') month: string, 
        @Query('year') year: string, 
        @Res() res: Response
    ) {
        try {
            const backups = await this.backupService.listBackups(month, year);
            return res.json(backups);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    @Get('download/:filename')
    async downloadBackup(
        @Param('filename') filename: string, 
        @Res() res: Response
    ) {
        try {
            const filePath = await this.backupService.getBackupPath(filename);
            return res.download(filePath);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
}