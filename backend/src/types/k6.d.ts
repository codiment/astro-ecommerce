declare module 'k6/http' {
  export default {
    get: (url: string, params?: object) => any,
    post: (url: string, data?: any, params?: object) => any,
    put: (url: string, data?: any, params?: object) => any,
    del: (url: string, params?: object) => any,
  };
}

declare module 'k6' {
  export function check(res: any, conditions: object): boolean;
  export function sleep(seconds: number): void;
}
