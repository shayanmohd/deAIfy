// Allow side-effect and module imports of CSS (handled by Metro/web bundler).
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
