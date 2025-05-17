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
}
