import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackupController } from './controllers/backup.controller';
import { BackupService } from './services/backup.service';
import { ConfigService } from './services/config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot()
    ],
    controllers: [AppController, BackupController],
    providers: [AppService, BackupService, ConfigService],
})
export class AppModule { }
