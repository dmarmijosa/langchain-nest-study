/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import fetch from 'node-fetch'; // O usa el fetch nativo si tienes Node 18+

export const pokemonTool = tool(
  async ({ name }) => {
    console.log(`🔎 BUSCANDO POKEMON: ${name}`);

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
      );

      if (!response.ok) return `No encontré ningún Pokémon llamado ${name}.`;

      const data = await response.json();

      // Devolvemos solo la info relevante para no saturar a la IA
      return JSON.stringify({
        nombre: data.name,
        tipo: data.types.map((t: any) => t.type.name).join(', '),
        peso: data.weight,
        habilidades: data.abilities.map((a: any) => a.ability.name).join(', '),
      });
    } catch (error) {
      return 'Hubo un error conectando con la base de datos de Pokémon.';
    }
  },
  {
    name: 'pokemon_db',
    description:
      'Úsala para buscar información sobre un Pokémon (tipo, habilidades, peso).',
    schema: z.object({
      name: z.string().describe('El nombre del Pokémon a buscar'),
    }),
  },
);
