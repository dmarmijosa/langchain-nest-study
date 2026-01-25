import { HttpStatus, Injectable } from '@nestjs/common';

import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { envs } from 'src/config/envs';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
@Injectable()
export class RagDbService {
  private mode: ChatOpenAI;
  private pinecone: Pinecone;

  constructor() {
    this.mode = new ChatOpenAI({
      apiKey: envs.OPENAI_API_KEY,
      model: envs.OPENAI_MODEL_NAME,
    });

    this.pinecone = new Pinecone({
      apiKey: envs.PINECONE_API_KEY,
    });
  }

  // --- 1. INDEXAR (Guardar en Pinecone) ---
  async ingestPDF(filePath: string) {
    try {
      // Cargar el PDF y dividirlo en fragmentos de texto
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await splitter.splitDocuments(docs);

      const pineconeIndex = this.pinecone.Index(envs.PINECONE_INDEX);

      // Guardar los fragmentos en Pinecone
      await PineconeStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings({
          apiKey: envs.OPENAI_API_KEY,
          model: 'text-embedding-3-small',
          dimensions: 1024,
        }),
        {
          pineconeIndex,
          maxConcurrency: 5,
        },
      );

      return {
        status: HttpStatus.OK,
        message: 'PDF guardado en la Nube (Pinecone) 🌲',
      };
    } catch (error) {
      console.error('Error al indexar el PDF:', error);
      throw new Error('Error al indexar el PDF');
    }
  }

  // --- 2. PREGUNTAR (Consultar Pinecone) ---
  async chatStream(question: string) {
    const pineconeIndex = this.pinecone.Index(envs.PINECONE_INDEX);

    // Cargar el vector store sin reindexar
    const vectoStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        apiKey: envs.OPENAI_API_KEY,
        model: 'text-embedding-3-small',
        dimensions: 1024,
      }),
      { pineconeIndex },
    );

    // Crear el retriever donde k es el número de documentos a recuperar
    const retriever = vectoStore.asRetriever({ k: 3 });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Responde basándote en el contexto recuperado de la base de datos:\n\n{context}',
      ],
      ['human', '{input}'],
    ]);

    const combineDocschain = await createStuffDocumentsChain({
      llm: this.mode,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain: combineDocschain,
    });

    return await retrievalChain.invoke({ input: question });
  }
}
