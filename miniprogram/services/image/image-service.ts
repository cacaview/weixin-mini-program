/**
 * 图片处理服务模块
 * 支持图片上传、压缩、格式转换、存储等功能
 * 为多模态LLM提供图片处理支持
 */

// 图片信息接口
interface ImageInfo {
  path: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

// 压缩配置
interface CompressConfig {
  quality: number;      // 压缩质量 0-100
  maxWidth: number;     // 最大宽度
  maxHeight: number;    // 最大高度
}

// 上传结果
interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

// 图片安全检测结果
interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
}

class ImageService {
  private defaultCompressConfig: CompressConfig = {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080
  };

  // 云存储配置
  private cloudConfig = {
    bucket: '',
    region: '',
    uploadUrl: ''
  };

  /**
   * 初始化图片服务
   */
  init(cloudConfig: typeof this.cloudConfig): void {
    this.cloudConfig = cloudConfig;
  }

  /**
   * 选择图片
   * @param count 最多选择数量
   * @param sourceType 来源类型
   */
  async chooseImage(count: number = 1, sourceType: ('album' | 'camera')[] = ['album', 'camera']): Promise<string[]> {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count,
        sourceType,
        sizeType: ['compressed'],
        success: (res) => {
          resolve(res.tempFilePaths);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 选择媒体文件（支持图片和视频）
   */
  async chooseMedia(count: number = 1, mediaType: ('image' | 'video')[] = ['image']): Promise<WechatMiniprogram.MediaFile[]> {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType,
        sourceType: ['album', 'camera'],
        success: (res) => {
          resolve(res.tempFiles);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(src: string): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: (res) => {
          resolve({
            path: res.path,
            size: 0, // 需要额外获取
            width: res.width,
            height: res.height,
            type: res.type
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 压缩图片
   */
  async compressImage(src: string, config?: Partial<CompressConfig>): Promise<string> {
    const finalConfig = { ...this.defaultCompressConfig, ...config };
    
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src,
        quality: finalConfig.quality,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 裁剪图片到指定尺寸
   */
  async cropImage(src: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      // 使用canvas进行裁剪
      const query = wx.createSelectorQuery();
      const canvas = wx.createOffscreenCanvas({ type: '2d', width, height });
      const ctx = canvas.getContext('2d');

      const img = canvas.createImage();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        
        wx.canvasToTempFilePath({
          canvas: canvas as any,
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (err) => {
            reject(err);
          }
        });
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = src;
    });
  }

  /**
   * 图片转Base64
   */
  async imageToBase64(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          const base64 = res.data as string;
          // 获取图片类型
          const type = filePath.split('.').pop()?.toLowerCase() || 'png';
          const mimeType = type === 'jpg' ? 'jpeg' : type;
          resolve(`data:image/${mimeType};base64,${base64}`);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Base64转图片文件
   */
  async base64ToImage(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 移除data:image前缀
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
      const filePath = `${wx.env.USER_DATA_PATH}/temp_${Date.now()}.png`;
      
      wx.getFileSystemManager().writeFile({
        filePath,
        data: base64Data,
        encoding: 'base64',
        success: () => {
          resolve(filePath);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 上传图片到云存储
   */
  async uploadImage(filePath: string, cloudPath?: string): Promise<UploadResult> {
    // 先压缩图片
    const compressedPath = await this.compressImage(filePath);
    
    // 生成云端路径
    const finalCloudPath = cloudPath || `images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;

    return new Promise((resolve) => {
      // 使用微信云开发上传
      if (wx.cloud) {
        wx.cloud.uploadFile({
          cloudPath: finalCloudPath,
          filePath: compressedPath,
          success: (res) => {
            resolve({
              success: true,
              fileId: res.fileID,
              url: res.fileID
            });
          },
          fail: (err) => {
            resolve({
              success: false,
              error: err.errMsg
            });
          }
        });
      } else {
        // 使用自定义服务器上传
        wx.uploadFile({
          url: this.cloudConfig.uploadUrl,
          filePath: compressedPath,
          name: 'file',
          formData: {
            cloudPath: finalCloudPath
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              resolve({
                success: true,
                url: data.url,
                fileId: data.fileId
              });
            } catch (e) {
              resolve({
                success: false,
                error: '解析响应失败'
              });
            }
          },
          fail: (err) => {
            resolve({
              success: false,
              error: err.errMsg
            });
          }
        });
      }
    });
  }

  /**
   * 批量上传图片
   */
  async uploadImages(filePaths: string[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const filePath of filePaths) {
      const result = await this.uploadImage(filePath);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 下载图片
   */
  async downloadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error('下载失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 保存图片到相册
   */
  async saveToAlbum(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          resolve(true);
        },
        fail: () => {
          // 可能是权限问题，尝试请求权限
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                wx.openSetting({
                  success: () => {
                    resolve(false);
                  }
                });
              } else {
                resolve(false);
              }
            }
          });
        }
      });
    });
  }

  /**
   * 预览图片
   */
  previewImage(urls: string[], current?: string): void {
    wx.previewImage({
      urls,
      current: current || urls[0]
    });
  }

  /**
   * 图片安全检测（调用微信内容安全API）
   */
  async checkImageSafety(filePath: string): Promise<SafetyCheckResult> {
    // 先转为Base64
    const base64 = await this.imageToBase64(filePath);
    
    return new Promise((resolve) => {
      // 调用云函数进行安全检测
      if (wx.cloud) {
        wx.cloud.callFunction({
          name: 'checkImageSafety',
          data: { imageBase64: base64 },
          success: (res: any) => {
            resolve({
              safe: res.result.safe,
              reason: res.result.reason
            });
          },
          fail: () => {
            // 检测失败时默认通过
            resolve({ safe: true });
          }
        });
      } else {
        // 没有云开发时默认通过
        resolve({ safe: true });
      }
    });
  }

  /**
   * 生成缩略图URL（如果使用OSS等支持图片处理的存储）
   */
  getThumbnailUrl(url: string, width: number = 200, height: number = 200): string {
    // 阿里云OSS图片处理参数
    if (url.includes('aliyuncs.com')) {
      return `${url}?x-oss-process=image/resize,m_fill,w_${width},h_${height}`;
    }
    // 腾讯云COS图片处理参数
    if (url.includes('myqcloud.com')) {
      return `${url}?imageMogr2/thumbnail/${width}x${height}`;
    }
    // 微信云开发文件
    if (url.startsWith('cloud://')) {
      return url; // 云开发暂不支持实时处理
    }
    return url;
  }

  /**
   * 清理临时文件
   */
  async cleanTempFiles(): Promise<void> {
    const fs = wx.getFileSystemManager();
    const tempDir = wx.env.USER_DATA_PATH;
    
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file.startsWith('temp_')) {
          fs.unlinkSync(`${tempDir}/${file}`);
        }
      }
    } catch (e) {
      console.error('清理临时文件失败', e);
    }
  }
}

// 导出单例
export const imageService = new ImageService();
export default imageService;