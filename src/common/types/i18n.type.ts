// File: src/common/types/i18n.type.ts
// Chức năng: Định nghĩa Type chuẩn cho các trường JSONB Đa ngôn ngữ trong Database

// 1. Dành cho các trường text thông thường (VD: title, content)
export interface I18nField {
  vi: string; // Tiếng Việt là bắt buộc
  en?: string; // Tiếng Anh (Tùy chọn)
  zh?: string; // Tiếng Trung (Tùy chọn)
}

// 2. Dành cho các trường SEO (Nằm trong metadata)
export interface SeoData {
  slug: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
}

export interface I18nSeo {
  vi: SeoData;
  en?: SeoData;
  zh?: SeoData;
}
