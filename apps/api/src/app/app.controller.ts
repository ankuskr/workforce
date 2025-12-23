import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    console.log("Received GET request at '/' endpoint");
    console.log("Received GET request at '/' endpoint");
    return this.appService.getData();
  }
}
