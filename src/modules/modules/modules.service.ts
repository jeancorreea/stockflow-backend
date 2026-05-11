import { Injectable } from '@nestjs/common';

@Injectable()
export class ModulesService {
  private modules: any[] = [];
  findAll() {
    return this.modules;
  }

  create(module: any) {
    const exists = this.modules.find((m) => m.name === module.name);

    if (exists) {
      throw new Error('Module already exists');
    }

    this.modules.push(module);
    return module;
  }
}
