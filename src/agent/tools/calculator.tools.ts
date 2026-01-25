import { tool } from '@langchain/core/tools';
import { z } from 'zod';
export const calculatorTool = tool(
  ({ a, b, operation }) => {
    console.log(`🧮 AGENTE USANDO CALCULADORA: ${a} ${operation} ${b}`);
    switch (operation) {
      case 'sumar':
        return `${a + b}`;
      case 'restar':
        return `${a - b}`;
      case 'multiplicar':
        return `${a * b}`;
      case 'dividir':
        return `${a / b}`;
      default:
        return 'Operación no válida';
    }
  },
  {
    name: 'calculadora_avanzada',
    description:
      'Útil para realizar operaciones matemáticas precisas. Úsala siempre que te pidan calcular números.',
    schema: z.object({
      operation: z
        .enum(['sumar', 'restar', 'multiplicar', 'dividir'])
        .describe('El tipo de operación matemática'),
      a: z.number().describe('El primer número'),
      b: z.number().describe('El segundo número'),
    }),
  },
);
