import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {

    constructor(
        private configService: NestConfigService
    ) { }

    get dbHost(): string {
        return this.configService.get<string>('DB_HOST') ?? '';
    }

    get dbName(): string {
        return this.configService.get<string>('DB_NAME') ?? '';
    }

    get dbUser(): string {
        return this.configService.get<string>('DB_USER') ?? '';
    }

    get dbPassword(): string {
        return this.configService.get<string>('DB_PASSWORD') ?? '';
    }

    get pathBackup(): string {
        return this.configService.get<string>('PATH_BACKUP') ?? '';
    }

    get mssqlConfig() {
        return {
            user: this.dbUser,
            password: this.dbPassword,
            server: this.dbHost,
            database: this.dbName,
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        };
    }
}