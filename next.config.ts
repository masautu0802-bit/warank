import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像最適化設定
  images: {
    // SupabaseのストレージURLと外部画像ドメインを許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fujitv.co.jp',
      },
    ],
  },
  // 実験的機能（必要に応じて）
  // experimental: {
  //   // 必要に応じて実験的機能を有効化
  // },
};

export default nextConfig;
