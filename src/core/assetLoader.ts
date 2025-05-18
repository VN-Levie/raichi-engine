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


  //load audio
  static loadAudio(src: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src)
      audio.oncanplaythrough = () => resolve(audio)
      audio.onerror = () => reject(new Error("Failed to load audio: " + src))
      audio.load()
    })
  }
  static loadAudios(srcList: string[]): Promise<HTMLAudioElement[]> {
    return Promise.all(srcList.map(src => this.loadAudio(src)))
  }
  static loadAudioBuffer(src: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open("GET", src, true)
      request.responseType = "arraybuffer"
      request.onload = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContext.decodeAudioData(request.response, resolve, reject)
      }
      request.onerror = () => reject(new Error("Failed to load audio buffer: " + src))
      request.send()
    })
  }
}
