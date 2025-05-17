export class AssetLoader {
  static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Failed to load image: " + src))
      img.src = src
    })
  }

  static loadImages(srcList: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcList.map(src => this.loadImage(src)))
  }

  static async loadJson<T = any>(src: string): Promise<T> {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${src}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`Failed to load JSON from ${src}:`, error);
      throw error; 
    }
  }
}
