export namespace HTTP_CODE {
  export const OK = 200;
  export const CREATED = 201;
  export const NO_CONTENT = 204;
  export const BAD_REQUEST = 400;
  export const UNAUTHORIZED = 401;
  export const FORBIDDEN = 403;
  export const NOT_FOUND = 404;
  export const CONFLICT = 409;
  export const UNPROCESSABLE_ENTITY = 422;
  export const INTERNAL_SERVER_ERROR = 500;
}

export namespace VALIDATION {
  export const USERNAME = {
    MIN: 3,
    MAX: 50,
  };

  export const EMAIL = {
    MAX: 255,
  };

  export const PASSWORD = {
    MIN: 8,
    MAX: 255,
  };

  export const PROGRAM_NAME = {
    MIN: 3,
    MAX: 100,
  };

  export const BLOCK_NAME = {
    MIN: 1,
    MAX: 100,
  };

  export const DAY_NAME = {
    MAX: 100,
  };

  export const EXERCISE_NAME = {
    MIN: 1,
    MAX: 100,
  };

  export const REPS = {
    MAX: 50,
  };

  export const WEIGHT = {
    MAX: 50,
  };

  export const RPE = {
    MAX: 20,
  };
}
