import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from HuggingFace
env.allowLocalModels = false;

class PipelineSingleton {
  static task = 'feature-extraction';
  static model = 'Supabase/bge-small-en';
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = pipeline(this.task as any, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { id, text, type } = event.data;
  
  if (type === 'embed') {
    try {
      const embedder = await PipelineSingleton.getInstance((x: any) => {
        // We could send progress updates back to the main thread
        self.postMessage({ type: 'progress', id, data: x });
      });
      
      const output = await embedder(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);
      
      self.postMessage({
        type: 'result',
        id,
        embedding
      });
    } catch (e: any) {
      self.postMessage({ type: 'error', id, error: e.message });
    }
  }
});
