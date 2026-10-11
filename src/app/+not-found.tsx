// Zibby serves the same bundle from a root (a<id>.zibby.run) and from a path prefix
// (zibby.run/apps/<slug>/). The router's base path is fixed at build time, so under the
// prefix it sees an unknown path: show the home screen instead of "Unmatched Route".
export { default } from './index';
