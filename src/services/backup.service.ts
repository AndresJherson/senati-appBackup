import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import { BackupFile } from 'src/models/BackupFile';
import { ConnectionPool } from 'mssql';

@Injectable()
export class BackupService { 

    constructor(
        private readonly configService: ConfigService
    ) { }

    async createBackup(): Promise<string> {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();

        const backupFileName = `VTA-${month}-${year}.bak`;
        const backupPath = join(this.configService.pathBackup, backupFileName);

        try {
            // Ensure backup directory exists
            await fs.mkdir(this.configService.pathBackup, { recursive: true });

            // Connect to SQL Server
            const pool = await new ConnectionPool(this.configService.mssqlConfig).connect();

            // Execute backup query
            const backupQuery = `BACKUP DATABASE [${this.configService.dbName}] TO DISK = N'${backupPath}' WITH NOFORMAT, NOINIT, NAME = '${this.configService.dbName}-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10`;

            await pool.request().query(backupQuery);
            pool.close();

            return backupFileName;
        } catch (error) {
            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    async listBackups(month?: string, year?: string): Promise<BackupFile[]> {
        try {
            const files = await fs.readdir(this.configService.pathBackup);
            const backupFiles = await Promise.all(
                files
                    .filter(file => extname(file) === '.bak' && file.startsWith('VTA-'))
                    .map(async file => {
                        const stats = await fs.stat(join(this.configService.pathBackup, file));
                        // Extract month and year from filename
                        const parts = file.replace('.bak', '').split('-');
                        const fileMonth = parts[1];
                        const fileYear = parts[2];

                        return {
                            name: file,
                            path: join(this.configService.pathBackup, file),
                            month: fileMonth,
                            year: fileYear,
                            date: stats.mtime,
                        };
                    })
            );

            // Apply filters if provided
            let filteredBackups = backupFiles;
            if (month) {
                filteredBackups = filteredBackups.filter(file => file.month === month);
            }
            if (year) {
                filteredBackups = filteredBackups.filter(file => file.year === year);
            }

            return filteredBackups.sort((a, b) => b.date.getTime() - a.date.getTime());
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Directory doesn't exist yet
                return [];
            }
            throw new Error(`Failed to list backups: ${error.message}`);
        }
    }

    async getBackupPath(filename: string): Promise<string> {
        const filePath = join(this.configService.pathBackup, filename);

        try {
            // Check if file exists
            await fs.access(filePath);
            return filePath;
        } catch (error) {
            throw new Error('Backup file not found');
        }
    }
}