const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'pg-native': 'commonjs pg-native',
        'react-native-sqlite-storage': 'commonjs react-native-sqlite-storage',
        '@sap/hana-client': 'commonjs @sap/hana-client',
        'mysql': 'commonjs mysql',
      });
    }
    return config;
  },
};

export default nextConfig;
