import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';

import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as path from 'path';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
@Injectable()
export class RagService {
  private model: ChatGoogleGenerativeAI;
  private vectorStore: MemoryVectorStore;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: envs.GOOGLE_API_KEY,
      temperature: 0.7,
      model: envs.MODEL_NAME,
    });
  }

  async chatWithStaticPdf(question: string) {
    // 1. CARGAR EL PDF
    // Buscamos el archivo en la carpeta 'uploads' de la raíz
    const filePath = path.join(process.cwd(), 'uploads', 'cv.pdf');
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // 2. DIVIDIR EL TEXTO (SPLITTING)
    // Los LLMs tienen límite de tokens, así que dividimos el PDF en trozos
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitsDocs = await splitter.splitDocuments(docs);

    // 3. VECTORIZAR Y GUARDAR (EMBEDDINGS)
    // Usamos OpenAIEmbeddings para convertir texto a números
    // MemoryVectorStore guarda los vectores en RAM (se borra al reiniciar)
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      splitsDocs,
      new GoogleGenerativeAIEmbeddings(),
    );

    // 4. CREAR EL RETRIEVER (BUSCADOR)
    // Configuramos para que busque los 2 fragmentos más relevantes
    const retriever = this.vectorStore.asRetriever({ k: 2 });

    // 5. CREAR LA CADENA DE RAG
    // Definimos el prompt que recibe el contexto (el PDF) y la pregunta
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Responde a la pregunta del usuario basándote SOLO en el siguiente contexto:\n\n{context}',
      ],
      ['user', '{input}'],
    ]);

    // cadena para procesar los documentos encontrados en la respuesta
    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.model,
      prompt,
    });

    // Cadena final que une el buscador + la cadena de documentos
    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain,
    });

    // 6. EJECUTAR LA PREGUNTA
    const response = await retrievalChain.invoke({
      input: question,
    });

    // RAG devuelve un objeto con { input, context, answer }. Retornamos solo la respuesta.
    return response.answer;
  }
}
