import { Controller, Get } from '@nestjs/common';

@Controller()
export class FeatureController {
  @Get('feature')
  getFeatures() {
    return [
      {
        name: 'E_PART_VIEW',
        pretty_name: 'Visualizar',
        description: 'Permite visualizar itens',
      },
      {
        name: 'E_PART_CREATE',
        pretty_name: 'Criar',
        description: 'Permite criar itens',
      },
      {
        name: 'E_PART_UPDATE',
        pretty_name: 'Atualizar',
        description: 'Permite atualizar itens',
      },
      {
        name: 'E_PART_DELETE',
        pretty_name: 'Deletar',
        description: 'Permite deletar itens',
      },
    ];
  }
}
