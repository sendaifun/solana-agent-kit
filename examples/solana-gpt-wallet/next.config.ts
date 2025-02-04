// next.config.js
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import webpack from 'webpack';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
        if (!isServer) {
            config.resolve = config.resolve || {};
            config.resolve.fallback = {
                fs: false,
                path: false,
                os: false,
                crypto: false,
                stream: false,
                buffer: require.resolve('buffer/'),
            };

            config.plugins = config.plugins || [];
            config.plugins.push(
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                })
            );
        }

        config.module?.rules?.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
            resolve: {
                fullySpecified: false,
            },
        });

        return config;
    },
};

export default nextConfig;