import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { envs } from '../config/envs';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';

@Injectable()
export class RagDinamicService {
  private model: ChatOpenAI;
  // ⚠️ AQUÍ GUARDAMOS EL CONOCIMIENTO EN RAM
  private vectorStore: MemoryVectorStore | null = null;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: envs.OPENAI_API_KEY,
      model: envs.OPENAI_MODEL_NAME,
    });
  }

  // 1. Cargar el archivo subido por el usuario
  async ingestPdf(filePath: string) {
    try {
      //1. CARGAR EL PDF
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();

      //2. DIVIDIR EL TEXTO (SPLITTING)
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      //3. VECTORIZAR Y GUARDAR (EMBEDDINGS)
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings({ apiKey: envs.OPENAI_API_KEY }),
      );

      return {
        status: 'success',
        message: 'PDF ingested and knowledge stored in memory vector store.',
        chunks: splitDocs.length,
      };
    } catch (error) {
      console.error('Error ingesting PDF:', error);
      throw new HttpException(
        'Failed to ingest PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 2. Chatear con el conocimiento almacenado en RAM
  async chatStream(question: string) {
    if (!this.vectorStore)
      throw new HttpException(
        'No knowledge ingested. Please upload a PDF first.',
        HttpStatus.BAD_REQUEST,
      );

    // 4. CREAR EL RETRIEVER (BUSCADOR) k se define cuantos fragmentos relevantes buscar
    const buscador = this.vectorStore.asRetriever({ k: 2 });
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Eres un asistente experto. Responde basándote SOLO en el siguiente contexto:\n\n{context}',
      ],
      ['user', '{input}'],
    ]);

    // 5. CREAR LA CADENA DE RAG
    // cadena para procesar los documentos encontrados en la respuesta
    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.model,
      prompt,
    });

    // 6. Cadena final que une el buscador + la cadena de documentos
    const retriveChain = await createRetrievalChain({
      retriever: buscador,
      combineDocsChain,
    });

    // 7. EJECUTAR LA PREGUNTA STREAM
    // return await retriveChain.stream({
    //   input: question,
    // });

    // 7. EJECUTAR LA PREGUNTA NORMAL
    return await retriveChain.invoke({
      input: question,
    });
  }
}
