export interface ImageOptimizeOptions {
  width: number;
  height: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  effort: number;
}
