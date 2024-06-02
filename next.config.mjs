/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NODE_ENV === 'production' ? '/gptmini' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/gptmini' : '',
  };
  
  export default nextConfig;
  