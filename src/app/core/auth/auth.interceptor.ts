import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authorization = sessionStorage.getItem('peoplepay_access_token');
  return next(authorization ? req.clone({ setHeaders: { Authorization: authorization } }) : req);
};
