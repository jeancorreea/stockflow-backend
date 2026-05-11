/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const coreUrl = process.env.CORE_URL;

      if (!coreUrl) {
        throw new Error('CORE_URL não configurado no .env');
      }

      const response = await axios.get(`${coreUrl}/api/auth?token=${token}`);

      req.user = response.data;

      return next();
    } catch (error) {
      return res.status(401).json({
        error: 'Falha na autenticação',
      });
    }
  }
}
