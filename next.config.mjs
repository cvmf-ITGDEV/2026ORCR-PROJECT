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
        '@sap/hana-client/extension/Stream': 'commonjs @sap/hana-client/extension/Stream',
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'oracle': 'commonjs oracle',
        'oracledb': 'commonjs oracledb',
        'sqlite3': 'commonjs sqlite3',
        'better-sqlite3': 'commonjs better-sqlite3',
        'tedious': 'commonjs tedious',
        'ioredis': 'commonjs ioredis',
        'mssql': 'commonjs mssql',
      });

      config.ignoreWarnings = [
        { module: /node_modules\/typeorm/ },
        { module: /node_modules\/app-root-path/ },
        /Critical dependency: the request of a dependency is an expression/,
      ];
    }
    return config;
  },
};

export default nextConfig;
