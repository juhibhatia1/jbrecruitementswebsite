
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ContactSubmission
 * 
 */
export type ContactSubmission = $Result.DefaultSelection<Prisma.$ContactSubmissionPayload>
/**
 * Model JobSeekerSubmission
 * 
 */
export type JobSeekerSubmission = $Result.DefaultSelection<Prisma.$JobSeekerSubmissionPayload>
/**
 * Model Purchase
 * 
 */
export type Purchase = $Result.DefaultSelection<Prisma.$PurchasePayload>
/**
 * Model FunnelEvent
 * 
 */
export type FunnelEvent = $Result.DefaultSelection<Prisma.$FunnelEventPayload>
/**
 * Model KnowledgeDocument
 * 
 */
export type KnowledgeDocument = $Result.DefaultSelection<Prisma.$KnowledgeDocumentPayload>
/**
 * Model KnowledgeChunk
 * 
 */
export type KnowledgeChunk = $Result.DefaultSelection<Prisma.$KnowledgeChunkPayload>
/**
 * Model ChatConversation
 * 
 */
export type ChatConversation = $Result.DefaultSelection<Prisma.$ChatConversationPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model InterviewTemplate
 * 
 */
export type InterviewTemplate = $Result.DefaultSelection<Prisma.$InterviewTemplatePayload>
/**
 * Model CandidateApplication
 * 
 */
export type CandidateApplication = $Result.DefaultSelection<Prisma.$CandidateApplicationPayload>
/**
 * Model InterviewSession
 * 
 */
export type InterviewSession = $Result.DefaultSelection<Prisma.$InterviewSessionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const InterviewTemplateOwnerRole: {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE'
};

export type InterviewTemplateOwnerRole = (typeof InterviewTemplateOwnerRole)[keyof typeof InterviewTemplateOwnerRole]


export const CandidateInterviewPreference: {
  AI: 'AI',
  MANUAL: 'MANUAL'
};

export type CandidateInterviewPreference = (typeof CandidateInterviewPreference)[keyof typeof CandidateInterviewPreference]


export const CandidateApplicationStatus: {
  APPLIED: 'APPLIED',
  MANUAL_REVIEW_PENDING: 'MANUAL_REVIEW_PENDING',
  SCHEDULED: 'SCHEDULED',
  AI_INVITED: 'AI_INVITED',
  INTERVIEW_STARTED: 'INTERVIEW_STARTED',
  INTERVIEW_COMPLETED: 'INTERVIEW_COMPLETED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  CANCELLED: 'CANCELLED'
};

export type CandidateApplicationStatus = (typeof CandidateApplicationStatus)[keyof typeof CandidateApplicationStatus]


export const InterviewSessionStatus: {
  CONNECTING: 'CONNECTING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED',
  FAILED: 'FAILED'
};

export type InterviewSessionStatus = (typeof InterviewSessionStatus)[keyof typeof InterviewSessionStatus]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type InterviewTemplateOwnerRole = $Enums.InterviewTemplateOwnerRole

export const InterviewTemplateOwnerRole: typeof $Enums.InterviewTemplateOwnerRole

export type CandidateInterviewPreference = $Enums.CandidateInterviewPreference

export const CandidateInterviewPreference: typeof $Enums.CandidateInterviewPreference

export type CandidateApplicationStatus = $Enums.CandidateApplicationStatus

export const CandidateApplicationStatus: typeof $Enums.CandidateApplicationStatus

export type InterviewSessionStatus = $Enums.InterviewSessionStatus

export const InterviewSessionStatus: typeof $Enums.InterviewSessionStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ContactSubmissions
 * const contactSubmissions = await prisma.contactSubmission.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ContactSubmissions
   * const contactSubmissions = await prisma.contactSubmission.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.contactSubmission`: Exposes CRUD operations for the **ContactSubmission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContactSubmissions
    * const contactSubmissions = await prisma.contactSubmission.findMany()
    * ```
    */
  get contactSubmission(): Prisma.ContactSubmissionDelegate<ExtArgs>;

  /**
   * `prisma.jobSeekerSubmission`: Exposes CRUD operations for the **JobSeekerSubmission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobSeekerSubmissions
    * const jobSeekerSubmissions = await prisma.jobSeekerSubmission.findMany()
    * ```
    */
  get jobSeekerSubmission(): Prisma.JobSeekerSubmissionDelegate<ExtArgs>;

  /**
   * `prisma.purchase`: Exposes CRUD operations for the **Purchase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Purchases
    * const purchases = await prisma.purchase.findMany()
    * ```
    */
  get purchase(): Prisma.PurchaseDelegate<ExtArgs>;

  /**
   * `prisma.funnelEvent`: Exposes CRUD operations for the **FunnelEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FunnelEvents
    * const funnelEvents = await prisma.funnelEvent.findMany()
    * ```
    */
  get funnelEvent(): Prisma.FunnelEventDelegate<ExtArgs>;

  /**
   * `prisma.knowledgeDocument`: Exposes CRUD operations for the **KnowledgeDocument** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KnowledgeDocuments
    * const knowledgeDocuments = await prisma.knowledgeDocument.findMany()
    * ```
    */
  get knowledgeDocument(): Prisma.KnowledgeDocumentDelegate<ExtArgs>;

  /**
   * `prisma.knowledgeChunk`: Exposes CRUD operations for the **KnowledgeChunk** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KnowledgeChunks
    * const knowledgeChunks = await prisma.knowledgeChunk.findMany()
    * ```
    */
  get knowledgeChunk(): Prisma.KnowledgeChunkDelegate<ExtArgs>;

  /**
   * `prisma.chatConversation`: Exposes CRUD operations for the **ChatConversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatConversations
    * const chatConversations = await prisma.chatConversation.findMany()
    * ```
    */
  get chatConversation(): Prisma.ChatConversationDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.interviewTemplate`: Exposes CRUD operations for the **InterviewTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewTemplates
    * const interviewTemplates = await prisma.interviewTemplate.findMany()
    * ```
    */
  get interviewTemplate(): Prisma.InterviewTemplateDelegate<ExtArgs>;

  /**
   * `prisma.candidateApplication`: Exposes CRUD operations for the **CandidateApplication** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CandidateApplications
    * const candidateApplications = await prisma.candidateApplication.findMany()
    * ```
    */
  get candidateApplication(): Prisma.CandidateApplicationDelegate<ExtArgs>;

  /**
   * `prisma.interviewSession`: Exposes CRUD operations for the **InterviewSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewSessions
    * const interviewSessions = await prisma.interviewSession.findMany()
    * ```
    */
  get interviewSession(): Prisma.InterviewSessionDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ContactSubmission: 'ContactSubmission',
    JobSeekerSubmission: 'JobSeekerSubmission',
    Purchase: 'Purchase',
    FunnelEvent: 'FunnelEvent',
    KnowledgeDocument: 'KnowledgeDocument',
    KnowledgeChunk: 'KnowledgeChunk',
    ChatConversation: 'ChatConversation',
    User: 'User',
    InterviewTemplate: 'InterviewTemplate',
    CandidateApplication: 'CandidateApplication',
    InterviewSession: 'InterviewSession'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "contactSubmission" | "jobSeekerSubmission" | "purchase" | "funnelEvent" | "knowledgeDocument" | "knowledgeChunk" | "chatConversation" | "user" | "interviewTemplate" | "candidateApplication" | "interviewSession"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ContactSubmission: {
        payload: Prisma.$ContactSubmissionPayload<ExtArgs>
        fields: Prisma.ContactSubmissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactSubmissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactSubmissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          findFirst: {
            args: Prisma.ContactSubmissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactSubmissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          findMany: {
            args: Prisma.ContactSubmissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>[]
          }
          create: {
            args: Prisma.ContactSubmissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          createMany: {
            args: Prisma.ContactSubmissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContactSubmissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>[]
          }
          delete: {
            args: Prisma.ContactSubmissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          update: {
            args: Prisma.ContactSubmissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          deleteMany: {
            args: Prisma.ContactSubmissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactSubmissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ContactSubmissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactSubmissionPayload>
          }
          aggregate: {
            args: Prisma.ContactSubmissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContactSubmission>
          }
          groupBy: {
            args: Prisma.ContactSubmissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactSubmissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactSubmissionCountArgs<ExtArgs>
            result: $Utils.Optional<ContactSubmissionCountAggregateOutputType> | number
          }
        }
      }
      JobSeekerSubmission: {
        payload: Prisma.$JobSeekerSubmissionPayload<ExtArgs>
        fields: Prisma.JobSeekerSubmissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobSeekerSubmissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobSeekerSubmissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          findFirst: {
            args: Prisma.JobSeekerSubmissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobSeekerSubmissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          findMany: {
            args: Prisma.JobSeekerSubmissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>[]
          }
          create: {
            args: Prisma.JobSeekerSubmissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          createMany: {
            args: Prisma.JobSeekerSubmissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobSeekerSubmissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>[]
          }
          delete: {
            args: Prisma.JobSeekerSubmissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          update: {
            args: Prisma.JobSeekerSubmissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          deleteMany: {
            args: Prisma.JobSeekerSubmissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobSeekerSubmissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.JobSeekerSubmissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobSeekerSubmissionPayload>
          }
          aggregate: {
            args: Prisma.JobSeekerSubmissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobSeekerSubmission>
          }
          groupBy: {
            args: Prisma.JobSeekerSubmissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobSeekerSubmissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobSeekerSubmissionCountArgs<ExtArgs>
            result: $Utils.Optional<JobSeekerSubmissionCountAggregateOutputType> | number
          }
        }
      }
      Purchase: {
        payload: Prisma.$PurchasePayload<ExtArgs>
        fields: Prisma.PurchaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PurchaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PurchaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          findFirst: {
            args: Prisma.PurchaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PurchaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          findMany: {
            args: Prisma.PurchaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>[]
          }
          create: {
            args: Prisma.PurchaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          createMany: {
            args: Prisma.PurchaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PurchaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>[]
          }
          delete: {
            args: Prisma.PurchaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          update: {
            args: Prisma.PurchaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          deleteMany: {
            args: Prisma.PurchaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PurchaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PurchaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          aggregate: {
            args: Prisma.PurchaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePurchase>
          }
          groupBy: {
            args: Prisma.PurchaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<PurchaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.PurchaseCountArgs<ExtArgs>
            result: $Utils.Optional<PurchaseCountAggregateOutputType> | number
          }
        }
      }
      FunnelEvent: {
        payload: Prisma.$FunnelEventPayload<ExtArgs>
        fields: Prisma.FunnelEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FunnelEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FunnelEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          findFirst: {
            args: Prisma.FunnelEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FunnelEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          findMany: {
            args: Prisma.FunnelEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>[]
          }
          create: {
            args: Prisma.FunnelEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          createMany: {
            args: Prisma.FunnelEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FunnelEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>[]
          }
          delete: {
            args: Prisma.FunnelEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          update: {
            args: Prisma.FunnelEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          deleteMany: {
            args: Prisma.FunnelEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FunnelEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FunnelEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FunnelEventPayload>
          }
          aggregate: {
            args: Prisma.FunnelEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFunnelEvent>
          }
          groupBy: {
            args: Prisma.FunnelEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<FunnelEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.FunnelEventCountArgs<ExtArgs>
            result: $Utils.Optional<FunnelEventCountAggregateOutputType> | number
          }
        }
      }
      KnowledgeDocument: {
        payload: Prisma.$KnowledgeDocumentPayload<ExtArgs>
        fields: Prisma.KnowledgeDocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KnowledgeDocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KnowledgeDocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          findFirst: {
            args: Prisma.KnowledgeDocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KnowledgeDocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          findMany: {
            args: Prisma.KnowledgeDocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>[]
          }
          create: {
            args: Prisma.KnowledgeDocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          createMany: {
            args: Prisma.KnowledgeDocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KnowledgeDocumentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>[]
          }
          delete: {
            args: Prisma.KnowledgeDocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          update: {
            args: Prisma.KnowledgeDocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          deleteMany: {
            args: Prisma.KnowledgeDocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KnowledgeDocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.KnowledgeDocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeDocumentPayload>
          }
          aggregate: {
            args: Prisma.KnowledgeDocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKnowledgeDocument>
          }
          groupBy: {
            args: Prisma.KnowledgeDocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeDocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.KnowledgeDocumentCountArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeDocumentCountAggregateOutputType> | number
          }
        }
      }
      KnowledgeChunk: {
        payload: Prisma.$KnowledgeChunkPayload<ExtArgs>
        fields: Prisma.KnowledgeChunkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KnowledgeChunkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KnowledgeChunkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload>
          }
          findFirst: {
            args: Prisma.KnowledgeChunkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KnowledgeChunkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload>
          }
          findMany: {
            args: Prisma.KnowledgeChunkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload>[]
          }
          delete: {
            args: Prisma.KnowledgeChunkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload>
          }
          update: {
            args: Prisma.KnowledgeChunkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgeChunkPayload>
          }
          deleteMany: {
            args: Prisma.KnowledgeChunkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KnowledgeChunkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          aggregate: {
            args: Prisma.KnowledgeChunkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKnowledgeChunk>
          }
          groupBy: {
            args: Prisma.KnowledgeChunkGroupByArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeChunkGroupByOutputType>[]
          }
          count: {
            args: Prisma.KnowledgeChunkCountArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeChunkCountAggregateOutputType> | number
          }
        }
      }
      ChatConversation: {
        payload: Prisma.$ChatConversationPayload<ExtArgs>
        fields: Prisma.ChatConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          findFirst: {
            args: Prisma.ChatConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          findMany: {
            args: Prisma.ChatConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>[]
          }
          create: {
            args: Prisma.ChatConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          createMany: {
            args: Prisma.ChatConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChatConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>[]
          }
          delete: {
            args: Prisma.ChatConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          update: {
            args: Prisma.ChatConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          deleteMany: {
            args: Prisma.ChatConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChatConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          aggregate: {
            args: Prisma.ChatConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatConversation>
          }
          groupBy: {
            args: Prisma.ChatConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatConversationCountArgs<ExtArgs>
            result: $Utils.Optional<ChatConversationCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      InterviewTemplate: {
        payload: Prisma.$InterviewTemplatePayload<ExtArgs>
        fields: Prisma.InterviewTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          findFirst: {
            args: Prisma.InterviewTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          findMany: {
            args: Prisma.InterviewTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>[]
          }
          create: {
            args: Prisma.InterviewTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          createMany: {
            args: Prisma.InterviewTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>[]
          }
          delete: {
            args: Prisma.InterviewTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          update: {
            args: Prisma.InterviewTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          deleteMany: {
            args: Prisma.InterviewTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InterviewTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewTemplatePayload>
          }
          aggregate: {
            args: Prisma.InterviewTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewTemplate>
          }
          groupBy: {
            args: Prisma.InterviewTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewTemplateCountAggregateOutputType> | number
          }
        }
      }
      CandidateApplication: {
        payload: Prisma.$CandidateApplicationPayload<ExtArgs>
        fields: Prisma.CandidateApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CandidateApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CandidateApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          findFirst: {
            args: Prisma.CandidateApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CandidateApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          findMany: {
            args: Prisma.CandidateApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>[]
          }
          create: {
            args: Prisma.CandidateApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          createMany: {
            args: Prisma.CandidateApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CandidateApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>[]
          }
          delete: {
            args: Prisma.CandidateApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          update: {
            args: Prisma.CandidateApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          deleteMany: {
            args: Prisma.CandidateApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CandidateApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CandidateApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateApplicationPayload>
          }
          aggregate: {
            args: Prisma.CandidateApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCandidateApplication>
          }
          groupBy: {
            args: Prisma.CandidateApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<CandidateApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.CandidateApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<CandidateApplicationCountAggregateOutputType> | number
          }
        }
      }
      InterviewSession: {
        payload: Prisma.$InterviewSessionPayload<ExtArgs>
        fields: Prisma.InterviewSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          findFirst: {
            args: Prisma.InterviewSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          findMany: {
            args: Prisma.InterviewSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[]
          }
          create: {
            args: Prisma.InterviewSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          createMany: {
            args: Prisma.InterviewSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[]
          }
          delete: {
            args: Prisma.InterviewSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          update: {
            args: Prisma.InterviewSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          deleteMany: {
            args: Prisma.InterviewSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InterviewSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewSessionPayload>
          }
          aggregate: {
            args: Prisma.InterviewSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewSession>
          }
          groupBy: {
            args: Prisma.InterviewSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewSessionCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewSessionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type KnowledgeDocumentCountOutputType
   */

  export type KnowledgeDocumentCountOutputType = {
    chunks: number
  }

  export type KnowledgeDocumentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chunks?: boolean | KnowledgeDocumentCountOutputTypeCountChunksArgs
  }

  // Custom InputTypes
  /**
   * KnowledgeDocumentCountOutputType without action
   */
  export type KnowledgeDocumentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocumentCountOutputType
     */
    select?: KnowledgeDocumentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * KnowledgeDocumentCountOutputType without action
   */
  export type KnowledgeDocumentCountOutputTypeCountChunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeChunkWhereInput
  }


  /**
   * Count Type InterviewTemplateCountOutputType
   */

  export type InterviewTemplateCountOutputType = {
    applications: number
  }

  export type InterviewTemplateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | InterviewTemplateCountOutputTypeCountApplicationsArgs
  }

  // Custom InputTypes
  /**
   * InterviewTemplateCountOutputType without action
   */
  export type InterviewTemplateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplateCountOutputType
     */
    select?: InterviewTemplateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InterviewTemplateCountOutputType without action
   */
  export type InterviewTemplateCountOutputTypeCountApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateApplicationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ContactSubmission
   */

  export type AggregateContactSubmission = {
    _count: ContactSubmissionCountAggregateOutputType | null
    _min: ContactSubmissionMinAggregateOutputType | null
    _max: ContactSubmissionMaxAggregateOutputType | null
  }

  export type ContactSubmissionMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    subject: string | null
    message: string | null
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date | null
  }

  export type ContactSubmissionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    subject: string | null
    message: string | null
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date | null
  }

  export type ContactSubmissionCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phone: number
    company: number
    subject: number
    message: number
    sourcePath: number
    referrer: number
    ipAddress: number
    userAgent: number
    browser: number
    os: number
    deviceType: number
    country: number
    region: number
    city: number
    createdAt: number
    _all: number
  }


  export type ContactSubmissionMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    subject?: true
    message?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
  }

  export type ContactSubmissionMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    subject?: true
    message?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
  }

  export type ContactSubmissionCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    subject?: true
    message?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
    _all?: true
  }

  export type ContactSubmissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactSubmission to aggregate.
     */
    where?: ContactSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactSubmissions to fetch.
     */
    orderBy?: ContactSubmissionOrderByWithRelationInput | ContactSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContactSubmissions
    **/
    _count?: true | ContactSubmissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactSubmissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactSubmissionMaxAggregateInputType
  }

  export type GetContactSubmissionAggregateType<T extends ContactSubmissionAggregateArgs> = {
        [P in keyof T & keyof AggregateContactSubmission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContactSubmission[P]>
      : GetScalarType<T[P], AggregateContactSubmission[P]>
  }




  export type ContactSubmissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactSubmissionWhereInput
    orderBy?: ContactSubmissionOrderByWithAggregationInput | ContactSubmissionOrderByWithAggregationInput[]
    by: ContactSubmissionScalarFieldEnum[] | ContactSubmissionScalarFieldEnum
    having?: ContactSubmissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactSubmissionCountAggregateInputType | true
    _min?: ContactSubmissionMinAggregateInputType
    _max?: ContactSubmissionMaxAggregateInputType
  }

  export type ContactSubmissionGroupByOutputType = {
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    subject: string | null
    message: string
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date
    _count: ContactSubmissionCountAggregateOutputType | null
    _min: ContactSubmissionMinAggregateOutputType | null
    _max: ContactSubmissionMaxAggregateOutputType | null
  }

  type GetContactSubmissionGroupByPayload<T extends ContactSubmissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactSubmissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactSubmissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactSubmissionGroupByOutputType[P]>
            : GetScalarType<T[P], ContactSubmissionGroupByOutputType[P]>
        }
      >
    >


  export type ContactSubmissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    subject?: boolean
    message?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contactSubmission"]>

  export type ContactSubmissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    subject?: boolean
    message?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contactSubmission"]>

  export type ContactSubmissionSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    subject?: boolean
    message?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }


  export type $ContactSubmissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContactSubmission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      phone: string | null
      company: string | null
      subject: string | null
      message: string
      sourcePath: string | null
      referrer: string | null
      ipAddress: string | null
      userAgent: string | null
      browser: string | null
      os: string | null
      deviceType: string | null
      country: string | null
      region: string | null
      city: string | null
      createdAt: Date
    }, ExtArgs["result"]["contactSubmission"]>
    composites: {}
  }

  type ContactSubmissionGetPayload<S extends boolean | null | undefined | ContactSubmissionDefaultArgs> = $Result.GetResult<Prisma.$ContactSubmissionPayload, S>

  type ContactSubmissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ContactSubmissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ContactSubmissionCountAggregateInputType | true
    }

  export interface ContactSubmissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContactSubmission'], meta: { name: 'ContactSubmission' } }
    /**
     * Find zero or one ContactSubmission that matches the filter.
     * @param {ContactSubmissionFindUniqueArgs} args - Arguments to find a ContactSubmission
     * @example
     * // Get one ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactSubmissionFindUniqueArgs>(args: SelectSubset<T, ContactSubmissionFindUniqueArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ContactSubmission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ContactSubmissionFindUniqueOrThrowArgs} args - Arguments to find a ContactSubmission
     * @example
     * // Get one ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactSubmissionFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactSubmissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ContactSubmission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionFindFirstArgs} args - Arguments to find a ContactSubmission
     * @example
     * // Get one ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactSubmissionFindFirstArgs>(args?: SelectSubset<T, ContactSubmissionFindFirstArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ContactSubmission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionFindFirstOrThrowArgs} args - Arguments to find a ContactSubmission
     * @example
     * // Get one ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactSubmissionFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactSubmissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ContactSubmissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContactSubmissions
     * const contactSubmissions = await prisma.contactSubmission.findMany()
     * 
     * // Get first 10 ContactSubmissions
     * const contactSubmissions = await prisma.contactSubmission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactSubmissionWithIdOnly = await prisma.contactSubmission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactSubmissionFindManyArgs>(args?: SelectSubset<T, ContactSubmissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ContactSubmission.
     * @param {ContactSubmissionCreateArgs} args - Arguments to create a ContactSubmission.
     * @example
     * // Create one ContactSubmission
     * const ContactSubmission = await prisma.contactSubmission.create({
     *   data: {
     *     // ... data to create a ContactSubmission
     *   }
     * })
     * 
     */
    create<T extends ContactSubmissionCreateArgs>(args: SelectSubset<T, ContactSubmissionCreateArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ContactSubmissions.
     * @param {ContactSubmissionCreateManyArgs} args - Arguments to create many ContactSubmissions.
     * @example
     * // Create many ContactSubmissions
     * const contactSubmission = await prisma.contactSubmission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactSubmissionCreateManyArgs>(args?: SelectSubset<T, ContactSubmissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContactSubmissions and returns the data saved in the database.
     * @param {ContactSubmissionCreateManyAndReturnArgs} args - Arguments to create many ContactSubmissions.
     * @example
     * // Create many ContactSubmissions
     * const contactSubmission = await prisma.contactSubmission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContactSubmissions and only return the `id`
     * const contactSubmissionWithIdOnly = await prisma.contactSubmission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContactSubmissionCreateManyAndReturnArgs>(args?: SelectSubset<T, ContactSubmissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ContactSubmission.
     * @param {ContactSubmissionDeleteArgs} args - Arguments to delete one ContactSubmission.
     * @example
     * // Delete one ContactSubmission
     * const ContactSubmission = await prisma.contactSubmission.delete({
     *   where: {
     *     // ... filter to delete one ContactSubmission
     *   }
     * })
     * 
     */
    delete<T extends ContactSubmissionDeleteArgs>(args: SelectSubset<T, ContactSubmissionDeleteArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ContactSubmission.
     * @param {ContactSubmissionUpdateArgs} args - Arguments to update one ContactSubmission.
     * @example
     * // Update one ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactSubmissionUpdateArgs>(args: SelectSubset<T, ContactSubmissionUpdateArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ContactSubmissions.
     * @param {ContactSubmissionDeleteManyArgs} args - Arguments to filter ContactSubmissions to delete.
     * @example
     * // Delete a few ContactSubmissions
     * const { count } = await prisma.contactSubmission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactSubmissionDeleteManyArgs>(args?: SelectSubset<T, ContactSubmissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactSubmissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContactSubmissions
     * const contactSubmission = await prisma.contactSubmission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactSubmissionUpdateManyArgs>(args: SelectSubset<T, ContactSubmissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ContactSubmission.
     * @param {ContactSubmissionUpsertArgs} args - Arguments to update or create a ContactSubmission.
     * @example
     * // Update or create a ContactSubmission
     * const contactSubmission = await prisma.contactSubmission.upsert({
     *   create: {
     *     // ... data to create a ContactSubmission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContactSubmission we want to update
     *   }
     * })
     */
    upsert<T extends ContactSubmissionUpsertArgs>(args: SelectSubset<T, ContactSubmissionUpsertArgs<ExtArgs>>): Prisma__ContactSubmissionClient<$Result.GetResult<Prisma.$ContactSubmissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ContactSubmissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionCountArgs} args - Arguments to filter ContactSubmissions to count.
     * @example
     * // Count the number of ContactSubmissions
     * const count = await prisma.contactSubmission.count({
     *   where: {
     *     // ... the filter for the ContactSubmissions we want to count
     *   }
     * })
    **/
    count<T extends ContactSubmissionCountArgs>(
      args?: Subset<T, ContactSubmissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactSubmissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContactSubmission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContactSubmissionAggregateArgs>(args: Subset<T, ContactSubmissionAggregateArgs>): Prisma.PrismaPromise<GetContactSubmissionAggregateType<T>>

    /**
     * Group by ContactSubmission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactSubmissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContactSubmissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactSubmissionGroupByArgs['orderBy'] }
        : { orderBy?: ContactSubmissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContactSubmissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactSubmissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContactSubmission model
   */
  readonly fields: ContactSubmissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContactSubmission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactSubmissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ContactSubmission model
   */ 
  interface ContactSubmissionFieldRefs {
    readonly id: FieldRef<"ContactSubmission", 'String'>
    readonly name: FieldRef<"ContactSubmission", 'String'>
    readonly email: FieldRef<"ContactSubmission", 'String'>
    readonly phone: FieldRef<"ContactSubmission", 'String'>
    readonly company: FieldRef<"ContactSubmission", 'String'>
    readonly subject: FieldRef<"ContactSubmission", 'String'>
    readonly message: FieldRef<"ContactSubmission", 'String'>
    readonly sourcePath: FieldRef<"ContactSubmission", 'String'>
    readonly referrer: FieldRef<"ContactSubmission", 'String'>
    readonly ipAddress: FieldRef<"ContactSubmission", 'String'>
    readonly userAgent: FieldRef<"ContactSubmission", 'String'>
    readonly browser: FieldRef<"ContactSubmission", 'String'>
    readonly os: FieldRef<"ContactSubmission", 'String'>
    readonly deviceType: FieldRef<"ContactSubmission", 'String'>
    readonly country: FieldRef<"ContactSubmission", 'String'>
    readonly region: FieldRef<"ContactSubmission", 'String'>
    readonly city: FieldRef<"ContactSubmission", 'String'>
    readonly createdAt: FieldRef<"ContactSubmission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ContactSubmission findUnique
   */
  export type ContactSubmissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which ContactSubmission to fetch.
     */
    where: ContactSubmissionWhereUniqueInput
  }

  /**
   * ContactSubmission findUniqueOrThrow
   */
  export type ContactSubmissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which ContactSubmission to fetch.
     */
    where: ContactSubmissionWhereUniqueInput
  }

  /**
   * ContactSubmission findFirst
   */
  export type ContactSubmissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which ContactSubmission to fetch.
     */
    where?: ContactSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactSubmissions to fetch.
     */
    orderBy?: ContactSubmissionOrderByWithRelationInput | ContactSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactSubmissions.
     */
    cursor?: ContactSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactSubmissions.
     */
    distinct?: ContactSubmissionScalarFieldEnum | ContactSubmissionScalarFieldEnum[]
  }

  /**
   * ContactSubmission findFirstOrThrow
   */
  export type ContactSubmissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which ContactSubmission to fetch.
     */
    where?: ContactSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactSubmissions to fetch.
     */
    orderBy?: ContactSubmissionOrderByWithRelationInput | ContactSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactSubmissions.
     */
    cursor?: ContactSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactSubmissions.
     */
    distinct?: ContactSubmissionScalarFieldEnum | ContactSubmissionScalarFieldEnum[]
  }

  /**
   * ContactSubmission findMany
   */
  export type ContactSubmissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which ContactSubmissions to fetch.
     */
    where?: ContactSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactSubmissions to fetch.
     */
    orderBy?: ContactSubmissionOrderByWithRelationInput | ContactSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContactSubmissions.
     */
    cursor?: ContactSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactSubmissions.
     */
    skip?: number
    distinct?: ContactSubmissionScalarFieldEnum | ContactSubmissionScalarFieldEnum[]
  }

  /**
   * ContactSubmission create
   */
  export type ContactSubmissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * The data needed to create a ContactSubmission.
     */
    data: XOR<ContactSubmissionCreateInput, ContactSubmissionUncheckedCreateInput>
  }

  /**
   * ContactSubmission createMany
   */
  export type ContactSubmissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContactSubmissions.
     */
    data: ContactSubmissionCreateManyInput | ContactSubmissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactSubmission createManyAndReturn
   */
  export type ContactSubmissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ContactSubmissions.
     */
    data: ContactSubmissionCreateManyInput | ContactSubmissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactSubmission update
   */
  export type ContactSubmissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * The data needed to update a ContactSubmission.
     */
    data: XOR<ContactSubmissionUpdateInput, ContactSubmissionUncheckedUpdateInput>
    /**
     * Choose, which ContactSubmission to update.
     */
    where: ContactSubmissionWhereUniqueInput
  }

  /**
   * ContactSubmission updateMany
   */
  export type ContactSubmissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContactSubmissions.
     */
    data: XOR<ContactSubmissionUpdateManyMutationInput, ContactSubmissionUncheckedUpdateManyInput>
    /**
     * Filter which ContactSubmissions to update
     */
    where?: ContactSubmissionWhereInput
  }

  /**
   * ContactSubmission upsert
   */
  export type ContactSubmissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * The filter to search for the ContactSubmission to update in case it exists.
     */
    where: ContactSubmissionWhereUniqueInput
    /**
     * In case the ContactSubmission found by the `where` argument doesn't exist, create a new ContactSubmission with this data.
     */
    create: XOR<ContactSubmissionCreateInput, ContactSubmissionUncheckedCreateInput>
    /**
     * In case the ContactSubmission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactSubmissionUpdateInput, ContactSubmissionUncheckedUpdateInput>
  }

  /**
   * ContactSubmission delete
   */
  export type ContactSubmissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
    /**
     * Filter which ContactSubmission to delete.
     */
    where: ContactSubmissionWhereUniqueInput
  }

  /**
   * ContactSubmission deleteMany
   */
  export type ContactSubmissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactSubmissions to delete
     */
    where?: ContactSubmissionWhereInput
  }

  /**
   * ContactSubmission without action
   */
  export type ContactSubmissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactSubmission
     */
    select?: ContactSubmissionSelect<ExtArgs> | null
  }


  /**
   * Model JobSeekerSubmission
   */

  export type AggregateJobSeekerSubmission = {
    _count: JobSeekerSubmissionCountAggregateOutputType | null
    _min: JobSeekerSubmissionMinAggregateOutputType | null
    _max: JobSeekerSubmissionMaxAggregateOutputType | null
  }

  export type JobSeekerSubmissionMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    location: string | null
    description: string | null
    resumeUrl: string | null
    resumeFileName: string | null
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date | null
  }

  export type JobSeekerSubmissionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
    location: string | null
    description: string | null
    resumeUrl: string | null
    resumeFileName: string | null
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date | null
  }

  export type JobSeekerSubmissionCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phone: number
    location: number
    description: number
    resumeUrl: number
    resumeFileName: number
    sourcePath: number
    referrer: number
    ipAddress: number
    userAgent: number
    browser: number
    os: number
    deviceType: number
    country: number
    region: number
    city: number
    createdAt: number
    _all: number
  }


  export type JobSeekerSubmissionMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    location?: true
    description?: true
    resumeUrl?: true
    resumeFileName?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
  }

  export type JobSeekerSubmissionMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    location?: true
    description?: true
    resumeUrl?: true
    resumeFileName?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
  }

  export type JobSeekerSubmissionCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone?: true
    location?: true
    description?: true
    resumeUrl?: true
    resumeFileName?: true
    sourcePath?: true
    referrer?: true
    ipAddress?: true
    userAgent?: true
    browser?: true
    os?: true
    deviceType?: true
    country?: true
    region?: true
    city?: true
    createdAt?: true
    _all?: true
  }

  export type JobSeekerSubmissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobSeekerSubmission to aggregate.
     */
    where?: JobSeekerSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobSeekerSubmissions to fetch.
     */
    orderBy?: JobSeekerSubmissionOrderByWithRelationInput | JobSeekerSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobSeekerSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobSeekerSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobSeekerSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobSeekerSubmissions
    **/
    _count?: true | JobSeekerSubmissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobSeekerSubmissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobSeekerSubmissionMaxAggregateInputType
  }

  export type GetJobSeekerSubmissionAggregateType<T extends JobSeekerSubmissionAggregateArgs> = {
        [P in keyof T & keyof AggregateJobSeekerSubmission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobSeekerSubmission[P]>
      : GetScalarType<T[P], AggregateJobSeekerSubmission[P]>
  }




  export type JobSeekerSubmissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobSeekerSubmissionWhereInput
    orderBy?: JobSeekerSubmissionOrderByWithAggregationInput | JobSeekerSubmissionOrderByWithAggregationInput[]
    by: JobSeekerSubmissionScalarFieldEnum[] | JobSeekerSubmissionScalarFieldEnum
    having?: JobSeekerSubmissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobSeekerSubmissionCountAggregateInputType | true
    _min?: JobSeekerSubmissionMinAggregateInputType
    _max?: JobSeekerSubmissionMaxAggregateInputType
  }

  export type JobSeekerSubmissionGroupByOutputType = {
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
    description: string | null
    resumeUrl: string | null
    resumeFileName: string | null
    sourcePath: string | null
    referrer: string | null
    ipAddress: string | null
    userAgent: string | null
    browser: string | null
    os: string | null
    deviceType: string | null
    country: string | null
    region: string | null
    city: string | null
    createdAt: Date
    _count: JobSeekerSubmissionCountAggregateOutputType | null
    _min: JobSeekerSubmissionMinAggregateOutputType | null
    _max: JobSeekerSubmissionMaxAggregateOutputType | null
  }

  type GetJobSeekerSubmissionGroupByPayload<T extends JobSeekerSubmissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobSeekerSubmissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobSeekerSubmissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobSeekerSubmissionGroupByOutputType[P]>
            : GetScalarType<T[P], JobSeekerSubmissionGroupByOutputType[P]>
        }
      >
    >


  export type JobSeekerSubmissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    location?: boolean
    description?: boolean
    resumeUrl?: boolean
    resumeFileName?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["jobSeekerSubmission"]>

  export type JobSeekerSubmissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    location?: boolean
    description?: boolean
    resumeUrl?: boolean
    resumeFileName?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["jobSeekerSubmission"]>

  export type JobSeekerSubmissionSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    location?: boolean
    description?: boolean
    resumeUrl?: boolean
    resumeFileName?: boolean
    sourcePath?: boolean
    referrer?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    browser?: boolean
    os?: boolean
    deviceType?: boolean
    country?: boolean
    region?: boolean
    city?: boolean
    createdAt?: boolean
  }


  export type $JobSeekerSubmissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobSeekerSubmission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      phone: string | null
      location: string | null
      description: string | null
      resumeUrl: string | null
      resumeFileName: string | null
      sourcePath: string | null
      referrer: string | null
      ipAddress: string | null
      userAgent: string | null
      browser: string | null
      os: string | null
      deviceType: string | null
      country: string | null
      region: string | null
      city: string | null
      createdAt: Date
    }, ExtArgs["result"]["jobSeekerSubmission"]>
    composites: {}
  }

  type JobSeekerSubmissionGetPayload<S extends boolean | null | undefined | JobSeekerSubmissionDefaultArgs> = $Result.GetResult<Prisma.$JobSeekerSubmissionPayload, S>

  type JobSeekerSubmissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<JobSeekerSubmissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: JobSeekerSubmissionCountAggregateInputType | true
    }

  export interface JobSeekerSubmissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobSeekerSubmission'], meta: { name: 'JobSeekerSubmission' } }
    /**
     * Find zero or one JobSeekerSubmission that matches the filter.
     * @param {JobSeekerSubmissionFindUniqueArgs} args - Arguments to find a JobSeekerSubmission
     * @example
     * // Get one JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobSeekerSubmissionFindUniqueArgs>(args: SelectSubset<T, JobSeekerSubmissionFindUniqueArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one JobSeekerSubmission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {JobSeekerSubmissionFindUniqueOrThrowArgs} args - Arguments to find a JobSeekerSubmission
     * @example
     * // Get one JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobSeekerSubmissionFindUniqueOrThrowArgs>(args: SelectSubset<T, JobSeekerSubmissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first JobSeekerSubmission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionFindFirstArgs} args - Arguments to find a JobSeekerSubmission
     * @example
     * // Get one JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobSeekerSubmissionFindFirstArgs>(args?: SelectSubset<T, JobSeekerSubmissionFindFirstArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first JobSeekerSubmission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionFindFirstOrThrowArgs} args - Arguments to find a JobSeekerSubmission
     * @example
     * // Get one JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobSeekerSubmissionFindFirstOrThrowArgs>(args?: SelectSubset<T, JobSeekerSubmissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more JobSeekerSubmissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobSeekerSubmissions
     * const jobSeekerSubmissions = await prisma.jobSeekerSubmission.findMany()
     * 
     * // Get first 10 JobSeekerSubmissions
     * const jobSeekerSubmissions = await prisma.jobSeekerSubmission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobSeekerSubmissionWithIdOnly = await prisma.jobSeekerSubmission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobSeekerSubmissionFindManyArgs>(args?: SelectSubset<T, JobSeekerSubmissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a JobSeekerSubmission.
     * @param {JobSeekerSubmissionCreateArgs} args - Arguments to create a JobSeekerSubmission.
     * @example
     * // Create one JobSeekerSubmission
     * const JobSeekerSubmission = await prisma.jobSeekerSubmission.create({
     *   data: {
     *     // ... data to create a JobSeekerSubmission
     *   }
     * })
     * 
     */
    create<T extends JobSeekerSubmissionCreateArgs>(args: SelectSubset<T, JobSeekerSubmissionCreateArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many JobSeekerSubmissions.
     * @param {JobSeekerSubmissionCreateManyArgs} args - Arguments to create many JobSeekerSubmissions.
     * @example
     * // Create many JobSeekerSubmissions
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobSeekerSubmissionCreateManyArgs>(args?: SelectSubset<T, JobSeekerSubmissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobSeekerSubmissions and returns the data saved in the database.
     * @param {JobSeekerSubmissionCreateManyAndReturnArgs} args - Arguments to create many JobSeekerSubmissions.
     * @example
     * // Create many JobSeekerSubmissions
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobSeekerSubmissions and only return the `id`
     * const jobSeekerSubmissionWithIdOnly = await prisma.jobSeekerSubmission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobSeekerSubmissionCreateManyAndReturnArgs>(args?: SelectSubset<T, JobSeekerSubmissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a JobSeekerSubmission.
     * @param {JobSeekerSubmissionDeleteArgs} args - Arguments to delete one JobSeekerSubmission.
     * @example
     * // Delete one JobSeekerSubmission
     * const JobSeekerSubmission = await prisma.jobSeekerSubmission.delete({
     *   where: {
     *     // ... filter to delete one JobSeekerSubmission
     *   }
     * })
     * 
     */
    delete<T extends JobSeekerSubmissionDeleteArgs>(args: SelectSubset<T, JobSeekerSubmissionDeleteArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one JobSeekerSubmission.
     * @param {JobSeekerSubmissionUpdateArgs} args - Arguments to update one JobSeekerSubmission.
     * @example
     * // Update one JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobSeekerSubmissionUpdateArgs>(args: SelectSubset<T, JobSeekerSubmissionUpdateArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more JobSeekerSubmissions.
     * @param {JobSeekerSubmissionDeleteManyArgs} args - Arguments to filter JobSeekerSubmissions to delete.
     * @example
     * // Delete a few JobSeekerSubmissions
     * const { count } = await prisma.jobSeekerSubmission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobSeekerSubmissionDeleteManyArgs>(args?: SelectSubset<T, JobSeekerSubmissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobSeekerSubmissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobSeekerSubmissions
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobSeekerSubmissionUpdateManyArgs>(args: SelectSubset<T, JobSeekerSubmissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one JobSeekerSubmission.
     * @param {JobSeekerSubmissionUpsertArgs} args - Arguments to update or create a JobSeekerSubmission.
     * @example
     * // Update or create a JobSeekerSubmission
     * const jobSeekerSubmission = await prisma.jobSeekerSubmission.upsert({
     *   create: {
     *     // ... data to create a JobSeekerSubmission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobSeekerSubmission we want to update
     *   }
     * })
     */
    upsert<T extends JobSeekerSubmissionUpsertArgs>(args: SelectSubset<T, JobSeekerSubmissionUpsertArgs<ExtArgs>>): Prisma__JobSeekerSubmissionClient<$Result.GetResult<Prisma.$JobSeekerSubmissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of JobSeekerSubmissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionCountArgs} args - Arguments to filter JobSeekerSubmissions to count.
     * @example
     * // Count the number of JobSeekerSubmissions
     * const count = await prisma.jobSeekerSubmission.count({
     *   where: {
     *     // ... the filter for the JobSeekerSubmissions we want to count
     *   }
     * })
    **/
    count<T extends JobSeekerSubmissionCountArgs>(
      args?: Subset<T, JobSeekerSubmissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobSeekerSubmissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobSeekerSubmission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobSeekerSubmissionAggregateArgs>(args: Subset<T, JobSeekerSubmissionAggregateArgs>): Prisma.PrismaPromise<GetJobSeekerSubmissionAggregateType<T>>

    /**
     * Group by JobSeekerSubmission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobSeekerSubmissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobSeekerSubmissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobSeekerSubmissionGroupByArgs['orderBy'] }
        : { orderBy?: JobSeekerSubmissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobSeekerSubmissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobSeekerSubmissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobSeekerSubmission model
   */
  readonly fields: JobSeekerSubmissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobSeekerSubmission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobSeekerSubmissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JobSeekerSubmission model
   */ 
  interface JobSeekerSubmissionFieldRefs {
    readonly id: FieldRef<"JobSeekerSubmission", 'String'>
    readonly name: FieldRef<"JobSeekerSubmission", 'String'>
    readonly email: FieldRef<"JobSeekerSubmission", 'String'>
    readonly phone: FieldRef<"JobSeekerSubmission", 'String'>
    readonly location: FieldRef<"JobSeekerSubmission", 'String'>
    readonly description: FieldRef<"JobSeekerSubmission", 'String'>
    readonly resumeUrl: FieldRef<"JobSeekerSubmission", 'String'>
    readonly resumeFileName: FieldRef<"JobSeekerSubmission", 'String'>
    readonly sourcePath: FieldRef<"JobSeekerSubmission", 'String'>
    readonly referrer: FieldRef<"JobSeekerSubmission", 'String'>
    readonly ipAddress: FieldRef<"JobSeekerSubmission", 'String'>
    readonly userAgent: FieldRef<"JobSeekerSubmission", 'String'>
    readonly browser: FieldRef<"JobSeekerSubmission", 'String'>
    readonly os: FieldRef<"JobSeekerSubmission", 'String'>
    readonly deviceType: FieldRef<"JobSeekerSubmission", 'String'>
    readonly country: FieldRef<"JobSeekerSubmission", 'String'>
    readonly region: FieldRef<"JobSeekerSubmission", 'String'>
    readonly city: FieldRef<"JobSeekerSubmission", 'String'>
    readonly createdAt: FieldRef<"JobSeekerSubmission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JobSeekerSubmission findUnique
   */
  export type JobSeekerSubmissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which JobSeekerSubmission to fetch.
     */
    where: JobSeekerSubmissionWhereUniqueInput
  }

  /**
   * JobSeekerSubmission findUniqueOrThrow
   */
  export type JobSeekerSubmissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which JobSeekerSubmission to fetch.
     */
    where: JobSeekerSubmissionWhereUniqueInput
  }

  /**
   * JobSeekerSubmission findFirst
   */
  export type JobSeekerSubmissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which JobSeekerSubmission to fetch.
     */
    where?: JobSeekerSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobSeekerSubmissions to fetch.
     */
    orderBy?: JobSeekerSubmissionOrderByWithRelationInput | JobSeekerSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobSeekerSubmissions.
     */
    cursor?: JobSeekerSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobSeekerSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobSeekerSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobSeekerSubmissions.
     */
    distinct?: JobSeekerSubmissionScalarFieldEnum | JobSeekerSubmissionScalarFieldEnum[]
  }

  /**
   * JobSeekerSubmission findFirstOrThrow
   */
  export type JobSeekerSubmissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which JobSeekerSubmission to fetch.
     */
    where?: JobSeekerSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobSeekerSubmissions to fetch.
     */
    orderBy?: JobSeekerSubmissionOrderByWithRelationInput | JobSeekerSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobSeekerSubmissions.
     */
    cursor?: JobSeekerSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobSeekerSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobSeekerSubmissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobSeekerSubmissions.
     */
    distinct?: JobSeekerSubmissionScalarFieldEnum | JobSeekerSubmissionScalarFieldEnum[]
  }

  /**
   * JobSeekerSubmission findMany
   */
  export type JobSeekerSubmissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter, which JobSeekerSubmissions to fetch.
     */
    where?: JobSeekerSubmissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobSeekerSubmissions to fetch.
     */
    orderBy?: JobSeekerSubmissionOrderByWithRelationInput | JobSeekerSubmissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobSeekerSubmissions.
     */
    cursor?: JobSeekerSubmissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobSeekerSubmissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobSeekerSubmissions.
     */
    skip?: number
    distinct?: JobSeekerSubmissionScalarFieldEnum | JobSeekerSubmissionScalarFieldEnum[]
  }

  /**
   * JobSeekerSubmission create
   */
  export type JobSeekerSubmissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * The data needed to create a JobSeekerSubmission.
     */
    data: XOR<JobSeekerSubmissionCreateInput, JobSeekerSubmissionUncheckedCreateInput>
  }

  /**
   * JobSeekerSubmission createMany
   */
  export type JobSeekerSubmissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobSeekerSubmissions.
     */
    data: JobSeekerSubmissionCreateManyInput | JobSeekerSubmissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobSeekerSubmission createManyAndReturn
   */
  export type JobSeekerSubmissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many JobSeekerSubmissions.
     */
    data: JobSeekerSubmissionCreateManyInput | JobSeekerSubmissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobSeekerSubmission update
   */
  export type JobSeekerSubmissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * The data needed to update a JobSeekerSubmission.
     */
    data: XOR<JobSeekerSubmissionUpdateInput, JobSeekerSubmissionUncheckedUpdateInput>
    /**
     * Choose, which JobSeekerSubmission to update.
     */
    where: JobSeekerSubmissionWhereUniqueInput
  }

  /**
   * JobSeekerSubmission updateMany
   */
  export type JobSeekerSubmissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobSeekerSubmissions.
     */
    data: XOR<JobSeekerSubmissionUpdateManyMutationInput, JobSeekerSubmissionUncheckedUpdateManyInput>
    /**
     * Filter which JobSeekerSubmissions to update
     */
    where?: JobSeekerSubmissionWhereInput
  }

  /**
   * JobSeekerSubmission upsert
   */
  export type JobSeekerSubmissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * The filter to search for the JobSeekerSubmission to update in case it exists.
     */
    where: JobSeekerSubmissionWhereUniqueInput
    /**
     * In case the JobSeekerSubmission found by the `where` argument doesn't exist, create a new JobSeekerSubmission with this data.
     */
    create: XOR<JobSeekerSubmissionCreateInput, JobSeekerSubmissionUncheckedCreateInput>
    /**
     * In case the JobSeekerSubmission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobSeekerSubmissionUpdateInput, JobSeekerSubmissionUncheckedUpdateInput>
  }

  /**
   * JobSeekerSubmission delete
   */
  export type JobSeekerSubmissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
    /**
     * Filter which JobSeekerSubmission to delete.
     */
    where: JobSeekerSubmissionWhereUniqueInput
  }

  /**
   * JobSeekerSubmission deleteMany
   */
  export type JobSeekerSubmissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobSeekerSubmissions to delete
     */
    where?: JobSeekerSubmissionWhereInput
  }

  /**
   * JobSeekerSubmission without action
   */
  export type JobSeekerSubmissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobSeekerSubmission
     */
    select?: JobSeekerSubmissionSelect<ExtArgs> | null
  }


  /**
   * Model Purchase
   */

  export type AggregatePurchase = {
    _count: PurchaseCountAggregateOutputType | null
    _avg: PurchaseAvgAggregateOutputType | null
    _sum: PurchaseSumAggregateOutputType | null
    _min: PurchaseMinAggregateOutputType | null
    _max: PurchaseMaxAggregateOutputType | null
  }

  export type PurchaseAvgAggregateOutputType = {
    amount: number | null
  }

  export type PurchaseSumAggregateOutputType = {
    amount: number | null
  }

  export type PurchaseMinAggregateOutputType = {
    id: string | null
    candidateName: string | null
    candidateEmail: string | null
    candidatePhone: string | null
    serviceName: string | null
    amount: number | null
    currency: string | null
    stripePaymentIntentId: string | null
    status: string | null
    country: string | null
    mockInterviewStatus: string | null
    mockInterviewDate: Date | null
    deliveryStatus: string | null
    deliveryDeadline: Date | null
    completionNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseMaxAggregateOutputType = {
    id: string | null
    candidateName: string | null
    candidateEmail: string | null
    candidatePhone: string | null
    serviceName: string | null
    amount: number | null
    currency: string | null
    stripePaymentIntentId: string | null
    status: string | null
    country: string | null
    mockInterviewStatus: string | null
    mockInterviewDate: Date | null
    deliveryStatus: string | null
    deliveryDeadline: Date | null
    completionNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseCountAggregateOutputType = {
    id: number
    candidateName: number
    candidateEmail: number
    candidatePhone: number
    serviceName: number
    amount: number
    currency: number
    stripePaymentIntentId: number
    status: number
    country: number
    mockInterviewStatus: number
    mockInterviewDate: number
    deliveryStatus: number
    deliveryDeadline: number
    completionNotes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PurchaseAvgAggregateInputType = {
    amount?: true
  }

  export type PurchaseSumAggregateInputType = {
    amount?: true
  }

  export type PurchaseMinAggregateInputType = {
    id?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    serviceName?: true
    amount?: true
    currency?: true
    stripePaymentIntentId?: true
    status?: true
    country?: true
    mockInterviewStatus?: true
    mockInterviewDate?: true
    deliveryStatus?: true
    deliveryDeadline?: true
    completionNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseMaxAggregateInputType = {
    id?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    serviceName?: true
    amount?: true
    currency?: true
    stripePaymentIntentId?: true
    status?: true
    country?: true
    mockInterviewStatus?: true
    mockInterviewDate?: true
    deliveryStatus?: true
    deliveryDeadline?: true
    completionNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseCountAggregateInputType = {
    id?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    serviceName?: true
    amount?: true
    currency?: true
    stripePaymentIntentId?: true
    status?: true
    country?: true
    mockInterviewStatus?: true
    mockInterviewDate?: true
    deliveryStatus?: true
    deliveryDeadline?: true
    completionNotes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PurchaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Purchase to aggregate.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Purchases
    **/
    _count?: true | PurchaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PurchaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PurchaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PurchaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PurchaseMaxAggregateInputType
  }

  export type GetPurchaseAggregateType<T extends PurchaseAggregateArgs> = {
        [P in keyof T & keyof AggregatePurchase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePurchase[P]>
      : GetScalarType<T[P], AggregatePurchase[P]>
  }




  export type PurchaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseWhereInput
    orderBy?: PurchaseOrderByWithAggregationInput | PurchaseOrderByWithAggregationInput[]
    by: PurchaseScalarFieldEnum[] | PurchaseScalarFieldEnum
    having?: PurchaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PurchaseCountAggregateInputType | true
    _avg?: PurchaseAvgAggregateInputType
    _sum?: PurchaseSumAggregateInputType
    _min?: PurchaseMinAggregateInputType
    _max?: PurchaseMaxAggregateInputType
  }

  export type PurchaseGroupByOutputType = {
    id: string
    candidateName: string
    candidateEmail: string
    candidatePhone: string | null
    serviceName: string
    amount: number
    currency: string
    stripePaymentIntentId: string
    status: string
    country: string | null
    mockInterviewStatus: string | null
    mockInterviewDate: Date | null
    deliveryStatus: string
    deliveryDeadline: Date | null
    completionNotes: string | null
    createdAt: Date
    updatedAt: Date
    _count: PurchaseCountAggregateOutputType | null
    _avg: PurchaseAvgAggregateOutputType | null
    _sum: PurchaseSumAggregateOutputType | null
    _min: PurchaseMinAggregateOutputType | null
    _max: PurchaseMaxAggregateOutputType | null
  }

  type GetPurchaseGroupByPayload<T extends PurchaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PurchaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PurchaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PurchaseGroupByOutputType[P]>
            : GetScalarType<T[P], PurchaseGroupByOutputType[P]>
        }
      >
    >


  export type PurchaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    serviceName?: boolean
    amount?: boolean
    currency?: boolean
    stripePaymentIntentId?: boolean
    status?: boolean
    country?: boolean
    mockInterviewStatus?: boolean
    mockInterviewDate?: boolean
    deliveryStatus?: boolean
    deliveryDeadline?: boolean
    completionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["purchase"]>

  export type PurchaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    serviceName?: boolean
    amount?: boolean
    currency?: boolean
    stripePaymentIntentId?: boolean
    status?: boolean
    country?: boolean
    mockInterviewStatus?: boolean
    mockInterviewDate?: boolean
    deliveryStatus?: boolean
    deliveryDeadline?: boolean
    completionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["purchase"]>

  export type PurchaseSelectScalar = {
    id?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    serviceName?: boolean
    amount?: boolean
    currency?: boolean
    stripePaymentIntentId?: boolean
    status?: boolean
    country?: boolean
    mockInterviewStatus?: boolean
    mockInterviewDate?: boolean
    deliveryStatus?: boolean
    deliveryDeadline?: boolean
    completionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $PurchasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Purchase"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      candidateName: string
      candidateEmail: string
      candidatePhone: string | null
      serviceName: string
      amount: number
      currency: string
      stripePaymentIntentId: string
      status: string
      country: string | null
      mockInterviewStatus: string | null
      mockInterviewDate: Date | null
      deliveryStatus: string
      deliveryDeadline: Date | null
      completionNotes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["purchase"]>
    composites: {}
  }

  type PurchaseGetPayload<S extends boolean | null | undefined | PurchaseDefaultArgs> = $Result.GetResult<Prisma.$PurchasePayload, S>

  type PurchaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PurchaseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PurchaseCountAggregateInputType | true
    }

  export interface PurchaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Purchase'], meta: { name: 'Purchase' } }
    /**
     * Find zero or one Purchase that matches the filter.
     * @param {PurchaseFindUniqueArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PurchaseFindUniqueArgs>(args: SelectSubset<T, PurchaseFindUniqueArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Purchase that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PurchaseFindUniqueOrThrowArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PurchaseFindUniqueOrThrowArgs>(args: SelectSubset<T, PurchaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Purchase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindFirstArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PurchaseFindFirstArgs>(args?: SelectSubset<T, PurchaseFindFirstArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Purchase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindFirstOrThrowArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PurchaseFindFirstOrThrowArgs>(args?: SelectSubset<T, PurchaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Purchases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Purchases
     * const purchases = await prisma.purchase.findMany()
     * 
     * // Get first 10 Purchases
     * const purchases = await prisma.purchase.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const purchaseWithIdOnly = await prisma.purchase.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PurchaseFindManyArgs>(args?: SelectSubset<T, PurchaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Purchase.
     * @param {PurchaseCreateArgs} args - Arguments to create a Purchase.
     * @example
     * // Create one Purchase
     * const Purchase = await prisma.purchase.create({
     *   data: {
     *     // ... data to create a Purchase
     *   }
     * })
     * 
     */
    create<T extends PurchaseCreateArgs>(args: SelectSubset<T, PurchaseCreateArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Purchases.
     * @param {PurchaseCreateManyArgs} args - Arguments to create many Purchases.
     * @example
     * // Create many Purchases
     * const purchase = await prisma.purchase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PurchaseCreateManyArgs>(args?: SelectSubset<T, PurchaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Purchases and returns the data saved in the database.
     * @param {PurchaseCreateManyAndReturnArgs} args - Arguments to create many Purchases.
     * @example
     * // Create many Purchases
     * const purchase = await prisma.purchase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Purchases and only return the `id`
     * const purchaseWithIdOnly = await prisma.purchase.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PurchaseCreateManyAndReturnArgs>(args?: SelectSubset<T, PurchaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Purchase.
     * @param {PurchaseDeleteArgs} args - Arguments to delete one Purchase.
     * @example
     * // Delete one Purchase
     * const Purchase = await prisma.purchase.delete({
     *   where: {
     *     // ... filter to delete one Purchase
     *   }
     * })
     * 
     */
    delete<T extends PurchaseDeleteArgs>(args: SelectSubset<T, PurchaseDeleteArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Purchase.
     * @param {PurchaseUpdateArgs} args - Arguments to update one Purchase.
     * @example
     * // Update one Purchase
     * const purchase = await prisma.purchase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PurchaseUpdateArgs>(args: SelectSubset<T, PurchaseUpdateArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Purchases.
     * @param {PurchaseDeleteManyArgs} args - Arguments to filter Purchases to delete.
     * @example
     * // Delete a few Purchases
     * const { count } = await prisma.purchase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PurchaseDeleteManyArgs>(args?: SelectSubset<T, PurchaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Purchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Purchases
     * const purchase = await prisma.purchase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PurchaseUpdateManyArgs>(args: SelectSubset<T, PurchaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Purchase.
     * @param {PurchaseUpsertArgs} args - Arguments to update or create a Purchase.
     * @example
     * // Update or create a Purchase
     * const purchase = await prisma.purchase.upsert({
     *   create: {
     *     // ... data to create a Purchase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Purchase we want to update
     *   }
     * })
     */
    upsert<T extends PurchaseUpsertArgs>(args: SelectSubset<T, PurchaseUpsertArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Purchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseCountArgs} args - Arguments to filter Purchases to count.
     * @example
     * // Count the number of Purchases
     * const count = await prisma.purchase.count({
     *   where: {
     *     // ... the filter for the Purchases we want to count
     *   }
     * })
    **/
    count<T extends PurchaseCountArgs>(
      args?: Subset<T, PurchaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PurchaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Purchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PurchaseAggregateArgs>(args: Subset<T, PurchaseAggregateArgs>): Prisma.PrismaPromise<GetPurchaseAggregateType<T>>

    /**
     * Group by Purchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PurchaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PurchaseGroupByArgs['orderBy'] }
        : { orderBy?: PurchaseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PurchaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPurchaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Purchase model
   */
  readonly fields: PurchaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Purchase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PurchaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Purchase model
   */ 
  interface PurchaseFieldRefs {
    readonly id: FieldRef<"Purchase", 'String'>
    readonly candidateName: FieldRef<"Purchase", 'String'>
    readonly candidateEmail: FieldRef<"Purchase", 'String'>
    readonly candidatePhone: FieldRef<"Purchase", 'String'>
    readonly serviceName: FieldRef<"Purchase", 'String'>
    readonly amount: FieldRef<"Purchase", 'Float'>
    readonly currency: FieldRef<"Purchase", 'String'>
    readonly stripePaymentIntentId: FieldRef<"Purchase", 'String'>
    readonly status: FieldRef<"Purchase", 'String'>
    readonly country: FieldRef<"Purchase", 'String'>
    readonly mockInterviewStatus: FieldRef<"Purchase", 'String'>
    readonly mockInterviewDate: FieldRef<"Purchase", 'DateTime'>
    readonly deliveryStatus: FieldRef<"Purchase", 'String'>
    readonly deliveryDeadline: FieldRef<"Purchase", 'DateTime'>
    readonly completionNotes: FieldRef<"Purchase", 'String'>
    readonly createdAt: FieldRef<"Purchase", 'DateTime'>
    readonly updatedAt: FieldRef<"Purchase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Purchase findUnique
   */
  export type PurchaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase findUniqueOrThrow
   */
  export type PurchaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase findFirst
   */
  export type PurchaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Purchases.
     */
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase findFirstOrThrow
   */
  export type PurchaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Purchases.
     */
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase findMany
   */
  export type PurchaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter, which Purchases to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase create
   */
  export type PurchaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * The data needed to create a Purchase.
     */
    data: XOR<PurchaseCreateInput, PurchaseUncheckedCreateInput>
  }

  /**
   * Purchase createMany
   */
  export type PurchaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Purchases.
     */
    data: PurchaseCreateManyInput | PurchaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Purchase createManyAndReturn
   */
  export type PurchaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Purchases.
     */
    data: PurchaseCreateManyInput | PurchaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Purchase update
   */
  export type PurchaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * The data needed to update a Purchase.
     */
    data: XOR<PurchaseUpdateInput, PurchaseUncheckedUpdateInput>
    /**
     * Choose, which Purchase to update.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase updateMany
   */
  export type PurchaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Purchases.
     */
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyInput>
    /**
     * Filter which Purchases to update
     */
    where?: PurchaseWhereInput
  }

  /**
   * Purchase upsert
   */
  export type PurchaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * The filter to search for the Purchase to update in case it exists.
     */
    where: PurchaseWhereUniqueInput
    /**
     * In case the Purchase found by the `where` argument doesn't exist, create a new Purchase with this data.
     */
    create: XOR<PurchaseCreateInput, PurchaseUncheckedCreateInput>
    /**
     * In case the Purchase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PurchaseUpdateInput, PurchaseUncheckedUpdateInput>
  }

  /**
   * Purchase delete
   */
  export type PurchaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Filter which Purchase to delete.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase deleteMany
   */
  export type PurchaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Purchases to delete
     */
    where?: PurchaseWhereInput
  }

  /**
   * Purchase without action
   */
  export type PurchaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
  }


  /**
   * Model FunnelEvent
   */

  export type AggregateFunnelEvent = {
    _count: FunnelEventCountAggregateOutputType | null
    _min: FunnelEventMinAggregateOutputType | null
    _max: FunnelEventMaxAggregateOutputType | null
  }

  export type FunnelEventMinAggregateOutputType = {
    id: string | null
    serviceName: string | null
    eventType: string | null
    createdAt: Date | null
  }

  export type FunnelEventMaxAggregateOutputType = {
    id: string | null
    serviceName: string | null
    eventType: string | null
    createdAt: Date | null
  }

  export type FunnelEventCountAggregateOutputType = {
    id: number
    serviceName: number
    eventType: number
    createdAt: number
    _all: number
  }


  export type FunnelEventMinAggregateInputType = {
    id?: true
    serviceName?: true
    eventType?: true
    createdAt?: true
  }

  export type FunnelEventMaxAggregateInputType = {
    id?: true
    serviceName?: true
    eventType?: true
    createdAt?: true
  }

  export type FunnelEventCountAggregateInputType = {
    id?: true
    serviceName?: true
    eventType?: true
    createdAt?: true
    _all?: true
  }

  export type FunnelEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FunnelEvent to aggregate.
     */
    where?: FunnelEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FunnelEvents to fetch.
     */
    orderBy?: FunnelEventOrderByWithRelationInput | FunnelEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FunnelEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FunnelEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FunnelEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FunnelEvents
    **/
    _count?: true | FunnelEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FunnelEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FunnelEventMaxAggregateInputType
  }

  export type GetFunnelEventAggregateType<T extends FunnelEventAggregateArgs> = {
        [P in keyof T & keyof AggregateFunnelEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFunnelEvent[P]>
      : GetScalarType<T[P], AggregateFunnelEvent[P]>
  }




  export type FunnelEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FunnelEventWhereInput
    orderBy?: FunnelEventOrderByWithAggregationInput | FunnelEventOrderByWithAggregationInput[]
    by: FunnelEventScalarFieldEnum[] | FunnelEventScalarFieldEnum
    having?: FunnelEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FunnelEventCountAggregateInputType | true
    _min?: FunnelEventMinAggregateInputType
    _max?: FunnelEventMaxAggregateInputType
  }

  export type FunnelEventGroupByOutputType = {
    id: string
    serviceName: string
    eventType: string
    createdAt: Date
    _count: FunnelEventCountAggregateOutputType | null
    _min: FunnelEventMinAggregateOutputType | null
    _max: FunnelEventMaxAggregateOutputType | null
  }

  type GetFunnelEventGroupByPayload<T extends FunnelEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FunnelEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FunnelEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FunnelEventGroupByOutputType[P]>
            : GetScalarType<T[P], FunnelEventGroupByOutputType[P]>
        }
      >
    >


  export type FunnelEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceName?: boolean
    eventType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["funnelEvent"]>

  export type FunnelEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceName?: boolean
    eventType?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["funnelEvent"]>

  export type FunnelEventSelectScalar = {
    id?: boolean
    serviceName?: boolean
    eventType?: boolean
    createdAt?: boolean
  }


  export type $FunnelEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FunnelEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      serviceName: string
      eventType: string
      createdAt: Date
    }, ExtArgs["result"]["funnelEvent"]>
    composites: {}
  }

  type FunnelEventGetPayload<S extends boolean | null | undefined | FunnelEventDefaultArgs> = $Result.GetResult<Prisma.$FunnelEventPayload, S>

  type FunnelEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FunnelEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FunnelEventCountAggregateInputType | true
    }

  export interface FunnelEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FunnelEvent'], meta: { name: 'FunnelEvent' } }
    /**
     * Find zero or one FunnelEvent that matches the filter.
     * @param {FunnelEventFindUniqueArgs} args - Arguments to find a FunnelEvent
     * @example
     * // Get one FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FunnelEventFindUniqueArgs>(args: SelectSubset<T, FunnelEventFindUniqueArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FunnelEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FunnelEventFindUniqueOrThrowArgs} args - Arguments to find a FunnelEvent
     * @example
     * // Get one FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FunnelEventFindUniqueOrThrowArgs>(args: SelectSubset<T, FunnelEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FunnelEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventFindFirstArgs} args - Arguments to find a FunnelEvent
     * @example
     * // Get one FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FunnelEventFindFirstArgs>(args?: SelectSubset<T, FunnelEventFindFirstArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FunnelEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventFindFirstOrThrowArgs} args - Arguments to find a FunnelEvent
     * @example
     * // Get one FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FunnelEventFindFirstOrThrowArgs>(args?: SelectSubset<T, FunnelEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FunnelEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FunnelEvents
     * const funnelEvents = await prisma.funnelEvent.findMany()
     * 
     * // Get first 10 FunnelEvents
     * const funnelEvents = await prisma.funnelEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const funnelEventWithIdOnly = await prisma.funnelEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FunnelEventFindManyArgs>(args?: SelectSubset<T, FunnelEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FunnelEvent.
     * @param {FunnelEventCreateArgs} args - Arguments to create a FunnelEvent.
     * @example
     * // Create one FunnelEvent
     * const FunnelEvent = await prisma.funnelEvent.create({
     *   data: {
     *     // ... data to create a FunnelEvent
     *   }
     * })
     * 
     */
    create<T extends FunnelEventCreateArgs>(args: SelectSubset<T, FunnelEventCreateArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FunnelEvents.
     * @param {FunnelEventCreateManyArgs} args - Arguments to create many FunnelEvents.
     * @example
     * // Create many FunnelEvents
     * const funnelEvent = await prisma.funnelEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FunnelEventCreateManyArgs>(args?: SelectSubset<T, FunnelEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FunnelEvents and returns the data saved in the database.
     * @param {FunnelEventCreateManyAndReturnArgs} args - Arguments to create many FunnelEvents.
     * @example
     * // Create many FunnelEvents
     * const funnelEvent = await prisma.funnelEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FunnelEvents and only return the `id`
     * const funnelEventWithIdOnly = await prisma.funnelEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FunnelEventCreateManyAndReturnArgs>(args?: SelectSubset<T, FunnelEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FunnelEvent.
     * @param {FunnelEventDeleteArgs} args - Arguments to delete one FunnelEvent.
     * @example
     * // Delete one FunnelEvent
     * const FunnelEvent = await prisma.funnelEvent.delete({
     *   where: {
     *     // ... filter to delete one FunnelEvent
     *   }
     * })
     * 
     */
    delete<T extends FunnelEventDeleteArgs>(args: SelectSubset<T, FunnelEventDeleteArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FunnelEvent.
     * @param {FunnelEventUpdateArgs} args - Arguments to update one FunnelEvent.
     * @example
     * // Update one FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FunnelEventUpdateArgs>(args: SelectSubset<T, FunnelEventUpdateArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FunnelEvents.
     * @param {FunnelEventDeleteManyArgs} args - Arguments to filter FunnelEvents to delete.
     * @example
     * // Delete a few FunnelEvents
     * const { count } = await prisma.funnelEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FunnelEventDeleteManyArgs>(args?: SelectSubset<T, FunnelEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FunnelEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FunnelEvents
     * const funnelEvent = await prisma.funnelEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FunnelEventUpdateManyArgs>(args: SelectSubset<T, FunnelEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FunnelEvent.
     * @param {FunnelEventUpsertArgs} args - Arguments to update or create a FunnelEvent.
     * @example
     * // Update or create a FunnelEvent
     * const funnelEvent = await prisma.funnelEvent.upsert({
     *   create: {
     *     // ... data to create a FunnelEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FunnelEvent we want to update
     *   }
     * })
     */
    upsert<T extends FunnelEventUpsertArgs>(args: SelectSubset<T, FunnelEventUpsertArgs<ExtArgs>>): Prisma__FunnelEventClient<$Result.GetResult<Prisma.$FunnelEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FunnelEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventCountArgs} args - Arguments to filter FunnelEvents to count.
     * @example
     * // Count the number of FunnelEvents
     * const count = await prisma.funnelEvent.count({
     *   where: {
     *     // ... the filter for the FunnelEvents we want to count
     *   }
     * })
    **/
    count<T extends FunnelEventCountArgs>(
      args?: Subset<T, FunnelEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FunnelEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FunnelEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FunnelEventAggregateArgs>(args: Subset<T, FunnelEventAggregateArgs>): Prisma.PrismaPromise<GetFunnelEventAggregateType<T>>

    /**
     * Group by FunnelEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FunnelEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FunnelEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FunnelEventGroupByArgs['orderBy'] }
        : { orderBy?: FunnelEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FunnelEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFunnelEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FunnelEvent model
   */
  readonly fields: FunnelEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FunnelEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FunnelEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FunnelEvent model
   */ 
  interface FunnelEventFieldRefs {
    readonly id: FieldRef<"FunnelEvent", 'String'>
    readonly serviceName: FieldRef<"FunnelEvent", 'String'>
    readonly eventType: FieldRef<"FunnelEvent", 'String'>
    readonly createdAt: FieldRef<"FunnelEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FunnelEvent findUnique
   */
  export type FunnelEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter, which FunnelEvent to fetch.
     */
    where: FunnelEventWhereUniqueInput
  }

  /**
   * FunnelEvent findUniqueOrThrow
   */
  export type FunnelEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter, which FunnelEvent to fetch.
     */
    where: FunnelEventWhereUniqueInput
  }

  /**
   * FunnelEvent findFirst
   */
  export type FunnelEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter, which FunnelEvent to fetch.
     */
    where?: FunnelEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FunnelEvents to fetch.
     */
    orderBy?: FunnelEventOrderByWithRelationInput | FunnelEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FunnelEvents.
     */
    cursor?: FunnelEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FunnelEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FunnelEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FunnelEvents.
     */
    distinct?: FunnelEventScalarFieldEnum | FunnelEventScalarFieldEnum[]
  }

  /**
   * FunnelEvent findFirstOrThrow
   */
  export type FunnelEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter, which FunnelEvent to fetch.
     */
    where?: FunnelEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FunnelEvents to fetch.
     */
    orderBy?: FunnelEventOrderByWithRelationInput | FunnelEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FunnelEvents.
     */
    cursor?: FunnelEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FunnelEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FunnelEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FunnelEvents.
     */
    distinct?: FunnelEventScalarFieldEnum | FunnelEventScalarFieldEnum[]
  }

  /**
   * FunnelEvent findMany
   */
  export type FunnelEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter, which FunnelEvents to fetch.
     */
    where?: FunnelEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FunnelEvents to fetch.
     */
    orderBy?: FunnelEventOrderByWithRelationInput | FunnelEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FunnelEvents.
     */
    cursor?: FunnelEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FunnelEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FunnelEvents.
     */
    skip?: number
    distinct?: FunnelEventScalarFieldEnum | FunnelEventScalarFieldEnum[]
  }

  /**
   * FunnelEvent create
   */
  export type FunnelEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * The data needed to create a FunnelEvent.
     */
    data: XOR<FunnelEventCreateInput, FunnelEventUncheckedCreateInput>
  }

  /**
   * FunnelEvent createMany
   */
  export type FunnelEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FunnelEvents.
     */
    data: FunnelEventCreateManyInput | FunnelEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FunnelEvent createManyAndReturn
   */
  export type FunnelEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FunnelEvents.
     */
    data: FunnelEventCreateManyInput | FunnelEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FunnelEvent update
   */
  export type FunnelEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * The data needed to update a FunnelEvent.
     */
    data: XOR<FunnelEventUpdateInput, FunnelEventUncheckedUpdateInput>
    /**
     * Choose, which FunnelEvent to update.
     */
    where: FunnelEventWhereUniqueInput
  }

  /**
   * FunnelEvent updateMany
   */
  export type FunnelEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FunnelEvents.
     */
    data: XOR<FunnelEventUpdateManyMutationInput, FunnelEventUncheckedUpdateManyInput>
    /**
     * Filter which FunnelEvents to update
     */
    where?: FunnelEventWhereInput
  }

  /**
   * FunnelEvent upsert
   */
  export type FunnelEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * The filter to search for the FunnelEvent to update in case it exists.
     */
    where: FunnelEventWhereUniqueInput
    /**
     * In case the FunnelEvent found by the `where` argument doesn't exist, create a new FunnelEvent with this data.
     */
    create: XOR<FunnelEventCreateInput, FunnelEventUncheckedCreateInput>
    /**
     * In case the FunnelEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FunnelEventUpdateInput, FunnelEventUncheckedUpdateInput>
  }

  /**
   * FunnelEvent delete
   */
  export type FunnelEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
    /**
     * Filter which FunnelEvent to delete.
     */
    where: FunnelEventWhereUniqueInput
  }

  /**
   * FunnelEvent deleteMany
   */
  export type FunnelEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FunnelEvents to delete
     */
    where?: FunnelEventWhereInput
  }

  /**
   * FunnelEvent without action
   */
  export type FunnelEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FunnelEvent
     */
    select?: FunnelEventSelect<ExtArgs> | null
  }


  /**
   * Model KnowledgeDocument
   */

  export type AggregateKnowledgeDocument = {
    _count: KnowledgeDocumentCountAggregateOutputType | null
    _min: KnowledgeDocumentMinAggregateOutputType | null
    _max: KnowledgeDocumentMaxAggregateOutputType | null
  }

  export type KnowledgeDocumentMinAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    sourceType: string | null
    fileName: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KnowledgeDocumentMaxAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    sourceType: string | null
    fileName: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KnowledgeDocumentCountAggregateOutputType = {
    id: number
    title: number
    content: number
    sourceType: number
    fileName: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type KnowledgeDocumentMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    sourceType?: true
    fileName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KnowledgeDocumentMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    sourceType?: true
    fileName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KnowledgeDocumentCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    sourceType?: true
    fileName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type KnowledgeDocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnowledgeDocument to aggregate.
     */
    where?: KnowledgeDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeDocuments to fetch.
     */
    orderBy?: KnowledgeDocumentOrderByWithRelationInput | KnowledgeDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KnowledgeDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KnowledgeDocuments
    **/
    _count?: true | KnowledgeDocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KnowledgeDocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KnowledgeDocumentMaxAggregateInputType
  }

  export type GetKnowledgeDocumentAggregateType<T extends KnowledgeDocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateKnowledgeDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKnowledgeDocument[P]>
      : GetScalarType<T[P], AggregateKnowledgeDocument[P]>
  }




  export type KnowledgeDocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeDocumentWhereInput
    orderBy?: KnowledgeDocumentOrderByWithAggregationInput | KnowledgeDocumentOrderByWithAggregationInput[]
    by: KnowledgeDocumentScalarFieldEnum[] | KnowledgeDocumentScalarFieldEnum
    having?: KnowledgeDocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KnowledgeDocumentCountAggregateInputType | true
    _min?: KnowledgeDocumentMinAggregateInputType
    _max?: KnowledgeDocumentMaxAggregateInputType
  }

  export type KnowledgeDocumentGroupByOutputType = {
    id: string
    title: string
    content: string
    sourceType: string
    fileName: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: KnowledgeDocumentCountAggregateOutputType | null
    _min: KnowledgeDocumentMinAggregateOutputType | null
    _max: KnowledgeDocumentMaxAggregateOutputType | null
  }

  type GetKnowledgeDocumentGroupByPayload<T extends KnowledgeDocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KnowledgeDocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KnowledgeDocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KnowledgeDocumentGroupByOutputType[P]>
            : GetScalarType<T[P], KnowledgeDocumentGroupByOutputType[P]>
        }
      >
    >


  export type KnowledgeDocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    sourceType?: boolean
    fileName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    chunks?: boolean | KnowledgeDocument$chunksArgs<ExtArgs>
    _count?: boolean | KnowledgeDocumentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledgeDocument"]>

  export type KnowledgeDocumentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    sourceType?: boolean
    fileName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["knowledgeDocument"]>

  export type KnowledgeDocumentSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    sourceType?: boolean
    fileName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type KnowledgeDocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chunks?: boolean | KnowledgeDocument$chunksArgs<ExtArgs>
    _count?: boolean | KnowledgeDocumentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type KnowledgeDocumentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $KnowledgeDocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KnowledgeDocument"
    objects: {
      chunks: Prisma.$KnowledgeChunkPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      content: string
      sourceType: string
      fileName: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["knowledgeDocument"]>
    composites: {}
  }

  type KnowledgeDocumentGetPayload<S extends boolean | null | undefined | KnowledgeDocumentDefaultArgs> = $Result.GetResult<Prisma.$KnowledgeDocumentPayload, S>

  type KnowledgeDocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<KnowledgeDocumentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KnowledgeDocumentCountAggregateInputType | true
    }

  export interface KnowledgeDocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KnowledgeDocument'], meta: { name: 'KnowledgeDocument' } }
    /**
     * Find zero or one KnowledgeDocument that matches the filter.
     * @param {KnowledgeDocumentFindUniqueArgs} args - Arguments to find a KnowledgeDocument
     * @example
     * // Get one KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KnowledgeDocumentFindUniqueArgs>(args: SelectSubset<T, KnowledgeDocumentFindUniqueArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one KnowledgeDocument that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {KnowledgeDocumentFindUniqueOrThrowArgs} args - Arguments to find a KnowledgeDocument
     * @example
     * // Get one KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KnowledgeDocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, KnowledgeDocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first KnowledgeDocument that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentFindFirstArgs} args - Arguments to find a KnowledgeDocument
     * @example
     * // Get one KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KnowledgeDocumentFindFirstArgs>(args?: SelectSubset<T, KnowledgeDocumentFindFirstArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first KnowledgeDocument that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentFindFirstOrThrowArgs} args - Arguments to find a KnowledgeDocument
     * @example
     * // Get one KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KnowledgeDocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, KnowledgeDocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more KnowledgeDocuments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KnowledgeDocuments
     * const knowledgeDocuments = await prisma.knowledgeDocument.findMany()
     * 
     * // Get first 10 KnowledgeDocuments
     * const knowledgeDocuments = await prisma.knowledgeDocument.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const knowledgeDocumentWithIdOnly = await prisma.knowledgeDocument.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KnowledgeDocumentFindManyArgs>(args?: SelectSubset<T, KnowledgeDocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a KnowledgeDocument.
     * @param {KnowledgeDocumentCreateArgs} args - Arguments to create a KnowledgeDocument.
     * @example
     * // Create one KnowledgeDocument
     * const KnowledgeDocument = await prisma.knowledgeDocument.create({
     *   data: {
     *     // ... data to create a KnowledgeDocument
     *   }
     * })
     * 
     */
    create<T extends KnowledgeDocumentCreateArgs>(args: SelectSubset<T, KnowledgeDocumentCreateArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many KnowledgeDocuments.
     * @param {KnowledgeDocumentCreateManyArgs} args - Arguments to create many KnowledgeDocuments.
     * @example
     * // Create many KnowledgeDocuments
     * const knowledgeDocument = await prisma.knowledgeDocument.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KnowledgeDocumentCreateManyArgs>(args?: SelectSubset<T, KnowledgeDocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KnowledgeDocuments and returns the data saved in the database.
     * @param {KnowledgeDocumentCreateManyAndReturnArgs} args - Arguments to create many KnowledgeDocuments.
     * @example
     * // Create many KnowledgeDocuments
     * const knowledgeDocument = await prisma.knowledgeDocument.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KnowledgeDocuments and only return the `id`
     * const knowledgeDocumentWithIdOnly = await prisma.knowledgeDocument.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KnowledgeDocumentCreateManyAndReturnArgs>(args?: SelectSubset<T, KnowledgeDocumentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a KnowledgeDocument.
     * @param {KnowledgeDocumentDeleteArgs} args - Arguments to delete one KnowledgeDocument.
     * @example
     * // Delete one KnowledgeDocument
     * const KnowledgeDocument = await prisma.knowledgeDocument.delete({
     *   where: {
     *     // ... filter to delete one KnowledgeDocument
     *   }
     * })
     * 
     */
    delete<T extends KnowledgeDocumentDeleteArgs>(args: SelectSubset<T, KnowledgeDocumentDeleteArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one KnowledgeDocument.
     * @param {KnowledgeDocumentUpdateArgs} args - Arguments to update one KnowledgeDocument.
     * @example
     * // Update one KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KnowledgeDocumentUpdateArgs>(args: SelectSubset<T, KnowledgeDocumentUpdateArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more KnowledgeDocuments.
     * @param {KnowledgeDocumentDeleteManyArgs} args - Arguments to filter KnowledgeDocuments to delete.
     * @example
     * // Delete a few KnowledgeDocuments
     * const { count } = await prisma.knowledgeDocument.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KnowledgeDocumentDeleteManyArgs>(args?: SelectSubset<T, KnowledgeDocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KnowledgeDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KnowledgeDocuments
     * const knowledgeDocument = await prisma.knowledgeDocument.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KnowledgeDocumentUpdateManyArgs>(args: SelectSubset<T, KnowledgeDocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one KnowledgeDocument.
     * @param {KnowledgeDocumentUpsertArgs} args - Arguments to update or create a KnowledgeDocument.
     * @example
     * // Update or create a KnowledgeDocument
     * const knowledgeDocument = await prisma.knowledgeDocument.upsert({
     *   create: {
     *     // ... data to create a KnowledgeDocument
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KnowledgeDocument we want to update
     *   }
     * })
     */
    upsert<T extends KnowledgeDocumentUpsertArgs>(args: SelectSubset<T, KnowledgeDocumentUpsertArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of KnowledgeDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentCountArgs} args - Arguments to filter KnowledgeDocuments to count.
     * @example
     * // Count the number of KnowledgeDocuments
     * const count = await prisma.knowledgeDocument.count({
     *   where: {
     *     // ... the filter for the KnowledgeDocuments we want to count
     *   }
     * })
    **/
    count<T extends KnowledgeDocumentCountArgs>(
      args?: Subset<T, KnowledgeDocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KnowledgeDocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KnowledgeDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KnowledgeDocumentAggregateArgs>(args: Subset<T, KnowledgeDocumentAggregateArgs>): Prisma.PrismaPromise<GetKnowledgeDocumentAggregateType<T>>

    /**
     * Group by KnowledgeDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeDocumentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KnowledgeDocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KnowledgeDocumentGroupByArgs['orderBy'] }
        : { orderBy?: KnowledgeDocumentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KnowledgeDocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKnowledgeDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KnowledgeDocument model
   */
  readonly fields: KnowledgeDocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KnowledgeDocument.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KnowledgeDocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    chunks<T extends KnowledgeDocument$chunksArgs<ExtArgs> = {}>(args?: Subset<T, KnowledgeDocument$chunksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KnowledgeDocument model
   */ 
  interface KnowledgeDocumentFieldRefs {
    readonly id: FieldRef<"KnowledgeDocument", 'String'>
    readonly title: FieldRef<"KnowledgeDocument", 'String'>
    readonly content: FieldRef<"KnowledgeDocument", 'String'>
    readonly sourceType: FieldRef<"KnowledgeDocument", 'String'>
    readonly fileName: FieldRef<"KnowledgeDocument", 'String'>
    readonly isActive: FieldRef<"KnowledgeDocument", 'Boolean'>
    readonly createdAt: FieldRef<"KnowledgeDocument", 'DateTime'>
    readonly updatedAt: FieldRef<"KnowledgeDocument", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KnowledgeDocument findUnique
   */
  export type KnowledgeDocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeDocument to fetch.
     */
    where: KnowledgeDocumentWhereUniqueInput
  }

  /**
   * KnowledgeDocument findUniqueOrThrow
   */
  export type KnowledgeDocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeDocument to fetch.
     */
    where: KnowledgeDocumentWhereUniqueInput
  }

  /**
   * KnowledgeDocument findFirst
   */
  export type KnowledgeDocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeDocument to fetch.
     */
    where?: KnowledgeDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeDocuments to fetch.
     */
    orderBy?: KnowledgeDocumentOrderByWithRelationInput | KnowledgeDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnowledgeDocuments.
     */
    cursor?: KnowledgeDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnowledgeDocuments.
     */
    distinct?: KnowledgeDocumentScalarFieldEnum | KnowledgeDocumentScalarFieldEnum[]
  }

  /**
   * KnowledgeDocument findFirstOrThrow
   */
  export type KnowledgeDocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeDocument to fetch.
     */
    where?: KnowledgeDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeDocuments to fetch.
     */
    orderBy?: KnowledgeDocumentOrderByWithRelationInput | KnowledgeDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnowledgeDocuments.
     */
    cursor?: KnowledgeDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnowledgeDocuments.
     */
    distinct?: KnowledgeDocumentScalarFieldEnum | KnowledgeDocumentScalarFieldEnum[]
  }

  /**
   * KnowledgeDocument findMany
   */
  export type KnowledgeDocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeDocuments to fetch.
     */
    where?: KnowledgeDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeDocuments to fetch.
     */
    orderBy?: KnowledgeDocumentOrderByWithRelationInput | KnowledgeDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KnowledgeDocuments.
     */
    cursor?: KnowledgeDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeDocuments.
     */
    skip?: number
    distinct?: KnowledgeDocumentScalarFieldEnum | KnowledgeDocumentScalarFieldEnum[]
  }

  /**
   * KnowledgeDocument create
   */
  export type KnowledgeDocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a KnowledgeDocument.
     */
    data: XOR<KnowledgeDocumentCreateInput, KnowledgeDocumentUncheckedCreateInput>
  }

  /**
   * KnowledgeDocument createMany
   */
  export type KnowledgeDocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KnowledgeDocuments.
     */
    data: KnowledgeDocumentCreateManyInput | KnowledgeDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KnowledgeDocument createManyAndReturn
   */
  export type KnowledgeDocumentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many KnowledgeDocuments.
     */
    data: KnowledgeDocumentCreateManyInput | KnowledgeDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KnowledgeDocument update
   */
  export type KnowledgeDocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a KnowledgeDocument.
     */
    data: XOR<KnowledgeDocumentUpdateInput, KnowledgeDocumentUncheckedUpdateInput>
    /**
     * Choose, which KnowledgeDocument to update.
     */
    where: KnowledgeDocumentWhereUniqueInput
  }

  /**
   * KnowledgeDocument updateMany
   */
  export type KnowledgeDocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KnowledgeDocuments.
     */
    data: XOR<KnowledgeDocumentUpdateManyMutationInput, KnowledgeDocumentUncheckedUpdateManyInput>
    /**
     * Filter which KnowledgeDocuments to update
     */
    where?: KnowledgeDocumentWhereInput
  }

  /**
   * KnowledgeDocument upsert
   */
  export type KnowledgeDocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the KnowledgeDocument to update in case it exists.
     */
    where: KnowledgeDocumentWhereUniqueInput
    /**
     * In case the KnowledgeDocument found by the `where` argument doesn't exist, create a new KnowledgeDocument with this data.
     */
    create: XOR<KnowledgeDocumentCreateInput, KnowledgeDocumentUncheckedCreateInput>
    /**
     * In case the KnowledgeDocument was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KnowledgeDocumentUpdateInput, KnowledgeDocumentUncheckedUpdateInput>
  }

  /**
   * KnowledgeDocument delete
   */
  export type KnowledgeDocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
    /**
     * Filter which KnowledgeDocument to delete.
     */
    where: KnowledgeDocumentWhereUniqueInput
  }

  /**
   * KnowledgeDocument deleteMany
   */
  export type KnowledgeDocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnowledgeDocuments to delete
     */
    where?: KnowledgeDocumentWhereInput
  }

  /**
   * KnowledgeDocument.chunks
   */
  export type KnowledgeDocument$chunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    where?: KnowledgeChunkWhereInput
    orderBy?: KnowledgeChunkOrderByWithRelationInput | KnowledgeChunkOrderByWithRelationInput[]
    cursor?: KnowledgeChunkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KnowledgeChunkScalarFieldEnum | KnowledgeChunkScalarFieldEnum[]
  }

  /**
   * KnowledgeDocument without action
   */
  export type KnowledgeDocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeDocument
     */
    select?: KnowledgeDocumentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeDocumentInclude<ExtArgs> | null
  }


  /**
   * Model KnowledgeChunk
   */

  export type AggregateKnowledgeChunk = {
    _count: KnowledgeChunkCountAggregateOutputType | null
    _avg: KnowledgeChunkAvgAggregateOutputType | null
    _sum: KnowledgeChunkSumAggregateOutputType | null
    _min: KnowledgeChunkMinAggregateOutputType | null
    _max: KnowledgeChunkMaxAggregateOutputType | null
  }

  export type KnowledgeChunkAvgAggregateOutputType = {
    chunkIndex: number | null
  }

  export type KnowledgeChunkSumAggregateOutputType = {
    chunkIndex: number | null
  }

  export type KnowledgeChunkMinAggregateOutputType = {
    id: string | null
    documentId: string | null
    content: string | null
    chunkIndex: number | null
    createdAt: Date | null
  }

  export type KnowledgeChunkMaxAggregateOutputType = {
    id: string | null
    documentId: string | null
    content: string | null
    chunkIndex: number | null
    createdAt: Date | null
  }

  export type KnowledgeChunkCountAggregateOutputType = {
    id: number
    documentId: number
    content: number
    chunkIndex: number
    createdAt: number
    _all: number
  }


  export type KnowledgeChunkAvgAggregateInputType = {
    chunkIndex?: true
  }

  export type KnowledgeChunkSumAggregateInputType = {
    chunkIndex?: true
  }

  export type KnowledgeChunkMinAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
    createdAt?: true
  }

  export type KnowledgeChunkMaxAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
    createdAt?: true
  }

  export type KnowledgeChunkCountAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
    createdAt?: true
    _all?: true
  }

  export type KnowledgeChunkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnowledgeChunk to aggregate.
     */
    where?: KnowledgeChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeChunks to fetch.
     */
    orderBy?: KnowledgeChunkOrderByWithRelationInput | KnowledgeChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KnowledgeChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KnowledgeChunks
    **/
    _count?: true | KnowledgeChunkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KnowledgeChunkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KnowledgeChunkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KnowledgeChunkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KnowledgeChunkMaxAggregateInputType
  }

  export type GetKnowledgeChunkAggregateType<T extends KnowledgeChunkAggregateArgs> = {
        [P in keyof T & keyof AggregateKnowledgeChunk]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKnowledgeChunk[P]>
      : GetScalarType<T[P], AggregateKnowledgeChunk[P]>
  }




  export type KnowledgeChunkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeChunkWhereInput
    orderBy?: KnowledgeChunkOrderByWithAggregationInput | KnowledgeChunkOrderByWithAggregationInput[]
    by: KnowledgeChunkScalarFieldEnum[] | KnowledgeChunkScalarFieldEnum
    having?: KnowledgeChunkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KnowledgeChunkCountAggregateInputType | true
    _avg?: KnowledgeChunkAvgAggregateInputType
    _sum?: KnowledgeChunkSumAggregateInputType
    _min?: KnowledgeChunkMinAggregateInputType
    _max?: KnowledgeChunkMaxAggregateInputType
  }

  export type KnowledgeChunkGroupByOutputType = {
    id: string
    documentId: string
    content: string
    chunkIndex: number
    createdAt: Date
    _count: KnowledgeChunkCountAggregateOutputType | null
    _avg: KnowledgeChunkAvgAggregateOutputType | null
    _sum: KnowledgeChunkSumAggregateOutputType | null
    _min: KnowledgeChunkMinAggregateOutputType | null
    _max: KnowledgeChunkMaxAggregateOutputType | null
  }

  type GetKnowledgeChunkGroupByPayload<T extends KnowledgeChunkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KnowledgeChunkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KnowledgeChunkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KnowledgeChunkGroupByOutputType[P]>
            : GetScalarType<T[P], KnowledgeChunkGroupByOutputType[P]>
        }
      >
    >


  export type KnowledgeChunkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
    createdAt?: boolean
    document?: boolean | KnowledgeDocumentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledgeChunk"]>


  export type KnowledgeChunkSelectScalar = {
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
    createdAt?: boolean
  }

  export type KnowledgeChunkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    document?: boolean | KnowledgeDocumentDefaultArgs<ExtArgs>
  }

  export type $KnowledgeChunkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KnowledgeChunk"
    objects: {
      document: Prisma.$KnowledgeDocumentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      documentId: string
      content: string
      chunkIndex: number
      createdAt: Date
    }, ExtArgs["result"]["knowledgeChunk"]>
    composites: {}
  }

  type KnowledgeChunkGetPayload<S extends boolean | null | undefined | KnowledgeChunkDefaultArgs> = $Result.GetResult<Prisma.$KnowledgeChunkPayload, S>

  type KnowledgeChunkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<KnowledgeChunkFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KnowledgeChunkCountAggregateInputType | true
    }

  export interface KnowledgeChunkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KnowledgeChunk'], meta: { name: 'KnowledgeChunk' } }
    /**
     * Find zero or one KnowledgeChunk that matches the filter.
     * @param {KnowledgeChunkFindUniqueArgs} args - Arguments to find a KnowledgeChunk
     * @example
     * // Get one KnowledgeChunk
     * const knowledgeChunk = await prisma.knowledgeChunk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KnowledgeChunkFindUniqueArgs>(args: SelectSubset<T, KnowledgeChunkFindUniqueArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one KnowledgeChunk that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {KnowledgeChunkFindUniqueOrThrowArgs} args - Arguments to find a KnowledgeChunk
     * @example
     * // Get one KnowledgeChunk
     * const knowledgeChunk = await prisma.knowledgeChunk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KnowledgeChunkFindUniqueOrThrowArgs>(args: SelectSubset<T, KnowledgeChunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first KnowledgeChunk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkFindFirstArgs} args - Arguments to find a KnowledgeChunk
     * @example
     * // Get one KnowledgeChunk
     * const knowledgeChunk = await prisma.knowledgeChunk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KnowledgeChunkFindFirstArgs>(args?: SelectSubset<T, KnowledgeChunkFindFirstArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first KnowledgeChunk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkFindFirstOrThrowArgs} args - Arguments to find a KnowledgeChunk
     * @example
     * // Get one KnowledgeChunk
     * const knowledgeChunk = await prisma.knowledgeChunk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KnowledgeChunkFindFirstOrThrowArgs>(args?: SelectSubset<T, KnowledgeChunkFindFirstOrThrowArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more KnowledgeChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KnowledgeChunks
     * const knowledgeChunks = await prisma.knowledgeChunk.findMany()
     * 
     * // Get first 10 KnowledgeChunks
     * const knowledgeChunks = await prisma.knowledgeChunk.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const knowledgeChunkWithIdOnly = await prisma.knowledgeChunk.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KnowledgeChunkFindManyArgs>(args?: SelectSubset<T, KnowledgeChunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "findMany">>

    /**
     * Delete a KnowledgeChunk.
     * @param {KnowledgeChunkDeleteArgs} args - Arguments to delete one KnowledgeChunk.
     * @example
     * // Delete one KnowledgeChunk
     * const KnowledgeChunk = await prisma.knowledgeChunk.delete({
     *   where: {
     *     // ... filter to delete one KnowledgeChunk
     *   }
     * })
     * 
     */
    delete<T extends KnowledgeChunkDeleteArgs>(args: SelectSubset<T, KnowledgeChunkDeleteArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one KnowledgeChunk.
     * @param {KnowledgeChunkUpdateArgs} args - Arguments to update one KnowledgeChunk.
     * @example
     * // Update one KnowledgeChunk
     * const knowledgeChunk = await prisma.knowledgeChunk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KnowledgeChunkUpdateArgs>(args: SelectSubset<T, KnowledgeChunkUpdateArgs<ExtArgs>>): Prisma__KnowledgeChunkClient<$Result.GetResult<Prisma.$KnowledgeChunkPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more KnowledgeChunks.
     * @param {KnowledgeChunkDeleteManyArgs} args - Arguments to filter KnowledgeChunks to delete.
     * @example
     * // Delete a few KnowledgeChunks
     * const { count } = await prisma.knowledgeChunk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KnowledgeChunkDeleteManyArgs>(args?: SelectSubset<T, KnowledgeChunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KnowledgeChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KnowledgeChunks
     * const knowledgeChunk = await prisma.knowledgeChunk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KnowledgeChunkUpdateManyArgs>(args: SelectSubset<T, KnowledgeChunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>


    /**
     * Count the number of KnowledgeChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkCountArgs} args - Arguments to filter KnowledgeChunks to count.
     * @example
     * // Count the number of KnowledgeChunks
     * const count = await prisma.knowledgeChunk.count({
     *   where: {
     *     // ... the filter for the KnowledgeChunks we want to count
     *   }
     * })
    **/
    count<T extends KnowledgeChunkCountArgs>(
      args?: Subset<T, KnowledgeChunkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KnowledgeChunkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KnowledgeChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KnowledgeChunkAggregateArgs>(args: Subset<T, KnowledgeChunkAggregateArgs>): Prisma.PrismaPromise<GetKnowledgeChunkAggregateType<T>>

    /**
     * Group by KnowledgeChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeChunkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KnowledgeChunkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KnowledgeChunkGroupByArgs['orderBy'] }
        : { orderBy?: KnowledgeChunkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KnowledgeChunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKnowledgeChunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KnowledgeChunk model
   */
  readonly fields: KnowledgeChunkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KnowledgeChunk.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KnowledgeChunkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    document<T extends KnowledgeDocumentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, KnowledgeDocumentDefaultArgs<ExtArgs>>): Prisma__KnowledgeDocumentClient<$Result.GetResult<Prisma.$KnowledgeDocumentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KnowledgeChunk model
   */ 
  interface KnowledgeChunkFieldRefs {
    readonly id: FieldRef<"KnowledgeChunk", 'String'>
    readonly documentId: FieldRef<"KnowledgeChunk", 'String'>
    readonly content: FieldRef<"KnowledgeChunk", 'String'>
    readonly chunkIndex: FieldRef<"KnowledgeChunk", 'Int'>
    readonly createdAt: FieldRef<"KnowledgeChunk", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KnowledgeChunk findUnique
   */
  export type KnowledgeChunkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeChunk to fetch.
     */
    where: KnowledgeChunkWhereUniqueInput
  }

  /**
   * KnowledgeChunk findUniqueOrThrow
   */
  export type KnowledgeChunkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeChunk to fetch.
     */
    where: KnowledgeChunkWhereUniqueInput
  }

  /**
   * KnowledgeChunk findFirst
   */
  export type KnowledgeChunkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeChunk to fetch.
     */
    where?: KnowledgeChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeChunks to fetch.
     */
    orderBy?: KnowledgeChunkOrderByWithRelationInput | KnowledgeChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnowledgeChunks.
     */
    cursor?: KnowledgeChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnowledgeChunks.
     */
    distinct?: KnowledgeChunkScalarFieldEnum | KnowledgeChunkScalarFieldEnum[]
  }

  /**
   * KnowledgeChunk findFirstOrThrow
   */
  export type KnowledgeChunkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeChunk to fetch.
     */
    where?: KnowledgeChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeChunks to fetch.
     */
    orderBy?: KnowledgeChunkOrderByWithRelationInput | KnowledgeChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnowledgeChunks.
     */
    cursor?: KnowledgeChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnowledgeChunks.
     */
    distinct?: KnowledgeChunkScalarFieldEnum | KnowledgeChunkScalarFieldEnum[]
  }

  /**
   * KnowledgeChunk findMany
   */
  export type KnowledgeChunkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter, which KnowledgeChunks to fetch.
     */
    where?: KnowledgeChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnowledgeChunks to fetch.
     */
    orderBy?: KnowledgeChunkOrderByWithRelationInput | KnowledgeChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KnowledgeChunks.
     */
    cursor?: KnowledgeChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnowledgeChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnowledgeChunks.
     */
    skip?: number
    distinct?: KnowledgeChunkScalarFieldEnum | KnowledgeChunkScalarFieldEnum[]
  }

  /**
   * KnowledgeChunk update
   */
  export type KnowledgeChunkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * The data needed to update a KnowledgeChunk.
     */
    data: XOR<KnowledgeChunkUpdateInput, KnowledgeChunkUncheckedUpdateInput>
    /**
     * Choose, which KnowledgeChunk to update.
     */
    where: KnowledgeChunkWhereUniqueInput
  }

  /**
   * KnowledgeChunk updateMany
   */
  export type KnowledgeChunkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KnowledgeChunks.
     */
    data: XOR<KnowledgeChunkUpdateManyMutationInput, KnowledgeChunkUncheckedUpdateManyInput>
    /**
     * Filter which KnowledgeChunks to update
     */
    where?: KnowledgeChunkWhereInput
  }

  /**
   * KnowledgeChunk delete
   */
  export type KnowledgeChunkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
    /**
     * Filter which KnowledgeChunk to delete.
     */
    where: KnowledgeChunkWhereUniqueInput
  }

  /**
   * KnowledgeChunk deleteMany
   */
  export type KnowledgeChunkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnowledgeChunks to delete
     */
    where?: KnowledgeChunkWhereInput
  }

  /**
   * KnowledgeChunk without action
   */
  export type KnowledgeChunkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeChunk
     */
    select?: KnowledgeChunkSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeChunkInclude<ExtArgs> | null
  }


  /**
   * Model ChatConversation
   */

  export type AggregateChatConversation = {
    _count: ChatConversationCountAggregateOutputType | null
    _min: ChatConversationMinAggregateOutputType | null
    _max: ChatConversationMaxAggregateOutputType | null
  }

  export type ChatConversationMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChatConversationMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChatConversationCountAggregateOutputType = {
    id: number
    sessionId: number
    messages: number
    ipAddress: number
    userAgent: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChatConversationMinAggregateInputType = {
    id?: true
    sessionId?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChatConversationMaxAggregateInputType = {
    id?: true
    sessionId?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChatConversationCountAggregateInputType = {
    id?: true
    sessionId?: true
    messages?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChatConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatConversation to aggregate.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatConversations
    **/
    _count?: true | ChatConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatConversationMaxAggregateInputType
  }

  export type GetChatConversationAggregateType<T extends ChatConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateChatConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatConversation[P]>
      : GetScalarType<T[P], AggregateChatConversation[P]>
  }




  export type ChatConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatConversationWhereInput
    orderBy?: ChatConversationOrderByWithAggregationInput | ChatConversationOrderByWithAggregationInput[]
    by: ChatConversationScalarFieldEnum[] | ChatConversationScalarFieldEnum
    having?: ChatConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatConversationCountAggregateInputType | true
    _min?: ChatConversationMinAggregateInputType
    _max?: ChatConversationMaxAggregateInputType
  }

  export type ChatConversationGroupByOutputType = {
    id: string
    sessionId: string
    messages: JsonValue
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    updatedAt: Date
    _count: ChatConversationCountAggregateOutputType | null
    _min: ChatConversationMinAggregateOutputType | null
    _max: ChatConversationMaxAggregateOutputType | null
  }

  type GetChatConversationGroupByPayload<T extends ChatConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatConversationGroupByOutputType[P]>
            : GetScalarType<T[P], ChatConversationGroupByOutputType[P]>
        }
      >
    >


  export type ChatConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    messages?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatConversation"]>

  export type ChatConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    messages?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatConversation"]>

  export type ChatConversationSelectScalar = {
    id?: boolean
    sessionId?: boolean
    messages?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $ChatConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatConversation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      messages: Prisma.JsonValue
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["chatConversation"]>
    composites: {}
  }

  type ChatConversationGetPayload<S extends boolean | null | undefined | ChatConversationDefaultArgs> = $Result.GetResult<Prisma.$ChatConversationPayload, S>

  type ChatConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChatConversationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChatConversationCountAggregateInputType | true
    }

  export interface ChatConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatConversation'], meta: { name: 'ChatConversation' } }
    /**
     * Find zero or one ChatConversation that matches the filter.
     * @param {ChatConversationFindUniqueArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatConversationFindUniqueArgs>(args: SelectSubset<T, ChatConversationFindUniqueArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChatConversation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChatConversationFindUniqueOrThrowArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChatConversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindFirstArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatConversationFindFirstArgs>(args?: SelectSubset<T, ChatConversationFindFirstArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChatConversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindFirstOrThrowArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChatConversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatConversations
     * const chatConversations = await prisma.chatConversation.findMany()
     * 
     * // Get first 10 ChatConversations
     * const chatConversations = await prisma.chatConversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatConversationWithIdOnly = await prisma.chatConversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatConversationFindManyArgs>(args?: SelectSubset<T, ChatConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChatConversation.
     * @param {ChatConversationCreateArgs} args - Arguments to create a ChatConversation.
     * @example
     * // Create one ChatConversation
     * const ChatConversation = await prisma.chatConversation.create({
     *   data: {
     *     // ... data to create a ChatConversation
     *   }
     * })
     * 
     */
    create<T extends ChatConversationCreateArgs>(args: SelectSubset<T, ChatConversationCreateArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChatConversations.
     * @param {ChatConversationCreateManyArgs} args - Arguments to create many ChatConversations.
     * @example
     * // Create many ChatConversations
     * const chatConversation = await prisma.chatConversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatConversationCreateManyArgs>(args?: SelectSubset<T, ChatConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChatConversations and returns the data saved in the database.
     * @param {ChatConversationCreateManyAndReturnArgs} args - Arguments to create many ChatConversations.
     * @example
     * // Create many ChatConversations
     * const chatConversation = await prisma.chatConversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChatConversations and only return the `id`
     * const chatConversationWithIdOnly = await prisma.chatConversation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChatConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, ChatConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ChatConversation.
     * @param {ChatConversationDeleteArgs} args - Arguments to delete one ChatConversation.
     * @example
     * // Delete one ChatConversation
     * const ChatConversation = await prisma.chatConversation.delete({
     *   where: {
     *     // ... filter to delete one ChatConversation
     *   }
     * })
     * 
     */
    delete<T extends ChatConversationDeleteArgs>(args: SelectSubset<T, ChatConversationDeleteArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChatConversation.
     * @param {ChatConversationUpdateArgs} args - Arguments to update one ChatConversation.
     * @example
     * // Update one ChatConversation
     * const chatConversation = await prisma.chatConversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatConversationUpdateArgs>(args: SelectSubset<T, ChatConversationUpdateArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChatConversations.
     * @param {ChatConversationDeleteManyArgs} args - Arguments to filter ChatConversations to delete.
     * @example
     * // Delete a few ChatConversations
     * const { count } = await prisma.chatConversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatConversationDeleteManyArgs>(args?: SelectSubset<T, ChatConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatConversations
     * const chatConversation = await prisma.chatConversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatConversationUpdateManyArgs>(args: SelectSubset<T, ChatConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChatConversation.
     * @param {ChatConversationUpsertArgs} args - Arguments to update or create a ChatConversation.
     * @example
     * // Update or create a ChatConversation
     * const chatConversation = await prisma.chatConversation.upsert({
     *   create: {
     *     // ... data to create a ChatConversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatConversation we want to update
     *   }
     * })
     */
    upsert<T extends ChatConversationUpsertArgs>(args: SelectSubset<T, ChatConversationUpsertArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ChatConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationCountArgs} args - Arguments to filter ChatConversations to count.
     * @example
     * // Count the number of ChatConversations
     * const count = await prisma.chatConversation.count({
     *   where: {
     *     // ... the filter for the ChatConversations we want to count
     *   }
     * })
    **/
    count<T extends ChatConversationCountArgs>(
      args?: Subset<T, ChatConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatConversationAggregateArgs>(args: Subset<T, ChatConversationAggregateArgs>): Prisma.PrismaPromise<GetChatConversationAggregateType<T>>

    /**
     * Group by ChatConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatConversationGroupByArgs['orderBy'] }
        : { orderBy?: ChatConversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatConversation model
   */
  readonly fields: ChatConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatConversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatConversation model
   */ 
  interface ChatConversationFieldRefs {
    readonly id: FieldRef<"ChatConversation", 'String'>
    readonly sessionId: FieldRef<"ChatConversation", 'String'>
    readonly messages: FieldRef<"ChatConversation", 'Json'>
    readonly ipAddress: FieldRef<"ChatConversation", 'String'>
    readonly userAgent: FieldRef<"ChatConversation", 'String'>
    readonly createdAt: FieldRef<"ChatConversation", 'DateTime'>
    readonly updatedAt: FieldRef<"ChatConversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChatConversation findUnique
   */
  export type ChatConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation findUniqueOrThrow
   */
  export type ChatConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation findFirst
   */
  export type ChatConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatConversations.
     */
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation findFirstOrThrow
   */
  export type ChatConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatConversations.
     */
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation findMany
   */
  export type ChatConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter, which ChatConversations to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation create
   */
  export type ChatConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * The data needed to create a ChatConversation.
     */
    data: XOR<ChatConversationCreateInput, ChatConversationUncheckedCreateInput>
  }

  /**
   * ChatConversation createMany
   */
  export type ChatConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatConversations.
     */
    data: ChatConversationCreateManyInput | ChatConversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatConversation createManyAndReturn
   */
  export type ChatConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ChatConversations.
     */
    data: ChatConversationCreateManyInput | ChatConversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatConversation update
   */
  export type ChatConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * The data needed to update a ChatConversation.
     */
    data: XOR<ChatConversationUpdateInput, ChatConversationUncheckedUpdateInput>
    /**
     * Choose, which ChatConversation to update.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation updateMany
   */
  export type ChatConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatConversations.
     */
    data: XOR<ChatConversationUpdateManyMutationInput, ChatConversationUncheckedUpdateManyInput>
    /**
     * Filter which ChatConversations to update
     */
    where?: ChatConversationWhereInput
  }

  /**
   * ChatConversation upsert
   */
  export type ChatConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * The filter to search for the ChatConversation to update in case it exists.
     */
    where: ChatConversationWhereUniqueInput
    /**
     * In case the ChatConversation found by the `where` argument doesn't exist, create a new ChatConversation with this data.
     */
    create: XOR<ChatConversationCreateInput, ChatConversationUncheckedCreateInput>
    /**
     * In case the ChatConversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatConversationUpdateInput, ChatConversationUncheckedUpdateInput>
  }

  /**
   * ChatConversation delete
   */
  export type ChatConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Filter which ChatConversation to delete.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation deleteMany
   */
  export type ChatConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatConversations to delete
     */
    where?: ChatConversationWhereInput
  }

  /**
   * ChatConversation without action
   */
  export type ChatConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.UserRole | null
    fullName: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.UserRole | null
    fullName: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    role: number
    fullName: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    fullName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    fullName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    fullName?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    fullName: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    fullName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    fullName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    fullName?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      role: $Enums.UserRole
      fullName: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
  }


  /**
   * Model InterviewTemplate
   */

  export type AggregateInterviewTemplate = {
    _count: InterviewTemplateCountAggregateOutputType | null
    _avg: InterviewTemplateAvgAggregateOutputType | null
    _sum: InterviewTemplateSumAggregateOutputType | null
    _min: InterviewTemplateMinAggregateOutputType | null
    _max: InterviewTemplateMaxAggregateOutputType | null
  }

  export type InterviewTemplateAvgAggregateOutputType = {
    durationMinutes: number | null
  }

  export type InterviewTemplateSumAggregateOutputType = {
    durationMinutes: number | null
  }

  export type InterviewTemplateMinAggregateOutputType = {
    id: string | null
    ownerRole: $Enums.InterviewTemplateOwnerRole | null
    jobRole: string | null
    experienceLevel: string | null
    durationMinutes: number | null
    difficultyLevel: string | null
    interviewDescription: string | null
    systemInstructions: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewTemplateMaxAggregateOutputType = {
    id: string | null
    ownerRole: $Enums.InterviewTemplateOwnerRole | null
    jobRole: string | null
    experienceLevel: string | null
    durationMinutes: number | null
    difficultyLevel: string | null
    interviewDescription: string | null
    systemInstructions: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewTemplateCountAggregateOutputType = {
    id: number
    ownerRole: number
    jobRole: number
    experienceLevel: number
    techStack: number
    requiredSkills: number
    durationMinutes: number
    difficultyLevel: number
    advancedConfig: number
    interviewDescription: number
    systemInstructions: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InterviewTemplateAvgAggregateInputType = {
    durationMinutes?: true
  }

  export type InterviewTemplateSumAggregateInputType = {
    durationMinutes?: true
  }

  export type InterviewTemplateMinAggregateInputType = {
    id?: true
    ownerRole?: true
    jobRole?: true
    experienceLevel?: true
    durationMinutes?: true
    difficultyLevel?: true
    interviewDescription?: true
    systemInstructions?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewTemplateMaxAggregateInputType = {
    id?: true
    ownerRole?: true
    jobRole?: true
    experienceLevel?: true
    durationMinutes?: true
    difficultyLevel?: true
    interviewDescription?: true
    systemInstructions?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewTemplateCountAggregateInputType = {
    id?: true
    ownerRole?: true
    jobRole?: true
    experienceLevel?: true
    techStack?: true
    requiredSkills?: true
    durationMinutes?: true
    difficultyLevel?: true
    advancedConfig?: true
    interviewDescription?: true
    systemInstructions?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InterviewTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewTemplate to aggregate.
     */
    where?: InterviewTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewTemplates to fetch.
     */
    orderBy?: InterviewTemplateOrderByWithRelationInput | InterviewTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewTemplates
    **/
    _count?: true | InterviewTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InterviewTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InterviewTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewTemplateMaxAggregateInputType
  }

  export type GetInterviewTemplateAggregateType<T extends InterviewTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewTemplate[P]>
      : GetScalarType<T[P], AggregateInterviewTemplate[P]>
  }




  export type InterviewTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewTemplateWhereInput
    orderBy?: InterviewTemplateOrderByWithAggregationInput | InterviewTemplateOrderByWithAggregationInput[]
    by: InterviewTemplateScalarFieldEnum[] | InterviewTemplateScalarFieldEnum
    having?: InterviewTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewTemplateCountAggregateInputType | true
    _avg?: InterviewTemplateAvgAggregateInputType
    _sum?: InterviewTemplateSumAggregateInputType
    _min?: InterviewTemplateMinAggregateInputType
    _max?: InterviewTemplateMaxAggregateInputType
  }

  export type InterviewTemplateGroupByOutputType = {
    id: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack: string[]
    requiredSkills: string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig: JsonValue | null
    interviewDescription: string | null
    systemInstructions: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: InterviewTemplateCountAggregateOutputType | null
    _avg: InterviewTemplateAvgAggregateOutputType | null
    _sum: InterviewTemplateSumAggregateOutputType | null
    _min: InterviewTemplateMinAggregateOutputType | null
    _max: InterviewTemplateMaxAggregateOutputType | null
  }

  type GetInterviewTemplateGroupByPayload<T extends InterviewTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewTemplateGroupByOutputType[P]>
        }
      >
    >


  export type InterviewTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerRole?: boolean
    jobRole?: boolean
    experienceLevel?: boolean
    techStack?: boolean
    requiredSkills?: boolean
    durationMinutes?: boolean
    difficultyLevel?: boolean
    advancedConfig?: boolean
    interviewDescription?: boolean
    systemInstructions?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    applications?: boolean | InterviewTemplate$applicationsArgs<ExtArgs>
    _count?: boolean | InterviewTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewTemplate"]>

  export type InterviewTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerRole?: boolean
    jobRole?: boolean
    experienceLevel?: boolean
    techStack?: boolean
    requiredSkills?: boolean
    durationMinutes?: boolean
    difficultyLevel?: boolean
    advancedConfig?: boolean
    interviewDescription?: boolean
    systemInstructions?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewTemplate"]>

  export type InterviewTemplateSelectScalar = {
    id?: boolean
    ownerRole?: boolean
    jobRole?: boolean
    experienceLevel?: boolean
    techStack?: boolean
    requiredSkills?: boolean
    durationMinutes?: boolean
    difficultyLevel?: boolean
    advancedConfig?: boolean
    interviewDescription?: boolean
    systemInstructions?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InterviewTemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | InterviewTemplate$applicationsArgs<ExtArgs>
    _count?: boolean | InterviewTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InterviewTemplateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InterviewTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewTemplate"
    objects: {
      applications: Prisma.$CandidateApplicationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ownerRole: $Enums.InterviewTemplateOwnerRole
      jobRole: string
      experienceLevel: string
      techStack: string[]
      requiredSkills: string[]
      durationMinutes: number
      difficultyLevel: string
      advancedConfig: Prisma.JsonValue | null
      interviewDescription: string | null
      systemInstructions: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["interviewTemplate"]>
    composites: {}
  }

  type InterviewTemplateGetPayload<S extends boolean | null | undefined | InterviewTemplateDefaultArgs> = $Result.GetResult<Prisma.$InterviewTemplatePayload, S>

  type InterviewTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InterviewTemplateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InterviewTemplateCountAggregateInputType | true
    }

  export interface InterviewTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewTemplate'], meta: { name: 'InterviewTemplate' } }
    /**
     * Find zero or one InterviewTemplate that matches the filter.
     * @param {InterviewTemplateFindUniqueArgs} args - Arguments to find a InterviewTemplate
     * @example
     * // Get one InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewTemplateFindUniqueArgs>(args: SelectSubset<T, InterviewTemplateFindUniqueArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InterviewTemplate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InterviewTemplateFindUniqueOrThrowArgs} args - Arguments to find a InterviewTemplate
     * @example
     * // Get one InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InterviewTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateFindFirstArgs} args - Arguments to find a InterviewTemplate
     * @example
     * // Get one InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewTemplateFindFirstArgs>(args?: SelectSubset<T, InterviewTemplateFindFirstArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InterviewTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateFindFirstOrThrowArgs} args - Arguments to find a InterviewTemplate
     * @example
     * // Get one InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InterviewTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewTemplates
     * const interviewTemplates = await prisma.interviewTemplate.findMany()
     * 
     * // Get first 10 InterviewTemplates
     * const interviewTemplates = await prisma.interviewTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewTemplateWithIdOnly = await prisma.interviewTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewTemplateFindManyArgs>(args?: SelectSubset<T, InterviewTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InterviewTemplate.
     * @param {InterviewTemplateCreateArgs} args - Arguments to create a InterviewTemplate.
     * @example
     * // Create one InterviewTemplate
     * const InterviewTemplate = await prisma.interviewTemplate.create({
     *   data: {
     *     // ... data to create a InterviewTemplate
     *   }
     * })
     * 
     */
    create<T extends InterviewTemplateCreateArgs>(args: SelectSubset<T, InterviewTemplateCreateArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InterviewTemplates.
     * @param {InterviewTemplateCreateManyArgs} args - Arguments to create many InterviewTemplates.
     * @example
     * // Create many InterviewTemplates
     * const interviewTemplate = await prisma.interviewTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewTemplateCreateManyArgs>(args?: SelectSubset<T, InterviewTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewTemplates and returns the data saved in the database.
     * @param {InterviewTemplateCreateManyAndReturnArgs} args - Arguments to create many InterviewTemplates.
     * @example
     * // Create many InterviewTemplates
     * const interviewTemplate = await prisma.interviewTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewTemplates and only return the `id`
     * const interviewTemplateWithIdOnly = await prisma.interviewTemplate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InterviewTemplate.
     * @param {InterviewTemplateDeleteArgs} args - Arguments to delete one InterviewTemplate.
     * @example
     * // Delete one InterviewTemplate
     * const InterviewTemplate = await prisma.interviewTemplate.delete({
     *   where: {
     *     // ... filter to delete one InterviewTemplate
     *   }
     * })
     * 
     */
    delete<T extends InterviewTemplateDeleteArgs>(args: SelectSubset<T, InterviewTemplateDeleteArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InterviewTemplate.
     * @param {InterviewTemplateUpdateArgs} args - Arguments to update one InterviewTemplate.
     * @example
     * // Update one InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewTemplateUpdateArgs>(args: SelectSubset<T, InterviewTemplateUpdateArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InterviewTemplates.
     * @param {InterviewTemplateDeleteManyArgs} args - Arguments to filter InterviewTemplates to delete.
     * @example
     * // Delete a few InterviewTemplates
     * const { count } = await prisma.interviewTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewTemplateDeleteManyArgs>(args?: SelectSubset<T, InterviewTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewTemplates
     * const interviewTemplate = await prisma.interviewTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewTemplateUpdateManyArgs>(args: SelectSubset<T, InterviewTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InterviewTemplate.
     * @param {InterviewTemplateUpsertArgs} args - Arguments to update or create a InterviewTemplate.
     * @example
     * // Update or create a InterviewTemplate
     * const interviewTemplate = await prisma.interviewTemplate.upsert({
     *   create: {
     *     // ... data to create a InterviewTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewTemplate we want to update
     *   }
     * })
     */
    upsert<T extends InterviewTemplateUpsertArgs>(args: SelectSubset<T, InterviewTemplateUpsertArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InterviewTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateCountArgs} args - Arguments to filter InterviewTemplates to count.
     * @example
     * // Count the number of InterviewTemplates
     * const count = await prisma.interviewTemplate.count({
     *   where: {
     *     // ... the filter for the InterviewTemplates we want to count
     *   }
     * })
    **/
    count<T extends InterviewTemplateCountArgs>(
      args?: Subset<T, InterviewTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InterviewTemplateAggregateArgs>(args: Subset<T, InterviewTemplateAggregateArgs>): Prisma.PrismaPromise<GetInterviewTemplateAggregateType<T>>

    /**
     * Group by InterviewTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InterviewTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewTemplateGroupByArgs['orderBy'] }
        : { orderBy?: InterviewTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InterviewTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewTemplate model
   */
  readonly fields: InterviewTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    applications<T extends InterviewTemplate$applicationsArgs<ExtArgs> = {}>(args?: Subset<T, InterviewTemplate$applicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InterviewTemplate model
   */ 
  interface InterviewTemplateFieldRefs {
    readonly id: FieldRef<"InterviewTemplate", 'String'>
    readonly ownerRole: FieldRef<"InterviewTemplate", 'InterviewTemplateOwnerRole'>
    readonly jobRole: FieldRef<"InterviewTemplate", 'String'>
    readonly experienceLevel: FieldRef<"InterviewTemplate", 'String'>
    readonly techStack: FieldRef<"InterviewTemplate", 'String[]'>
    readonly requiredSkills: FieldRef<"InterviewTemplate", 'String[]'>
    readonly durationMinutes: FieldRef<"InterviewTemplate", 'Int'>
    readonly difficultyLevel: FieldRef<"InterviewTemplate", 'String'>
    readonly advancedConfig: FieldRef<"InterviewTemplate", 'Json'>
    readonly interviewDescription: FieldRef<"InterviewTemplate", 'String'>
    readonly systemInstructions: FieldRef<"InterviewTemplate", 'String'>
    readonly isActive: FieldRef<"InterviewTemplate", 'Boolean'>
    readonly createdAt: FieldRef<"InterviewTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"InterviewTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewTemplate findUnique
   */
  export type InterviewTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter, which InterviewTemplate to fetch.
     */
    where: InterviewTemplateWhereUniqueInput
  }

  /**
   * InterviewTemplate findUniqueOrThrow
   */
  export type InterviewTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter, which InterviewTemplate to fetch.
     */
    where: InterviewTemplateWhereUniqueInput
  }

  /**
   * InterviewTemplate findFirst
   */
  export type InterviewTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter, which InterviewTemplate to fetch.
     */
    where?: InterviewTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewTemplates to fetch.
     */
    orderBy?: InterviewTemplateOrderByWithRelationInput | InterviewTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewTemplates.
     */
    cursor?: InterviewTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewTemplates.
     */
    distinct?: InterviewTemplateScalarFieldEnum | InterviewTemplateScalarFieldEnum[]
  }

  /**
   * InterviewTemplate findFirstOrThrow
   */
  export type InterviewTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter, which InterviewTemplate to fetch.
     */
    where?: InterviewTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewTemplates to fetch.
     */
    orderBy?: InterviewTemplateOrderByWithRelationInput | InterviewTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewTemplates.
     */
    cursor?: InterviewTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewTemplates.
     */
    distinct?: InterviewTemplateScalarFieldEnum | InterviewTemplateScalarFieldEnum[]
  }

  /**
   * InterviewTemplate findMany
   */
  export type InterviewTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter, which InterviewTemplates to fetch.
     */
    where?: InterviewTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewTemplates to fetch.
     */
    orderBy?: InterviewTemplateOrderByWithRelationInput | InterviewTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewTemplates.
     */
    cursor?: InterviewTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewTemplates.
     */
    skip?: number
    distinct?: InterviewTemplateScalarFieldEnum | InterviewTemplateScalarFieldEnum[]
  }

  /**
   * InterviewTemplate create
   */
  export type InterviewTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewTemplate.
     */
    data: XOR<InterviewTemplateCreateInput, InterviewTemplateUncheckedCreateInput>
  }

  /**
   * InterviewTemplate createMany
   */
  export type InterviewTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewTemplates.
     */
    data: InterviewTemplateCreateManyInput | InterviewTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewTemplate createManyAndReturn
   */
  export type InterviewTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InterviewTemplates.
     */
    data: InterviewTemplateCreateManyInput | InterviewTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewTemplate update
   */
  export type InterviewTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewTemplate.
     */
    data: XOR<InterviewTemplateUpdateInput, InterviewTemplateUncheckedUpdateInput>
    /**
     * Choose, which InterviewTemplate to update.
     */
    where: InterviewTemplateWhereUniqueInput
  }

  /**
   * InterviewTemplate updateMany
   */
  export type InterviewTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewTemplates.
     */
    data: XOR<InterviewTemplateUpdateManyMutationInput, InterviewTemplateUncheckedUpdateManyInput>
    /**
     * Filter which InterviewTemplates to update
     */
    where?: InterviewTemplateWhereInput
  }

  /**
   * InterviewTemplate upsert
   */
  export type InterviewTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewTemplate to update in case it exists.
     */
    where: InterviewTemplateWhereUniqueInput
    /**
     * In case the InterviewTemplate found by the `where` argument doesn't exist, create a new InterviewTemplate with this data.
     */
    create: XOR<InterviewTemplateCreateInput, InterviewTemplateUncheckedCreateInput>
    /**
     * In case the InterviewTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewTemplateUpdateInput, InterviewTemplateUncheckedUpdateInput>
  }

  /**
   * InterviewTemplate delete
   */
  export type InterviewTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
    /**
     * Filter which InterviewTemplate to delete.
     */
    where: InterviewTemplateWhereUniqueInput
  }

  /**
   * InterviewTemplate deleteMany
   */
  export type InterviewTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewTemplates to delete
     */
    where?: InterviewTemplateWhereInput
  }

  /**
   * InterviewTemplate.applications
   */
  export type InterviewTemplate$applicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    where?: CandidateApplicationWhereInput
    orderBy?: CandidateApplicationOrderByWithRelationInput | CandidateApplicationOrderByWithRelationInput[]
    cursor?: CandidateApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CandidateApplicationScalarFieldEnum | CandidateApplicationScalarFieldEnum[]
  }

  /**
   * InterviewTemplate without action
   */
  export type InterviewTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewTemplate
     */
    select?: InterviewTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewTemplateInclude<ExtArgs> | null
  }


  /**
   * Model CandidateApplication
   */

  export type AggregateCandidateApplication = {
    _count: CandidateApplicationCountAggregateOutputType | null
    _min: CandidateApplicationMinAggregateOutputType | null
    _max: CandidateApplicationMaxAggregateOutputType | null
  }

  export type CandidateApplicationMinAggregateOutputType = {
    id: string | null
    templateId: string | null
    candidateName: string | null
    candidateEmail: string | null
    candidatePhone: string | null
    linkedInUrl: string | null
    resumeUrl: string | null
    resumeText: string | null
    interviewPreference: $Enums.CandidateInterviewPreference | null
    accessTokenHash: string | null
    accessTokenExpiresAt: Date | null
    status: $Enums.CandidateApplicationStatus | null
    scheduledAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateApplicationMaxAggregateOutputType = {
    id: string | null
    templateId: string | null
    candidateName: string | null
    candidateEmail: string | null
    candidatePhone: string | null
    linkedInUrl: string | null
    resumeUrl: string | null
    resumeText: string | null
    interviewPreference: $Enums.CandidateInterviewPreference | null
    accessTokenHash: string | null
    accessTokenExpiresAt: Date | null
    status: $Enums.CandidateApplicationStatus | null
    scheduledAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateApplicationCountAggregateOutputType = {
    id: number
    templateId: number
    candidateName: number
    candidateEmail: number
    candidatePhone: number
    linkedInUrl: number
    resumeUrl: number
    resumeText: number
    interviewPreference: number
    accessTokenHash: number
    accessTokenExpiresAt: number
    status: number
    scheduledAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CandidateApplicationMinAggregateInputType = {
    id?: true
    templateId?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    linkedInUrl?: true
    resumeUrl?: true
    resumeText?: true
    interviewPreference?: true
    accessTokenHash?: true
    accessTokenExpiresAt?: true
    status?: true
    scheduledAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateApplicationMaxAggregateInputType = {
    id?: true
    templateId?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    linkedInUrl?: true
    resumeUrl?: true
    resumeText?: true
    interviewPreference?: true
    accessTokenHash?: true
    accessTokenExpiresAt?: true
    status?: true
    scheduledAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateApplicationCountAggregateInputType = {
    id?: true
    templateId?: true
    candidateName?: true
    candidateEmail?: true
    candidatePhone?: true
    linkedInUrl?: true
    resumeUrl?: true
    resumeText?: true
    interviewPreference?: true
    accessTokenHash?: true
    accessTokenExpiresAt?: true
    status?: true
    scheduledAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CandidateApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CandidateApplication to aggregate.
     */
    where?: CandidateApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateApplications to fetch.
     */
    orderBy?: CandidateApplicationOrderByWithRelationInput | CandidateApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CandidateApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CandidateApplications
    **/
    _count?: true | CandidateApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CandidateApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CandidateApplicationMaxAggregateInputType
  }

  export type GetCandidateApplicationAggregateType<T extends CandidateApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateCandidateApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCandidateApplication[P]>
      : GetScalarType<T[P], AggregateCandidateApplication[P]>
  }




  export type CandidateApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateApplicationWhereInput
    orderBy?: CandidateApplicationOrderByWithAggregationInput | CandidateApplicationOrderByWithAggregationInput[]
    by: CandidateApplicationScalarFieldEnum[] | CandidateApplicationScalarFieldEnum
    having?: CandidateApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CandidateApplicationCountAggregateInputType | true
    _min?: CandidateApplicationMinAggregateInputType
    _max?: CandidateApplicationMaxAggregateInputType
  }

  export type CandidateApplicationGroupByOutputType = {
    id: string
    templateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone: string | null
    linkedInUrl: string | null
    resumeUrl: string | null
    resumeText: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date
    status: $Enums.CandidateApplicationStatus
    scheduledAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: CandidateApplicationCountAggregateOutputType | null
    _min: CandidateApplicationMinAggregateOutputType | null
    _max: CandidateApplicationMaxAggregateOutputType | null
  }

  type GetCandidateApplicationGroupByPayload<T extends CandidateApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CandidateApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CandidateApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CandidateApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], CandidateApplicationGroupByOutputType[P]>
        }
      >
    >


  export type CandidateApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    linkedInUrl?: boolean
    resumeUrl?: boolean
    resumeText?: boolean
    interviewPreference?: boolean
    accessTokenHash?: boolean
    accessTokenExpiresAt?: boolean
    status?: boolean
    scheduledAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    template?: boolean | InterviewTemplateDefaultArgs<ExtArgs>
    session?: boolean | CandidateApplication$sessionArgs<ExtArgs>
  }, ExtArgs["result"]["candidateApplication"]>

  export type CandidateApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    linkedInUrl?: boolean
    resumeUrl?: boolean
    resumeText?: boolean
    interviewPreference?: boolean
    accessTokenHash?: boolean
    accessTokenExpiresAt?: boolean
    status?: boolean
    scheduledAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    template?: boolean | InterviewTemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidateApplication"]>

  export type CandidateApplicationSelectScalar = {
    id?: boolean
    templateId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    candidatePhone?: boolean
    linkedInUrl?: boolean
    resumeUrl?: boolean
    resumeText?: boolean
    interviewPreference?: boolean
    accessTokenHash?: boolean
    accessTokenExpiresAt?: boolean
    status?: boolean
    scheduledAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CandidateApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | InterviewTemplateDefaultArgs<ExtArgs>
    session?: boolean | CandidateApplication$sessionArgs<ExtArgs>
  }
  export type CandidateApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | InterviewTemplateDefaultArgs<ExtArgs>
  }

  export type $CandidateApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CandidateApplication"
    objects: {
      template: Prisma.$InterviewTemplatePayload<ExtArgs>
      session: Prisma.$InterviewSessionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      templateId: string
      candidateName: string
      candidateEmail: string
      candidatePhone: string | null
      linkedInUrl: string | null
      resumeUrl: string | null
      resumeText: string | null
      interviewPreference: $Enums.CandidateInterviewPreference
      accessTokenHash: string
      accessTokenExpiresAt: Date
      status: $Enums.CandidateApplicationStatus
      scheduledAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["candidateApplication"]>
    composites: {}
  }

  type CandidateApplicationGetPayload<S extends boolean | null | undefined | CandidateApplicationDefaultArgs> = $Result.GetResult<Prisma.$CandidateApplicationPayload, S>

  type CandidateApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CandidateApplicationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CandidateApplicationCountAggregateInputType | true
    }

  export interface CandidateApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CandidateApplication'], meta: { name: 'CandidateApplication' } }
    /**
     * Find zero or one CandidateApplication that matches the filter.
     * @param {CandidateApplicationFindUniqueArgs} args - Arguments to find a CandidateApplication
     * @example
     * // Get one CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CandidateApplicationFindUniqueArgs>(args: SelectSubset<T, CandidateApplicationFindUniqueArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CandidateApplication that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CandidateApplicationFindUniqueOrThrowArgs} args - Arguments to find a CandidateApplication
     * @example
     * // Get one CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CandidateApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, CandidateApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CandidateApplication that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationFindFirstArgs} args - Arguments to find a CandidateApplication
     * @example
     * // Get one CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CandidateApplicationFindFirstArgs>(args?: SelectSubset<T, CandidateApplicationFindFirstArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CandidateApplication that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationFindFirstOrThrowArgs} args - Arguments to find a CandidateApplication
     * @example
     * // Get one CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CandidateApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, CandidateApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CandidateApplications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CandidateApplications
     * const candidateApplications = await prisma.candidateApplication.findMany()
     * 
     * // Get first 10 CandidateApplications
     * const candidateApplications = await prisma.candidateApplication.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const candidateApplicationWithIdOnly = await prisma.candidateApplication.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CandidateApplicationFindManyArgs>(args?: SelectSubset<T, CandidateApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CandidateApplication.
     * @param {CandidateApplicationCreateArgs} args - Arguments to create a CandidateApplication.
     * @example
     * // Create one CandidateApplication
     * const CandidateApplication = await prisma.candidateApplication.create({
     *   data: {
     *     // ... data to create a CandidateApplication
     *   }
     * })
     * 
     */
    create<T extends CandidateApplicationCreateArgs>(args: SelectSubset<T, CandidateApplicationCreateArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CandidateApplications.
     * @param {CandidateApplicationCreateManyArgs} args - Arguments to create many CandidateApplications.
     * @example
     * // Create many CandidateApplications
     * const candidateApplication = await prisma.candidateApplication.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CandidateApplicationCreateManyArgs>(args?: SelectSubset<T, CandidateApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CandidateApplications and returns the data saved in the database.
     * @param {CandidateApplicationCreateManyAndReturnArgs} args - Arguments to create many CandidateApplications.
     * @example
     * // Create many CandidateApplications
     * const candidateApplication = await prisma.candidateApplication.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CandidateApplications and only return the `id`
     * const candidateApplicationWithIdOnly = await prisma.candidateApplication.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CandidateApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, CandidateApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CandidateApplication.
     * @param {CandidateApplicationDeleteArgs} args - Arguments to delete one CandidateApplication.
     * @example
     * // Delete one CandidateApplication
     * const CandidateApplication = await prisma.candidateApplication.delete({
     *   where: {
     *     // ... filter to delete one CandidateApplication
     *   }
     * })
     * 
     */
    delete<T extends CandidateApplicationDeleteArgs>(args: SelectSubset<T, CandidateApplicationDeleteArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CandidateApplication.
     * @param {CandidateApplicationUpdateArgs} args - Arguments to update one CandidateApplication.
     * @example
     * // Update one CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CandidateApplicationUpdateArgs>(args: SelectSubset<T, CandidateApplicationUpdateArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CandidateApplications.
     * @param {CandidateApplicationDeleteManyArgs} args - Arguments to filter CandidateApplications to delete.
     * @example
     * // Delete a few CandidateApplications
     * const { count } = await prisma.candidateApplication.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CandidateApplicationDeleteManyArgs>(args?: SelectSubset<T, CandidateApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CandidateApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CandidateApplications
     * const candidateApplication = await prisma.candidateApplication.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CandidateApplicationUpdateManyArgs>(args: SelectSubset<T, CandidateApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CandidateApplication.
     * @param {CandidateApplicationUpsertArgs} args - Arguments to update or create a CandidateApplication.
     * @example
     * // Update or create a CandidateApplication
     * const candidateApplication = await prisma.candidateApplication.upsert({
     *   create: {
     *     // ... data to create a CandidateApplication
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CandidateApplication we want to update
     *   }
     * })
     */
    upsert<T extends CandidateApplicationUpsertArgs>(args: SelectSubset<T, CandidateApplicationUpsertArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CandidateApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationCountArgs} args - Arguments to filter CandidateApplications to count.
     * @example
     * // Count the number of CandidateApplications
     * const count = await prisma.candidateApplication.count({
     *   where: {
     *     // ... the filter for the CandidateApplications we want to count
     *   }
     * })
    **/
    count<T extends CandidateApplicationCountArgs>(
      args?: Subset<T, CandidateApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CandidateApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CandidateApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CandidateApplicationAggregateArgs>(args: Subset<T, CandidateApplicationAggregateArgs>): Prisma.PrismaPromise<GetCandidateApplicationAggregateType<T>>

    /**
     * Group by CandidateApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateApplicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CandidateApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CandidateApplicationGroupByArgs['orderBy'] }
        : { orderBy?: CandidateApplicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CandidateApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCandidateApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CandidateApplication model
   */
  readonly fields: CandidateApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CandidateApplication.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CandidateApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends InterviewTemplateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InterviewTemplateDefaultArgs<ExtArgs>>): Prisma__InterviewTemplateClient<$Result.GetResult<Prisma.$InterviewTemplatePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    session<T extends CandidateApplication$sessionArgs<ExtArgs> = {}>(args?: Subset<T, CandidateApplication$sessionArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CandidateApplication model
   */ 
  interface CandidateApplicationFieldRefs {
    readonly id: FieldRef<"CandidateApplication", 'String'>
    readonly templateId: FieldRef<"CandidateApplication", 'String'>
    readonly candidateName: FieldRef<"CandidateApplication", 'String'>
    readonly candidateEmail: FieldRef<"CandidateApplication", 'String'>
    readonly candidatePhone: FieldRef<"CandidateApplication", 'String'>
    readonly linkedInUrl: FieldRef<"CandidateApplication", 'String'>
    readonly resumeUrl: FieldRef<"CandidateApplication", 'String'>
    readonly resumeText: FieldRef<"CandidateApplication", 'String'>
    readonly interviewPreference: FieldRef<"CandidateApplication", 'CandidateInterviewPreference'>
    readonly accessTokenHash: FieldRef<"CandidateApplication", 'String'>
    readonly accessTokenExpiresAt: FieldRef<"CandidateApplication", 'DateTime'>
    readonly status: FieldRef<"CandidateApplication", 'CandidateApplicationStatus'>
    readonly scheduledAt: FieldRef<"CandidateApplication", 'DateTime'>
    readonly createdAt: FieldRef<"CandidateApplication", 'DateTime'>
    readonly updatedAt: FieldRef<"CandidateApplication", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CandidateApplication findUnique
   */
  export type CandidateApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter, which CandidateApplication to fetch.
     */
    where: CandidateApplicationWhereUniqueInput
  }

  /**
   * CandidateApplication findUniqueOrThrow
   */
  export type CandidateApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter, which CandidateApplication to fetch.
     */
    where: CandidateApplicationWhereUniqueInput
  }

  /**
   * CandidateApplication findFirst
   */
  export type CandidateApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter, which CandidateApplication to fetch.
     */
    where?: CandidateApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateApplications to fetch.
     */
    orderBy?: CandidateApplicationOrderByWithRelationInput | CandidateApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CandidateApplications.
     */
    cursor?: CandidateApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CandidateApplications.
     */
    distinct?: CandidateApplicationScalarFieldEnum | CandidateApplicationScalarFieldEnum[]
  }

  /**
   * CandidateApplication findFirstOrThrow
   */
  export type CandidateApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter, which CandidateApplication to fetch.
     */
    where?: CandidateApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateApplications to fetch.
     */
    orderBy?: CandidateApplicationOrderByWithRelationInput | CandidateApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CandidateApplications.
     */
    cursor?: CandidateApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CandidateApplications.
     */
    distinct?: CandidateApplicationScalarFieldEnum | CandidateApplicationScalarFieldEnum[]
  }

  /**
   * CandidateApplication findMany
   */
  export type CandidateApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter, which CandidateApplications to fetch.
     */
    where?: CandidateApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateApplications to fetch.
     */
    orderBy?: CandidateApplicationOrderByWithRelationInput | CandidateApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CandidateApplications.
     */
    cursor?: CandidateApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateApplications.
     */
    skip?: number
    distinct?: CandidateApplicationScalarFieldEnum | CandidateApplicationScalarFieldEnum[]
  }

  /**
   * CandidateApplication create
   */
  export type CandidateApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a CandidateApplication.
     */
    data: XOR<CandidateApplicationCreateInput, CandidateApplicationUncheckedCreateInput>
  }

  /**
   * CandidateApplication createMany
   */
  export type CandidateApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CandidateApplications.
     */
    data: CandidateApplicationCreateManyInput | CandidateApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CandidateApplication createManyAndReturn
   */
  export type CandidateApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CandidateApplications.
     */
    data: CandidateApplicationCreateManyInput | CandidateApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CandidateApplication update
   */
  export type CandidateApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a CandidateApplication.
     */
    data: XOR<CandidateApplicationUpdateInput, CandidateApplicationUncheckedUpdateInput>
    /**
     * Choose, which CandidateApplication to update.
     */
    where: CandidateApplicationWhereUniqueInput
  }

  /**
   * CandidateApplication updateMany
   */
  export type CandidateApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CandidateApplications.
     */
    data: XOR<CandidateApplicationUpdateManyMutationInput, CandidateApplicationUncheckedUpdateManyInput>
    /**
     * Filter which CandidateApplications to update
     */
    where?: CandidateApplicationWhereInput
  }

  /**
   * CandidateApplication upsert
   */
  export type CandidateApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the CandidateApplication to update in case it exists.
     */
    where: CandidateApplicationWhereUniqueInput
    /**
     * In case the CandidateApplication found by the `where` argument doesn't exist, create a new CandidateApplication with this data.
     */
    create: XOR<CandidateApplicationCreateInput, CandidateApplicationUncheckedCreateInput>
    /**
     * In case the CandidateApplication was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CandidateApplicationUpdateInput, CandidateApplicationUncheckedUpdateInput>
  }

  /**
   * CandidateApplication delete
   */
  export type CandidateApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
    /**
     * Filter which CandidateApplication to delete.
     */
    where: CandidateApplicationWhereUniqueInput
  }

  /**
   * CandidateApplication deleteMany
   */
  export type CandidateApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CandidateApplications to delete
     */
    where?: CandidateApplicationWhereInput
  }

  /**
   * CandidateApplication.session
   */
  export type CandidateApplication$sessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    where?: InterviewSessionWhereInput
  }

  /**
   * CandidateApplication without action
   */
  export type CandidateApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateApplication
     */
    select?: CandidateApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateApplicationInclude<ExtArgs> | null
  }


  /**
   * Model InterviewSession
   */

  export type AggregateInterviewSession = {
    _count: InterviewSessionCountAggregateOutputType | null
    _min: InterviewSessionMinAggregateOutputType | null
    _max: InterviewSessionMaxAggregateOutputType | null
  }

  export type InterviewSessionMinAggregateOutputType = {
    id: string | null
    applicationId: string | null
    provider: string | null
    modelUsed: string | null
    status: $Enums.InterviewSessionStatus | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewSessionMaxAggregateOutputType = {
    id: string | null
    applicationId: string | null
    provider: string | null
    modelUsed: string | null
    status: $Enums.InterviewSessionStatus | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewSessionCountAggregateOutputType = {
    id: number
    applicationId: number
    provider: number
    modelUsed: number
    status: number
    transcript: number
    evaluationEvents: number
    finalReport: number
    referenceCards: number
    startedAt: number
    completedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InterviewSessionMinAggregateInputType = {
    id?: true
    applicationId?: true
    provider?: true
    modelUsed?: true
    status?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewSessionMaxAggregateInputType = {
    id?: true
    applicationId?: true
    provider?: true
    modelUsed?: true
    status?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewSessionCountAggregateInputType = {
    id?: true
    applicationId?: true
    provider?: true
    modelUsed?: true
    status?: true
    transcript?: true
    evaluationEvents?: true
    finalReport?: true
    referenceCards?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InterviewSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewSession to aggregate.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewSessions
    **/
    _count?: true | InterviewSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewSessionMaxAggregateInputType
  }

  export type GetInterviewSessionAggregateType<T extends InterviewSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewSession[P]>
      : GetScalarType<T[P], AggregateInterviewSession[P]>
  }




  export type InterviewSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewSessionWhereInput
    orderBy?: InterviewSessionOrderByWithAggregationInput | InterviewSessionOrderByWithAggregationInput[]
    by: InterviewSessionScalarFieldEnum[] | InterviewSessionScalarFieldEnum
    having?: InterviewSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewSessionCountAggregateInputType | true
    _min?: InterviewSessionMinAggregateInputType
    _max?: InterviewSessionMaxAggregateInputType
  }

  export type InterviewSessionGroupByOutputType = {
    id: string
    applicationId: string
    provider: string
    modelUsed: string | null
    status: $Enums.InterviewSessionStatus
    transcript: JsonValue
    evaluationEvents: JsonValue
    finalReport: JsonValue | null
    referenceCards: JsonValue
    startedAt: Date
    completedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: InterviewSessionCountAggregateOutputType | null
    _min: InterviewSessionMinAggregateOutputType | null
    _max: InterviewSessionMaxAggregateOutputType | null
  }

  type GetInterviewSessionGroupByPayload<T extends InterviewSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewSessionGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewSessionGroupByOutputType[P]>
        }
      >
    >


  export type InterviewSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicationId?: boolean
    provider?: boolean
    modelUsed?: boolean
    status?: boolean
    transcript?: boolean
    evaluationEvents?: boolean
    finalReport?: boolean
    referenceCards?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    application?: boolean | CandidateApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewSession"]>

  export type InterviewSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicationId?: boolean
    provider?: boolean
    modelUsed?: boolean
    status?: boolean
    transcript?: boolean
    evaluationEvents?: boolean
    finalReport?: boolean
    referenceCards?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    application?: boolean | CandidateApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewSession"]>

  export type InterviewSessionSelectScalar = {
    id?: boolean
    applicationId?: boolean
    provider?: boolean
    modelUsed?: boolean
    status?: boolean
    transcript?: boolean
    evaluationEvents?: boolean
    finalReport?: boolean
    referenceCards?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InterviewSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | CandidateApplicationDefaultArgs<ExtArgs>
  }
  export type InterviewSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | CandidateApplicationDefaultArgs<ExtArgs>
  }

  export type $InterviewSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewSession"
    objects: {
      application: Prisma.$CandidateApplicationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      applicationId: string
      provider: string
      modelUsed: string | null
      status: $Enums.InterviewSessionStatus
      transcript: Prisma.JsonValue
      evaluationEvents: Prisma.JsonValue
      finalReport: Prisma.JsonValue | null
      referenceCards: Prisma.JsonValue
      startedAt: Date
      completedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["interviewSession"]>
    composites: {}
  }

  type InterviewSessionGetPayload<S extends boolean | null | undefined | InterviewSessionDefaultArgs> = $Result.GetResult<Prisma.$InterviewSessionPayload, S>

  type InterviewSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InterviewSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InterviewSessionCountAggregateInputType | true
    }

  export interface InterviewSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewSession'], meta: { name: 'InterviewSession' } }
    /**
     * Find zero or one InterviewSession that matches the filter.
     * @param {InterviewSessionFindUniqueArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewSessionFindUniqueArgs>(args: SelectSubset<T, InterviewSessionFindUniqueArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InterviewSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InterviewSessionFindUniqueOrThrowArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InterviewSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindFirstArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewSessionFindFirstArgs>(args?: SelectSubset<T, InterviewSessionFindFirstArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InterviewSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindFirstOrThrowArgs} args - Arguments to find a InterviewSession
     * @example
     * // Get one InterviewSession
     * const interviewSession = await prisma.interviewSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InterviewSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewSessions
     * const interviewSessions = await prisma.interviewSession.findMany()
     * 
     * // Get first 10 InterviewSessions
     * const interviewSessions = await prisma.interviewSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewSessionWithIdOnly = await prisma.interviewSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewSessionFindManyArgs>(args?: SelectSubset<T, InterviewSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InterviewSession.
     * @param {InterviewSessionCreateArgs} args - Arguments to create a InterviewSession.
     * @example
     * // Create one InterviewSession
     * const InterviewSession = await prisma.interviewSession.create({
     *   data: {
     *     // ... data to create a InterviewSession
     *   }
     * })
     * 
     */
    create<T extends InterviewSessionCreateArgs>(args: SelectSubset<T, InterviewSessionCreateArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InterviewSessions.
     * @param {InterviewSessionCreateManyArgs} args - Arguments to create many InterviewSessions.
     * @example
     * // Create many InterviewSessions
     * const interviewSession = await prisma.interviewSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewSessionCreateManyArgs>(args?: SelectSubset<T, InterviewSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewSessions and returns the data saved in the database.
     * @param {InterviewSessionCreateManyAndReturnArgs} args - Arguments to create many InterviewSessions.
     * @example
     * // Create many InterviewSessions
     * const interviewSession = await prisma.interviewSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewSessions and only return the `id`
     * const interviewSessionWithIdOnly = await prisma.interviewSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InterviewSession.
     * @param {InterviewSessionDeleteArgs} args - Arguments to delete one InterviewSession.
     * @example
     * // Delete one InterviewSession
     * const InterviewSession = await prisma.interviewSession.delete({
     *   where: {
     *     // ... filter to delete one InterviewSession
     *   }
     * })
     * 
     */
    delete<T extends InterviewSessionDeleteArgs>(args: SelectSubset<T, InterviewSessionDeleteArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InterviewSession.
     * @param {InterviewSessionUpdateArgs} args - Arguments to update one InterviewSession.
     * @example
     * // Update one InterviewSession
     * const interviewSession = await prisma.interviewSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewSessionUpdateArgs>(args: SelectSubset<T, InterviewSessionUpdateArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InterviewSessions.
     * @param {InterviewSessionDeleteManyArgs} args - Arguments to filter InterviewSessions to delete.
     * @example
     * // Delete a few InterviewSessions
     * const { count } = await prisma.interviewSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewSessionDeleteManyArgs>(args?: SelectSubset<T, InterviewSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewSessions
     * const interviewSession = await prisma.interviewSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewSessionUpdateManyArgs>(args: SelectSubset<T, InterviewSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InterviewSession.
     * @param {InterviewSessionUpsertArgs} args - Arguments to update or create a InterviewSession.
     * @example
     * // Update or create a InterviewSession
     * const interviewSession = await prisma.interviewSession.upsert({
     *   create: {
     *     // ... data to create a InterviewSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewSession we want to update
     *   }
     * })
     */
    upsert<T extends InterviewSessionUpsertArgs>(args: SelectSubset<T, InterviewSessionUpsertArgs<ExtArgs>>): Prisma__InterviewSessionClient<$Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InterviewSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionCountArgs} args - Arguments to filter InterviewSessions to count.
     * @example
     * // Count the number of InterviewSessions
     * const count = await prisma.interviewSession.count({
     *   where: {
     *     // ... the filter for the InterviewSessions we want to count
     *   }
     * })
    **/
    count<T extends InterviewSessionCountArgs>(
      args?: Subset<T, InterviewSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InterviewSessionAggregateArgs>(args: Subset<T, InterviewSessionAggregateArgs>): Prisma.PrismaPromise<GetInterviewSessionAggregateType<T>>

    /**
     * Group by InterviewSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InterviewSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewSessionGroupByArgs['orderBy'] }
        : { orderBy?: InterviewSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InterviewSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewSession model
   */
  readonly fields: InterviewSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    application<T extends CandidateApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CandidateApplicationDefaultArgs<ExtArgs>>): Prisma__CandidateApplicationClient<$Result.GetResult<Prisma.$CandidateApplicationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InterviewSession model
   */ 
  interface InterviewSessionFieldRefs {
    readonly id: FieldRef<"InterviewSession", 'String'>
    readonly applicationId: FieldRef<"InterviewSession", 'String'>
    readonly provider: FieldRef<"InterviewSession", 'String'>
    readonly modelUsed: FieldRef<"InterviewSession", 'String'>
    readonly status: FieldRef<"InterviewSession", 'InterviewSessionStatus'>
    readonly transcript: FieldRef<"InterviewSession", 'Json'>
    readonly evaluationEvents: FieldRef<"InterviewSession", 'Json'>
    readonly finalReport: FieldRef<"InterviewSession", 'Json'>
    readonly referenceCards: FieldRef<"InterviewSession", 'Json'>
    readonly startedAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly completedAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly createdAt: FieldRef<"InterviewSession", 'DateTime'>
    readonly updatedAt: FieldRef<"InterviewSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewSession findUnique
   */
  export type InterviewSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession findUniqueOrThrow
   */
  export type InterviewSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession findFirst
   */
  export type InterviewSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewSessions.
     */
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession findFirstOrThrow
   */
  export type InterviewSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSession to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewSessions.
     */
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession findMany
   */
  export type InterviewSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter, which InterviewSessions to fetch.
     */
    where?: InterviewSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewSessions to fetch.
     */
    orderBy?: InterviewSessionOrderByWithRelationInput | InterviewSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewSessions.
     */
    cursor?: InterviewSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewSessions.
     */
    skip?: number
    distinct?: InterviewSessionScalarFieldEnum | InterviewSessionScalarFieldEnum[]
  }

  /**
   * InterviewSession create
   */
  export type InterviewSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewSession.
     */
    data: XOR<InterviewSessionCreateInput, InterviewSessionUncheckedCreateInput>
  }

  /**
   * InterviewSession createMany
   */
  export type InterviewSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewSessions.
     */
    data: InterviewSessionCreateManyInput | InterviewSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewSession createManyAndReturn
   */
  export type InterviewSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InterviewSessions.
     */
    data: InterviewSessionCreateManyInput | InterviewSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewSession update
   */
  export type InterviewSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewSession.
     */
    data: XOR<InterviewSessionUpdateInput, InterviewSessionUncheckedUpdateInput>
    /**
     * Choose, which InterviewSession to update.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession updateMany
   */
  export type InterviewSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewSessions.
     */
    data: XOR<InterviewSessionUpdateManyMutationInput, InterviewSessionUncheckedUpdateManyInput>
    /**
     * Filter which InterviewSessions to update
     */
    where?: InterviewSessionWhereInput
  }

  /**
   * InterviewSession upsert
   */
  export type InterviewSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewSession to update in case it exists.
     */
    where: InterviewSessionWhereUniqueInput
    /**
     * In case the InterviewSession found by the `where` argument doesn't exist, create a new InterviewSession with this data.
     */
    create: XOR<InterviewSessionCreateInput, InterviewSessionUncheckedCreateInput>
    /**
     * In case the InterviewSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewSessionUpdateInput, InterviewSessionUncheckedUpdateInput>
  }

  /**
   * InterviewSession delete
   */
  export type InterviewSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
    /**
     * Filter which InterviewSession to delete.
     */
    where: InterviewSessionWhereUniqueInput
  }

  /**
   * InterviewSession deleteMany
   */
  export type InterviewSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewSessions to delete
     */
    where?: InterviewSessionWhereInput
  }

  /**
   * InterviewSession without action
   */
  export type InterviewSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewSession
     */
    select?: InterviewSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewSessionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ContactSubmissionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    company: 'company',
    subject: 'subject',
    message: 'message',
    sourcePath: 'sourcePath',
    referrer: 'referrer',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    browser: 'browser',
    os: 'os',
    deviceType: 'deviceType',
    country: 'country',
    region: 'region',
    city: 'city',
    createdAt: 'createdAt'
  };

  export type ContactSubmissionScalarFieldEnum = (typeof ContactSubmissionScalarFieldEnum)[keyof typeof ContactSubmissionScalarFieldEnum]


  export const JobSeekerSubmissionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    location: 'location',
    description: 'description',
    resumeUrl: 'resumeUrl',
    resumeFileName: 'resumeFileName',
    sourcePath: 'sourcePath',
    referrer: 'referrer',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    browser: 'browser',
    os: 'os',
    deviceType: 'deviceType',
    country: 'country',
    region: 'region',
    city: 'city',
    createdAt: 'createdAt'
  };

  export type JobSeekerSubmissionScalarFieldEnum = (typeof JobSeekerSubmissionScalarFieldEnum)[keyof typeof JobSeekerSubmissionScalarFieldEnum]


  export const PurchaseScalarFieldEnum: {
    id: 'id',
    candidateName: 'candidateName',
    candidateEmail: 'candidateEmail',
    candidatePhone: 'candidatePhone',
    serviceName: 'serviceName',
    amount: 'amount',
    currency: 'currency',
    stripePaymentIntentId: 'stripePaymentIntentId',
    status: 'status',
    country: 'country',
    mockInterviewStatus: 'mockInterviewStatus',
    mockInterviewDate: 'mockInterviewDate',
    deliveryStatus: 'deliveryStatus',
    deliveryDeadline: 'deliveryDeadline',
    completionNotes: 'completionNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PurchaseScalarFieldEnum = (typeof PurchaseScalarFieldEnum)[keyof typeof PurchaseScalarFieldEnum]


  export const FunnelEventScalarFieldEnum: {
    id: 'id',
    serviceName: 'serviceName',
    eventType: 'eventType',
    createdAt: 'createdAt'
  };

  export type FunnelEventScalarFieldEnum = (typeof FunnelEventScalarFieldEnum)[keyof typeof FunnelEventScalarFieldEnum]


  export const KnowledgeDocumentScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    sourceType: 'sourceType',
    fileName: 'fileName',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type KnowledgeDocumentScalarFieldEnum = (typeof KnowledgeDocumentScalarFieldEnum)[keyof typeof KnowledgeDocumentScalarFieldEnum]


  export const KnowledgeChunkScalarFieldEnum: {
    id: 'id',
    documentId: 'documentId',
    content: 'content',
    chunkIndex: 'chunkIndex',
    createdAt: 'createdAt'
  };

  export type KnowledgeChunkScalarFieldEnum = (typeof KnowledgeChunkScalarFieldEnum)[keyof typeof KnowledgeChunkScalarFieldEnum]


  export const ChatConversationScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    messages: 'messages',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChatConversationScalarFieldEnum = (typeof ChatConversationScalarFieldEnum)[keyof typeof ChatConversationScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    role: 'role',
    fullName: 'fullName',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const InterviewTemplateScalarFieldEnum: {
    id: 'id',
    ownerRole: 'ownerRole',
    jobRole: 'jobRole',
    experienceLevel: 'experienceLevel',
    techStack: 'techStack',
    requiredSkills: 'requiredSkills',
    durationMinutes: 'durationMinutes',
    difficultyLevel: 'difficultyLevel',
    advancedConfig: 'advancedConfig',
    interviewDescription: 'interviewDescription',
    systemInstructions: 'systemInstructions',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InterviewTemplateScalarFieldEnum = (typeof InterviewTemplateScalarFieldEnum)[keyof typeof InterviewTemplateScalarFieldEnum]


  export const CandidateApplicationScalarFieldEnum: {
    id: 'id',
    templateId: 'templateId',
    candidateName: 'candidateName',
    candidateEmail: 'candidateEmail',
    candidatePhone: 'candidatePhone',
    linkedInUrl: 'linkedInUrl',
    resumeUrl: 'resumeUrl',
    resumeText: 'resumeText',
    interviewPreference: 'interviewPreference',
    accessTokenHash: 'accessTokenHash',
    accessTokenExpiresAt: 'accessTokenExpiresAt',
    status: 'status',
    scheduledAt: 'scheduledAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CandidateApplicationScalarFieldEnum = (typeof CandidateApplicationScalarFieldEnum)[keyof typeof CandidateApplicationScalarFieldEnum]


  export const InterviewSessionScalarFieldEnum: {
    id: 'id',
    applicationId: 'applicationId',
    provider: 'provider',
    modelUsed: 'modelUsed',
    status: 'status',
    transcript: 'transcript',
    evaluationEvents: 'evaluationEvents',
    finalReport: 'finalReport',
    referenceCards: 'referenceCards',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InterviewSessionScalarFieldEnum = (typeof InterviewSessionScalarFieldEnum)[keyof typeof InterviewSessionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'InterviewTemplateOwnerRole'
   */
  export type EnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewTemplateOwnerRole'>
    


  /**
   * Reference to a field of type 'InterviewTemplateOwnerRole[]'
   */
  export type ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewTemplateOwnerRole[]'>
    


  /**
   * Reference to a field of type 'CandidateInterviewPreference'
   */
  export type EnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CandidateInterviewPreference'>
    


  /**
   * Reference to a field of type 'CandidateInterviewPreference[]'
   */
  export type ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CandidateInterviewPreference[]'>
    


  /**
   * Reference to a field of type 'CandidateApplicationStatus'
   */
  export type EnumCandidateApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CandidateApplicationStatus'>
    


  /**
   * Reference to a field of type 'CandidateApplicationStatus[]'
   */
  export type ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CandidateApplicationStatus[]'>
    


  /**
   * Reference to a field of type 'InterviewSessionStatus'
   */
  export type EnumInterviewSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewSessionStatus'>
    


  /**
   * Reference to a field of type 'InterviewSessionStatus[]'
   */
  export type ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewSessionStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type ContactSubmissionWhereInput = {
    AND?: ContactSubmissionWhereInput | ContactSubmissionWhereInput[]
    OR?: ContactSubmissionWhereInput[]
    NOT?: ContactSubmissionWhereInput | ContactSubmissionWhereInput[]
    id?: StringFilter<"ContactSubmission"> | string
    name?: StringFilter<"ContactSubmission"> | string
    email?: StringFilter<"ContactSubmission"> | string
    phone?: StringNullableFilter<"ContactSubmission"> | string | null
    company?: StringNullableFilter<"ContactSubmission"> | string | null
    subject?: StringNullableFilter<"ContactSubmission"> | string | null
    message?: StringFilter<"ContactSubmission"> | string
    sourcePath?: StringNullableFilter<"ContactSubmission"> | string | null
    referrer?: StringNullableFilter<"ContactSubmission"> | string | null
    ipAddress?: StringNullableFilter<"ContactSubmission"> | string | null
    userAgent?: StringNullableFilter<"ContactSubmission"> | string | null
    browser?: StringNullableFilter<"ContactSubmission"> | string | null
    os?: StringNullableFilter<"ContactSubmission"> | string | null
    deviceType?: StringNullableFilter<"ContactSubmission"> | string | null
    country?: StringNullableFilter<"ContactSubmission"> | string | null
    region?: StringNullableFilter<"ContactSubmission"> | string | null
    city?: StringNullableFilter<"ContactSubmission"> | string | null
    createdAt?: DateTimeFilter<"ContactSubmission"> | Date | string
  }

  export type ContactSubmissionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    subject?: SortOrderInput | SortOrder
    message?: SortOrder
    sourcePath?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ContactSubmissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ContactSubmissionWhereInput | ContactSubmissionWhereInput[]
    OR?: ContactSubmissionWhereInput[]
    NOT?: ContactSubmissionWhereInput | ContactSubmissionWhereInput[]
    name?: StringFilter<"ContactSubmission"> | string
    email?: StringFilter<"ContactSubmission"> | string
    phone?: StringNullableFilter<"ContactSubmission"> | string | null
    company?: StringNullableFilter<"ContactSubmission"> | string | null
    subject?: StringNullableFilter<"ContactSubmission"> | string | null
    message?: StringFilter<"ContactSubmission"> | string
    sourcePath?: StringNullableFilter<"ContactSubmission"> | string | null
    referrer?: StringNullableFilter<"ContactSubmission"> | string | null
    ipAddress?: StringNullableFilter<"ContactSubmission"> | string | null
    userAgent?: StringNullableFilter<"ContactSubmission"> | string | null
    browser?: StringNullableFilter<"ContactSubmission"> | string | null
    os?: StringNullableFilter<"ContactSubmission"> | string | null
    deviceType?: StringNullableFilter<"ContactSubmission"> | string | null
    country?: StringNullableFilter<"ContactSubmission"> | string | null
    region?: StringNullableFilter<"ContactSubmission"> | string | null
    city?: StringNullableFilter<"ContactSubmission"> | string | null
    createdAt?: DateTimeFilter<"ContactSubmission"> | Date | string
  }, "id">

  export type ContactSubmissionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    subject?: SortOrderInput | SortOrder
    message?: SortOrder
    sourcePath?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ContactSubmissionCountOrderByAggregateInput
    _max?: ContactSubmissionMaxOrderByAggregateInput
    _min?: ContactSubmissionMinOrderByAggregateInput
  }

  export type ContactSubmissionScalarWhereWithAggregatesInput = {
    AND?: ContactSubmissionScalarWhereWithAggregatesInput | ContactSubmissionScalarWhereWithAggregatesInput[]
    OR?: ContactSubmissionScalarWhereWithAggregatesInput[]
    NOT?: ContactSubmissionScalarWhereWithAggregatesInput | ContactSubmissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ContactSubmission"> | string
    name?: StringWithAggregatesFilter<"ContactSubmission"> | string
    email?: StringWithAggregatesFilter<"ContactSubmission"> | string
    phone?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    company?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    subject?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    message?: StringWithAggregatesFilter<"ContactSubmission"> | string
    sourcePath?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    referrer?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    browser?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    os?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    country?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    region?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    city?: StringNullableWithAggregatesFilter<"ContactSubmission"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ContactSubmission"> | Date | string
  }

  export type JobSeekerSubmissionWhereInput = {
    AND?: JobSeekerSubmissionWhereInput | JobSeekerSubmissionWhereInput[]
    OR?: JobSeekerSubmissionWhereInput[]
    NOT?: JobSeekerSubmissionWhereInput | JobSeekerSubmissionWhereInput[]
    id?: StringFilter<"JobSeekerSubmission"> | string
    name?: StringFilter<"JobSeekerSubmission"> | string
    email?: StringFilter<"JobSeekerSubmission"> | string
    phone?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    location?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    description?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    resumeUrl?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    resumeFileName?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    sourcePath?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    referrer?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    ipAddress?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    userAgent?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    browser?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    os?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    deviceType?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    country?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    region?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    city?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    createdAt?: DateTimeFilter<"JobSeekerSubmission"> | Date | string
  }

  export type JobSeekerSubmissionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    resumeFileName?: SortOrderInput | SortOrder
    sourcePath?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type JobSeekerSubmissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JobSeekerSubmissionWhereInput | JobSeekerSubmissionWhereInput[]
    OR?: JobSeekerSubmissionWhereInput[]
    NOT?: JobSeekerSubmissionWhereInput | JobSeekerSubmissionWhereInput[]
    name?: StringFilter<"JobSeekerSubmission"> | string
    email?: StringFilter<"JobSeekerSubmission"> | string
    phone?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    location?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    description?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    resumeUrl?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    resumeFileName?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    sourcePath?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    referrer?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    ipAddress?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    userAgent?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    browser?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    os?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    deviceType?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    country?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    region?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    city?: StringNullableFilter<"JobSeekerSubmission"> | string | null
    createdAt?: DateTimeFilter<"JobSeekerSubmission"> | Date | string
  }, "id">

  export type JobSeekerSubmissionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    resumeFileName?: SortOrderInput | SortOrder
    sourcePath?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: JobSeekerSubmissionCountOrderByAggregateInput
    _max?: JobSeekerSubmissionMaxOrderByAggregateInput
    _min?: JobSeekerSubmissionMinOrderByAggregateInput
  }

  export type JobSeekerSubmissionScalarWhereWithAggregatesInput = {
    AND?: JobSeekerSubmissionScalarWhereWithAggregatesInput | JobSeekerSubmissionScalarWhereWithAggregatesInput[]
    OR?: JobSeekerSubmissionScalarWhereWithAggregatesInput[]
    NOT?: JobSeekerSubmissionScalarWhereWithAggregatesInput | JobSeekerSubmissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"JobSeekerSubmission"> | string
    name?: StringWithAggregatesFilter<"JobSeekerSubmission"> | string
    email?: StringWithAggregatesFilter<"JobSeekerSubmission"> | string
    phone?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    location?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    description?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    resumeUrl?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    resumeFileName?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    sourcePath?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    referrer?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    browser?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    os?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    country?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    region?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    city?: StringNullableWithAggregatesFilter<"JobSeekerSubmission"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"JobSeekerSubmission"> | Date | string
  }

  export type PurchaseWhereInput = {
    AND?: PurchaseWhereInput | PurchaseWhereInput[]
    OR?: PurchaseWhereInput[]
    NOT?: PurchaseWhereInput | PurchaseWhereInput[]
    id?: StringFilter<"Purchase"> | string
    candidateName?: StringFilter<"Purchase"> | string
    candidateEmail?: StringFilter<"Purchase"> | string
    candidatePhone?: StringNullableFilter<"Purchase"> | string | null
    serviceName?: StringFilter<"Purchase"> | string
    amount?: FloatFilter<"Purchase"> | number
    currency?: StringFilter<"Purchase"> | string
    stripePaymentIntentId?: StringFilter<"Purchase"> | string
    status?: StringFilter<"Purchase"> | string
    country?: StringNullableFilter<"Purchase"> | string | null
    mockInterviewStatus?: StringNullableFilter<"Purchase"> | string | null
    mockInterviewDate?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    deliveryStatus?: StringFilter<"Purchase"> | string
    deliveryDeadline?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    completionNotes?: StringNullableFilter<"Purchase"> | string | null
    createdAt?: DateTimeFilter<"Purchase"> | Date | string
    updatedAt?: DateTimeFilter<"Purchase"> | Date | string
  }

  export type PurchaseOrderByWithRelationInput = {
    id?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrderInput | SortOrder
    serviceName?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    stripePaymentIntentId?: SortOrder
    status?: SortOrder
    country?: SortOrderInput | SortOrder
    mockInterviewStatus?: SortOrderInput | SortOrder
    mockInterviewDate?: SortOrderInput | SortOrder
    deliveryStatus?: SortOrder
    deliveryDeadline?: SortOrderInput | SortOrder
    completionNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    stripePaymentIntentId?: string
    AND?: PurchaseWhereInput | PurchaseWhereInput[]
    OR?: PurchaseWhereInput[]
    NOT?: PurchaseWhereInput | PurchaseWhereInput[]
    candidateName?: StringFilter<"Purchase"> | string
    candidateEmail?: StringFilter<"Purchase"> | string
    candidatePhone?: StringNullableFilter<"Purchase"> | string | null
    serviceName?: StringFilter<"Purchase"> | string
    amount?: FloatFilter<"Purchase"> | number
    currency?: StringFilter<"Purchase"> | string
    status?: StringFilter<"Purchase"> | string
    country?: StringNullableFilter<"Purchase"> | string | null
    mockInterviewStatus?: StringNullableFilter<"Purchase"> | string | null
    mockInterviewDate?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    deliveryStatus?: StringFilter<"Purchase"> | string
    deliveryDeadline?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    completionNotes?: StringNullableFilter<"Purchase"> | string | null
    createdAt?: DateTimeFilter<"Purchase"> | Date | string
    updatedAt?: DateTimeFilter<"Purchase"> | Date | string
  }, "id" | "stripePaymentIntentId">

  export type PurchaseOrderByWithAggregationInput = {
    id?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrderInput | SortOrder
    serviceName?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    stripePaymentIntentId?: SortOrder
    status?: SortOrder
    country?: SortOrderInput | SortOrder
    mockInterviewStatus?: SortOrderInput | SortOrder
    mockInterviewDate?: SortOrderInput | SortOrder
    deliveryStatus?: SortOrder
    deliveryDeadline?: SortOrderInput | SortOrder
    completionNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PurchaseCountOrderByAggregateInput
    _avg?: PurchaseAvgOrderByAggregateInput
    _max?: PurchaseMaxOrderByAggregateInput
    _min?: PurchaseMinOrderByAggregateInput
    _sum?: PurchaseSumOrderByAggregateInput
  }

  export type PurchaseScalarWhereWithAggregatesInput = {
    AND?: PurchaseScalarWhereWithAggregatesInput | PurchaseScalarWhereWithAggregatesInput[]
    OR?: PurchaseScalarWhereWithAggregatesInput[]
    NOT?: PurchaseScalarWhereWithAggregatesInput | PurchaseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Purchase"> | string
    candidateName?: StringWithAggregatesFilter<"Purchase"> | string
    candidateEmail?: StringWithAggregatesFilter<"Purchase"> | string
    candidatePhone?: StringNullableWithAggregatesFilter<"Purchase"> | string | null
    serviceName?: StringWithAggregatesFilter<"Purchase"> | string
    amount?: FloatWithAggregatesFilter<"Purchase"> | number
    currency?: StringWithAggregatesFilter<"Purchase"> | string
    stripePaymentIntentId?: StringWithAggregatesFilter<"Purchase"> | string
    status?: StringWithAggregatesFilter<"Purchase"> | string
    country?: StringNullableWithAggregatesFilter<"Purchase"> | string | null
    mockInterviewStatus?: StringNullableWithAggregatesFilter<"Purchase"> | string | null
    mockInterviewDate?: DateTimeNullableWithAggregatesFilter<"Purchase"> | Date | string | null
    deliveryStatus?: StringWithAggregatesFilter<"Purchase"> | string
    deliveryDeadline?: DateTimeNullableWithAggregatesFilter<"Purchase"> | Date | string | null
    completionNotes?: StringNullableWithAggregatesFilter<"Purchase"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Purchase"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Purchase"> | Date | string
  }

  export type FunnelEventWhereInput = {
    AND?: FunnelEventWhereInput | FunnelEventWhereInput[]
    OR?: FunnelEventWhereInput[]
    NOT?: FunnelEventWhereInput | FunnelEventWhereInput[]
    id?: StringFilter<"FunnelEvent"> | string
    serviceName?: StringFilter<"FunnelEvent"> | string
    eventType?: StringFilter<"FunnelEvent"> | string
    createdAt?: DateTimeFilter<"FunnelEvent"> | Date | string
  }

  export type FunnelEventOrderByWithRelationInput = {
    id?: SortOrder
    serviceName?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type FunnelEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FunnelEventWhereInput | FunnelEventWhereInput[]
    OR?: FunnelEventWhereInput[]
    NOT?: FunnelEventWhereInput | FunnelEventWhereInput[]
    serviceName?: StringFilter<"FunnelEvent"> | string
    eventType?: StringFilter<"FunnelEvent"> | string
    createdAt?: DateTimeFilter<"FunnelEvent"> | Date | string
  }, "id">

  export type FunnelEventOrderByWithAggregationInput = {
    id?: SortOrder
    serviceName?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
    _count?: FunnelEventCountOrderByAggregateInput
    _max?: FunnelEventMaxOrderByAggregateInput
    _min?: FunnelEventMinOrderByAggregateInput
  }

  export type FunnelEventScalarWhereWithAggregatesInput = {
    AND?: FunnelEventScalarWhereWithAggregatesInput | FunnelEventScalarWhereWithAggregatesInput[]
    OR?: FunnelEventScalarWhereWithAggregatesInput[]
    NOT?: FunnelEventScalarWhereWithAggregatesInput | FunnelEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FunnelEvent"> | string
    serviceName?: StringWithAggregatesFilter<"FunnelEvent"> | string
    eventType?: StringWithAggregatesFilter<"FunnelEvent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"FunnelEvent"> | Date | string
  }

  export type KnowledgeDocumentWhereInput = {
    AND?: KnowledgeDocumentWhereInput | KnowledgeDocumentWhereInput[]
    OR?: KnowledgeDocumentWhereInput[]
    NOT?: KnowledgeDocumentWhereInput | KnowledgeDocumentWhereInput[]
    id?: StringFilter<"KnowledgeDocument"> | string
    title?: StringFilter<"KnowledgeDocument"> | string
    content?: StringFilter<"KnowledgeDocument"> | string
    sourceType?: StringFilter<"KnowledgeDocument"> | string
    fileName?: StringNullableFilter<"KnowledgeDocument"> | string | null
    isActive?: BoolFilter<"KnowledgeDocument"> | boolean
    createdAt?: DateTimeFilter<"KnowledgeDocument"> | Date | string
    updatedAt?: DateTimeFilter<"KnowledgeDocument"> | Date | string
    chunks?: KnowledgeChunkListRelationFilter
  }

  export type KnowledgeDocumentOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    sourceType?: SortOrder
    fileName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    chunks?: KnowledgeChunkOrderByRelationAggregateInput
  }

  export type KnowledgeDocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KnowledgeDocumentWhereInput | KnowledgeDocumentWhereInput[]
    OR?: KnowledgeDocumentWhereInput[]
    NOT?: KnowledgeDocumentWhereInput | KnowledgeDocumentWhereInput[]
    title?: StringFilter<"KnowledgeDocument"> | string
    content?: StringFilter<"KnowledgeDocument"> | string
    sourceType?: StringFilter<"KnowledgeDocument"> | string
    fileName?: StringNullableFilter<"KnowledgeDocument"> | string | null
    isActive?: BoolFilter<"KnowledgeDocument"> | boolean
    createdAt?: DateTimeFilter<"KnowledgeDocument"> | Date | string
    updatedAt?: DateTimeFilter<"KnowledgeDocument"> | Date | string
    chunks?: KnowledgeChunkListRelationFilter
  }, "id">

  export type KnowledgeDocumentOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    sourceType?: SortOrder
    fileName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: KnowledgeDocumentCountOrderByAggregateInput
    _max?: KnowledgeDocumentMaxOrderByAggregateInput
    _min?: KnowledgeDocumentMinOrderByAggregateInput
  }

  export type KnowledgeDocumentScalarWhereWithAggregatesInput = {
    AND?: KnowledgeDocumentScalarWhereWithAggregatesInput | KnowledgeDocumentScalarWhereWithAggregatesInput[]
    OR?: KnowledgeDocumentScalarWhereWithAggregatesInput[]
    NOT?: KnowledgeDocumentScalarWhereWithAggregatesInput | KnowledgeDocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KnowledgeDocument"> | string
    title?: StringWithAggregatesFilter<"KnowledgeDocument"> | string
    content?: StringWithAggregatesFilter<"KnowledgeDocument"> | string
    sourceType?: StringWithAggregatesFilter<"KnowledgeDocument"> | string
    fileName?: StringNullableWithAggregatesFilter<"KnowledgeDocument"> | string | null
    isActive?: BoolWithAggregatesFilter<"KnowledgeDocument"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"KnowledgeDocument"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"KnowledgeDocument"> | Date | string
  }

  export type KnowledgeChunkWhereInput = {
    AND?: KnowledgeChunkWhereInput | KnowledgeChunkWhereInput[]
    OR?: KnowledgeChunkWhereInput[]
    NOT?: KnowledgeChunkWhereInput | KnowledgeChunkWhereInput[]
    id?: StringFilter<"KnowledgeChunk"> | string
    documentId?: StringFilter<"KnowledgeChunk"> | string
    content?: StringFilter<"KnowledgeChunk"> | string
    chunkIndex?: IntFilter<"KnowledgeChunk"> | number
    createdAt?: DateTimeFilter<"KnowledgeChunk"> | Date | string
    document?: XOR<KnowledgeDocumentRelationFilter, KnowledgeDocumentWhereInput>
  }

  export type KnowledgeChunkOrderByWithRelationInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
    document?: KnowledgeDocumentOrderByWithRelationInput
  }

  export type KnowledgeChunkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KnowledgeChunkWhereInput | KnowledgeChunkWhereInput[]
    OR?: KnowledgeChunkWhereInput[]
    NOT?: KnowledgeChunkWhereInput | KnowledgeChunkWhereInput[]
    documentId?: StringFilter<"KnowledgeChunk"> | string
    content?: StringFilter<"KnowledgeChunk"> | string
    chunkIndex?: IntFilter<"KnowledgeChunk"> | number
    createdAt?: DateTimeFilter<"KnowledgeChunk"> | Date | string
    document?: XOR<KnowledgeDocumentRelationFilter, KnowledgeDocumentWhereInput>
  }, "id">

  export type KnowledgeChunkOrderByWithAggregationInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
    _count?: KnowledgeChunkCountOrderByAggregateInput
    _avg?: KnowledgeChunkAvgOrderByAggregateInput
    _max?: KnowledgeChunkMaxOrderByAggregateInput
    _min?: KnowledgeChunkMinOrderByAggregateInput
    _sum?: KnowledgeChunkSumOrderByAggregateInput
  }

  export type KnowledgeChunkScalarWhereWithAggregatesInput = {
    AND?: KnowledgeChunkScalarWhereWithAggregatesInput | KnowledgeChunkScalarWhereWithAggregatesInput[]
    OR?: KnowledgeChunkScalarWhereWithAggregatesInput[]
    NOT?: KnowledgeChunkScalarWhereWithAggregatesInput | KnowledgeChunkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KnowledgeChunk"> | string
    documentId?: StringWithAggregatesFilter<"KnowledgeChunk"> | string
    content?: StringWithAggregatesFilter<"KnowledgeChunk"> | string
    chunkIndex?: IntWithAggregatesFilter<"KnowledgeChunk"> | number
    createdAt?: DateTimeWithAggregatesFilter<"KnowledgeChunk"> | Date | string
  }

  export type ChatConversationWhereInput = {
    AND?: ChatConversationWhereInput | ChatConversationWhereInput[]
    OR?: ChatConversationWhereInput[]
    NOT?: ChatConversationWhereInput | ChatConversationWhereInput[]
    id?: StringFilter<"ChatConversation"> | string
    sessionId?: StringFilter<"ChatConversation"> | string
    messages?: JsonFilter<"ChatConversation">
    ipAddress?: StringNullableFilter<"ChatConversation"> | string | null
    userAgent?: StringNullableFilter<"ChatConversation"> | string | null
    createdAt?: DateTimeFilter<"ChatConversation"> | Date | string
    updatedAt?: DateTimeFilter<"ChatConversation"> | Date | string
  }

  export type ChatConversationOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    messages?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId?: string
    AND?: ChatConversationWhereInput | ChatConversationWhereInput[]
    OR?: ChatConversationWhereInput[]
    NOT?: ChatConversationWhereInput | ChatConversationWhereInput[]
    messages?: JsonFilter<"ChatConversation">
    ipAddress?: StringNullableFilter<"ChatConversation"> | string | null
    userAgent?: StringNullableFilter<"ChatConversation"> | string | null
    createdAt?: DateTimeFilter<"ChatConversation"> | Date | string
    updatedAt?: DateTimeFilter<"ChatConversation"> | Date | string
  }, "id" | "sessionId">

  export type ChatConversationOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    messages?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChatConversationCountOrderByAggregateInput
    _max?: ChatConversationMaxOrderByAggregateInput
    _min?: ChatConversationMinOrderByAggregateInput
  }

  export type ChatConversationScalarWhereWithAggregatesInput = {
    AND?: ChatConversationScalarWhereWithAggregatesInput | ChatConversationScalarWhereWithAggregatesInput[]
    OR?: ChatConversationScalarWhereWithAggregatesInput[]
    NOT?: ChatConversationScalarWhereWithAggregatesInput | ChatConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatConversation"> | string
    sessionId?: StringWithAggregatesFilter<"ChatConversation"> | string
    messages?: JsonWithAggregatesFilter<"ChatConversation">
    ipAddress?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ChatConversation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChatConversation"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    fullName?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    fullName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    fullName?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    fullName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    fullName?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type InterviewTemplateWhereInput = {
    AND?: InterviewTemplateWhereInput | InterviewTemplateWhereInput[]
    OR?: InterviewTemplateWhereInput[]
    NOT?: InterviewTemplateWhereInput | InterviewTemplateWhereInput[]
    id?: StringFilter<"InterviewTemplate"> | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFilter<"InterviewTemplate"> | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFilter<"InterviewTemplate"> | string
    experienceLevel?: StringFilter<"InterviewTemplate"> | string
    techStack?: StringNullableListFilter<"InterviewTemplate">
    requiredSkills?: StringNullableListFilter<"InterviewTemplate">
    durationMinutes?: IntFilter<"InterviewTemplate"> | number
    difficultyLevel?: StringFilter<"InterviewTemplate"> | string
    advancedConfig?: JsonNullableFilter<"InterviewTemplate">
    interviewDescription?: StringNullableFilter<"InterviewTemplate"> | string | null
    systemInstructions?: StringNullableFilter<"InterviewTemplate"> | string | null
    isActive?: BoolFilter<"InterviewTemplate"> | boolean
    createdAt?: DateTimeFilter<"InterviewTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewTemplate"> | Date | string
    applications?: CandidateApplicationListRelationFilter
  }

  export type InterviewTemplateOrderByWithRelationInput = {
    id?: SortOrder
    ownerRole?: SortOrder
    jobRole?: SortOrder
    experienceLevel?: SortOrder
    techStack?: SortOrder
    requiredSkills?: SortOrder
    durationMinutes?: SortOrder
    difficultyLevel?: SortOrder
    advancedConfig?: SortOrderInput | SortOrder
    interviewDescription?: SortOrderInput | SortOrder
    systemInstructions?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    applications?: CandidateApplicationOrderByRelationAggregateInput
  }

  export type InterviewTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InterviewTemplateWhereInput | InterviewTemplateWhereInput[]
    OR?: InterviewTemplateWhereInput[]
    NOT?: InterviewTemplateWhereInput | InterviewTemplateWhereInput[]
    ownerRole?: EnumInterviewTemplateOwnerRoleFilter<"InterviewTemplate"> | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFilter<"InterviewTemplate"> | string
    experienceLevel?: StringFilter<"InterviewTemplate"> | string
    techStack?: StringNullableListFilter<"InterviewTemplate">
    requiredSkills?: StringNullableListFilter<"InterviewTemplate">
    durationMinutes?: IntFilter<"InterviewTemplate"> | number
    difficultyLevel?: StringFilter<"InterviewTemplate"> | string
    advancedConfig?: JsonNullableFilter<"InterviewTemplate">
    interviewDescription?: StringNullableFilter<"InterviewTemplate"> | string | null
    systemInstructions?: StringNullableFilter<"InterviewTemplate"> | string | null
    isActive?: BoolFilter<"InterviewTemplate"> | boolean
    createdAt?: DateTimeFilter<"InterviewTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewTemplate"> | Date | string
    applications?: CandidateApplicationListRelationFilter
  }, "id">

  export type InterviewTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    ownerRole?: SortOrder
    jobRole?: SortOrder
    experienceLevel?: SortOrder
    techStack?: SortOrder
    requiredSkills?: SortOrder
    durationMinutes?: SortOrder
    difficultyLevel?: SortOrder
    advancedConfig?: SortOrderInput | SortOrder
    interviewDescription?: SortOrderInput | SortOrder
    systemInstructions?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InterviewTemplateCountOrderByAggregateInput
    _avg?: InterviewTemplateAvgOrderByAggregateInput
    _max?: InterviewTemplateMaxOrderByAggregateInput
    _min?: InterviewTemplateMinOrderByAggregateInput
    _sum?: InterviewTemplateSumOrderByAggregateInput
  }

  export type InterviewTemplateScalarWhereWithAggregatesInput = {
    AND?: InterviewTemplateScalarWhereWithAggregatesInput | InterviewTemplateScalarWhereWithAggregatesInput[]
    OR?: InterviewTemplateScalarWhereWithAggregatesInput[]
    NOT?: InterviewTemplateScalarWhereWithAggregatesInput | InterviewTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewTemplate"> | string
    ownerRole?: EnumInterviewTemplateOwnerRoleWithAggregatesFilter<"InterviewTemplate"> | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringWithAggregatesFilter<"InterviewTemplate"> | string
    experienceLevel?: StringWithAggregatesFilter<"InterviewTemplate"> | string
    techStack?: StringNullableListFilter<"InterviewTemplate">
    requiredSkills?: StringNullableListFilter<"InterviewTemplate">
    durationMinutes?: IntWithAggregatesFilter<"InterviewTemplate"> | number
    difficultyLevel?: StringWithAggregatesFilter<"InterviewTemplate"> | string
    advancedConfig?: JsonNullableWithAggregatesFilter<"InterviewTemplate">
    interviewDescription?: StringNullableWithAggregatesFilter<"InterviewTemplate"> | string | null
    systemInstructions?: StringNullableWithAggregatesFilter<"InterviewTemplate"> | string | null
    isActive?: BoolWithAggregatesFilter<"InterviewTemplate"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"InterviewTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InterviewTemplate"> | Date | string
  }

  export type CandidateApplicationWhereInput = {
    AND?: CandidateApplicationWhereInput | CandidateApplicationWhereInput[]
    OR?: CandidateApplicationWhereInput[]
    NOT?: CandidateApplicationWhereInput | CandidateApplicationWhereInput[]
    id?: StringFilter<"CandidateApplication"> | string
    templateId?: StringFilter<"CandidateApplication"> | string
    candidateName?: StringFilter<"CandidateApplication"> | string
    candidateEmail?: StringFilter<"CandidateApplication"> | string
    candidatePhone?: StringNullableFilter<"CandidateApplication"> | string | null
    linkedInUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeText?: StringNullableFilter<"CandidateApplication"> | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFilter<"CandidateApplication"> | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFilter<"CandidateApplication"> | string
    accessTokenExpiresAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    status?: EnumCandidateApplicationStatusFilter<"CandidateApplication"> | $Enums.CandidateApplicationStatus
    scheduledAt?: DateTimeNullableFilter<"CandidateApplication"> | Date | string | null
    createdAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    template?: XOR<InterviewTemplateRelationFilter, InterviewTemplateWhereInput>
    session?: XOR<InterviewSessionNullableRelationFilter, InterviewSessionWhereInput> | null
  }

  export type CandidateApplicationOrderByWithRelationInput = {
    id?: SortOrder
    templateId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrderInput | SortOrder
    linkedInUrl?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    resumeText?: SortOrderInput | SortOrder
    interviewPreference?: SortOrder
    accessTokenHash?: SortOrder
    accessTokenExpiresAt?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    template?: InterviewTemplateOrderByWithRelationInput
    session?: InterviewSessionOrderByWithRelationInput
  }

  export type CandidateApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    accessTokenHash?: string
    AND?: CandidateApplicationWhereInput | CandidateApplicationWhereInput[]
    OR?: CandidateApplicationWhereInput[]
    NOT?: CandidateApplicationWhereInput | CandidateApplicationWhereInput[]
    templateId?: StringFilter<"CandidateApplication"> | string
    candidateName?: StringFilter<"CandidateApplication"> | string
    candidateEmail?: StringFilter<"CandidateApplication"> | string
    candidatePhone?: StringNullableFilter<"CandidateApplication"> | string | null
    linkedInUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeText?: StringNullableFilter<"CandidateApplication"> | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFilter<"CandidateApplication"> | $Enums.CandidateInterviewPreference
    accessTokenExpiresAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    status?: EnumCandidateApplicationStatusFilter<"CandidateApplication"> | $Enums.CandidateApplicationStatus
    scheduledAt?: DateTimeNullableFilter<"CandidateApplication"> | Date | string | null
    createdAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    template?: XOR<InterviewTemplateRelationFilter, InterviewTemplateWhereInput>
    session?: XOR<InterviewSessionNullableRelationFilter, InterviewSessionWhereInput> | null
  }, "id" | "accessTokenHash">

  export type CandidateApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    templateId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrderInput | SortOrder
    linkedInUrl?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    resumeText?: SortOrderInput | SortOrder
    interviewPreference?: SortOrder
    accessTokenHash?: SortOrder
    accessTokenExpiresAt?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CandidateApplicationCountOrderByAggregateInput
    _max?: CandidateApplicationMaxOrderByAggregateInput
    _min?: CandidateApplicationMinOrderByAggregateInput
  }

  export type CandidateApplicationScalarWhereWithAggregatesInput = {
    AND?: CandidateApplicationScalarWhereWithAggregatesInput | CandidateApplicationScalarWhereWithAggregatesInput[]
    OR?: CandidateApplicationScalarWhereWithAggregatesInput[]
    NOT?: CandidateApplicationScalarWhereWithAggregatesInput | CandidateApplicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CandidateApplication"> | string
    templateId?: StringWithAggregatesFilter<"CandidateApplication"> | string
    candidateName?: StringWithAggregatesFilter<"CandidateApplication"> | string
    candidateEmail?: StringWithAggregatesFilter<"CandidateApplication"> | string
    candidatePhone?: StringNullableWithAggregatesFilter<"CandidateApplication"> | string | null
    linkedInUrl?: StringNullableWithAggregatesFilter<"CandidateApplication"> | string | null
    resumeUrl?: StringNullableWithAggregatesFilter<"CandidateApplication"> | string | null
    resumeText?: StringNullableWithAggregatesFilter<"CandidateApplication"> | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceWithAggregatesFilter<"CandidateApplication"> | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringWithAggregatesFilter<"CandidateApplication"> | string
    accessTokenExpiresAt?: DateTimeWithAggregatesFilter<"CandidateApplication"> | Date | string
    status?: EnumCandidateApplicationStatusWithAggregatesFilter<"CandidateApplication"> | $Enums.CandidateApplicationStatus
    scheduledAt?: DateTimeNullableWithAggregatesFilter<"CandidateApplication"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CandidateApplication"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CandidateApplication"> | Date | string
  }

  export type InterviewSessionWhereInput = {
    AND?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    OR?: InterviewSessionWhereInput[]
    NOT?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    id?: StringFilter<"InterviewSession"> | string
    applicationId?: StringFilter<"InterviewSession"> | string
    provider?: StringFilter<"InterviewSession"> | string
    modelUsed?: StringNullableFilter<"InterviewSession"> | string | null
    status?: EnumInterviewSessionStatusFilter<"InterviewSession"> | $Enums.InterviewSessionStatus
    transcript?: JsonFilter<"InterviewSession">
    evaluationEvents?: JsonFilter<"InterviewSession">
    finalReport?: JsonNullableFilter<"InterviewSession">
    referenceCards?: JsonFilter<"InterviewSession">
    startedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    application?: XOR<CandidateApplicationRelationFilter, CandidateApplicationWhereInput>
  }

  export type InterviewSessionOrderByWithRelationInput = {
    id?: SortOrder
    applicationId?: SortOrder
    provider?: SortOrder
    modelUsed?: SortOrderInput | SortOrder
    status?: SortOrder
    transcript?: SortOrder
    evaluationEvents?: SortOrder
    finalReport?: SortOrderInput | SortOrder
    referenceCards?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    application?: CandidateApplicationOrderByWithRelationInput
  }

  export type InterviewSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    applicationId?: string
    AND?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    OR?: InterviewSessionWhereInput[]
    NOT?: InterviewSessionWhereInput | InterviewSessionWhereInput[]
    provider?: StringFilter<"InterviewSession"> | string
    modelUsed?: StringNullableFilter<"InterviewSession"> | string | null
    status?: EnumInterviewSessionStatusFilter<"InterviewSession"> | $Enums.InterviewSessionStatus
    transcript?: JsonFilter<"InterviewSession">
    evaluationEvents?: JsonFilter<"InterviewSession">
    finalReport?: JsonNullableFilter<"InterviewSession">
    referenceCards?: JsonFilter<"InterviewSession">
    startedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewSession"> | Date | string
    application?: XOR<CandidateApplicationRelationFilter, CandidateApplicationWhereInput>
  }, "id" | "applicationId">

  export type InterviewSessionOrderByWithAggregationInput = {
    id?: SortOrder
    applicationId?: SortOrder
    provider?: SortOrder
    modelUsed?: SortOrderInput | SortOrder
    status?: SortOrder
    transcript?: SortOrder
    evaluationEvents?: SortOrder
    finalReport?: SortOrderInput | SortOrder
    referenceCards?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InterviewSessionCountOrderByAggregateInput
    _max?: InterviewSessionMaxOrderByAggregateInput
    _min?: InterviewSessionMinOrderByAggregateInput
  }

  export type InterviewSessionScalarWhereWithAggregatesInput = {
    AND?: InterviewSessionScalarWhereWithAggregatesInput | InterviewSessionScalarWhereWithAggregatesInput[]
    OR?: InterviewSessionScalarWhereWithAggregatesInput[]
    NOT?: InterviewSessionScalarWhereWithAggregatesInput | InterviewSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewSession"> | string
    applicationId?: StringWithAggregatesFilter<"InterviewSession"> | string
    provider?: StringWithAggregatesFilter<"InterviewSession"> | string
    modelUsed?: StringNullableWithAggregatesFilter<"InterviewSession"> | string | null
    status?: EnumInterviewSessionStatusWithAggregatesFilter<"InterviewSession"> | $Enums.InterviewSessionStatus
    transcript?: JsonWithAggregatesFilter<"InterviewSession">
    evaluationEvents?: JsonWithAggregatesFilter<"InterviewSession">
    finalReport?: JsonNullableWithAggregatesFilter<"InterviewSession">
    referenceCards?: JsonWithAggregatesFilter<"InterviewSession">
    startedAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string
  }

  export type ContactSubmissionCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    company?: string | null
    subject?: string | null
    message: string
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type ContactSubmissionUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    company?: string | null
    subject?: string | null
    message: string
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type ContactSubmissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactSubmissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactSubmissionCreateManyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    company?: string | null
    subject?: string | null
    message: string
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type ContactSubmissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactSubmissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobSeekerSubmissionCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    location?: string | null
    description?: string | null
    resumeUrl?: string | null
    resumeFileName?: string | null
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type JobSeekerSubmissionUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    location?: string | null
    description?: string | null
    resumeUrl?: string | null
    resumeFileName?: string | null
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type JobSeekerSubmissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileName?: NullableStringFieldUpdateOperationsInput | string | null
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobSeekerSubmissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileName?: NullableStringFieldUpdateOperationsInput | string | null
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobSeekerSubmissionCreateManyInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    location?: string | null
    description?: string | null
    resumeUrl?: string | null
    resumeFileName?: string | null
    sourcePath?: string | null
    referrer?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    browser?: string | null
    os?: string | null
    deviceType?: string | null
    country?: string | null
    region?: string | null
    city?: string | null
    createdAt?: Date | string
  }

  export type JobSeekerSubmissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileName?: NullableStringFieldUpdateOperationsInput | string | null
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobSeekerSubmissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeFileName?: NullableStringFieldUpdateOperationsInput | string | null
    sourcePath?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseCreateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    serviceName: string
    amount: number
    currency?: string
    stripePaymentIntentId: string
    status: string
    country?: string | null
    mockInterviewStatus?: string | null
    mockInterviewDate?: Date | string | null
    deliveryStatus?: string
    deliveryDeadline?: Date | string | null
    completionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseUncheckedCreateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    serviceName: string
    amount: number
    currency?: string
    stripePaymentIntentId: string
    status: string
    country?: string | null
    mockInterviewStatus?: string | null
    mockInterviewDate?: Date | string | null
    deliveryStatus?: string
    deliveryDeadline?: Date | string | null
    completionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    serviceName?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    stripePaymentIntentId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewStatus?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryStatus?: StringFieldUpdateOperationsInput | string
    deliveryDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    serviceName?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    stripePaymentIntentId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewStatus?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryStatus?: StringFieldUpdateOperationsInput | string
    deliveryDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseCreateManyInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    serviceName: string
    amount: number
    currency?: string
    stripePaymentIntentId: string
    status: string
    country?: string | null
    mockInterviewStatus?: string | null
    mockInterviewDate?: Date | string | null
    deliveryStatus?: string
    deliveryDeadline?: Date | string | null
    completionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    serviceName?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    stripePaymentIntentId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewStatus?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryStatus?: StringFieldUpdateOperationsInput | string
    deliveryDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    serviceName?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    stripePaymentIntentId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewStatus?: NullableStringFieldUpdateOperationsInput | string | null
    mockInterviewDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryStatus?: StringFieldUpdateOperationsInput | string
    deliveryDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FunnelEventCreateInput = {
    id?: string
    serviceName: string
    eventType: string
    createdAt?: Date | string
  }

  export type FunnelEventUncheckedCreateInput = {
    id?: string
    serviceName: string
    eventType: string
    createdAt?: Date | string
  }

  export type FunnelEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FunnelEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FunnelEventCreateManyInput = {
    id?: string
    serviceName: string
    eventType: string
    createdAt?: Date | string
  }

  export type FunnelEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FunnelEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeDocumentCreateInput = {
    id?: string
    title: string
    content: string
    sourceType: string
    fileName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    chunks?: KnowledgeChunkCreateNestedManyWithoutDocumentInput
  }

  export type KnowledgeDocumentUncheckedCreateInput = {
    id?: string
    title: string
    content: string
    sourceType: string
    fileName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    chunks?: KnowledgeChunkUncheckedCreateNestedManyWithoutDocumentInput
  }

  export type KnowledgeDocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chunks?: KnowledgeChunkUpdateManyWithoutDocumentNestedInput
  }

  export type KnowledgeDocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chunks?: KnowledgeChunkUncheckedUpdateManyWithoutDocumentNestedInput
  }

  export type KnowledgeDocumentCreateManyInput = {
    id?: string
    title: string
    content: string
    sourceType: string
    fileName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KnowledgeDocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeDocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    document?: KnowledgeDocumentUpdateOneRequiredWithoutChunksNestedInput
  }

  export type KnowledgeChunkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationCreateInput = {
    id?: string
    sessionId: string
    messages: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatConversationUncheckedCreateInput = {
    id?: string
    sessionId: string
    messages: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationCreateManyInput = {
    id?: string
    sessionId: string
    messages: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    fullName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    fullName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    fullName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewTemplateCreateInput = {
    id?: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack?: InterviewTemplateCreatetechStackInput | string[]
    requiredSkills?: InterviewTemplateCreaterequiredSkillsInput | string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: string | null
    systemInstructions?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: CandidateApplicationCreateNestedManyWithoutTemplateInput
  }

  export type InterviewTemplateUncheckedCreateInput = {
    id?: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack?: InterviewTemplateCreatetechStackInput | string[]
    requiredSkills?: InterviewTemplateCreaterequiredSkillsInput | string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: string | null
    systemInstructions?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: CandidateApplicationUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type InterviewTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: CandidateApplicationUpdateManyWithoutTemplateNestedInput
  }

  export type InterviewTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: CandidateApplicationUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type InterviewTemplateCreateManyInput = {
    id?: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack?: InterviewTemplateCreatetechStackInput | string[]
    requiredSkills?: InterviewTemplateCreaterequiredSkillsInput | string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: string | null
    systemInstructions?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateApplicationCreateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    template: InterviewTemplateCreateNestedOneWithoutApplicationsInput
    session?: InterviewSessionCreateNestedOneWithoutApplicationInput
  }

  export type CandidateApplicationUncheckedCreateInput = {
    id?: string
    templateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session?: InterviewSessionUncheckedCreateNestedOneWithoutApplicationInput
  }

  export type CandidateApplicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: InterviewTemplateUpdateOneRequiredWithoutApplicationsNestedInput
    session?: InterviewSessionUpdateOneWithoutApplicationNestedInput
  }

  export type CandidateApplicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUncheckedUpdateOneWithoutApplicationNestedInput
  }

  export type CandidateApplicationCreateManyInput = {
    id?: string
    templateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateApplicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateApplicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionCreateInput = {
    id?: string
    provider: string
    modelUsed?: string | null
    status?: $Enums.InterviewSessionStatus
    transcript: JsonNullValueInput | InputJsonValue
    evaluationEvents: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    application: CandidateApplicationCreateNestedOneWithoutSessionInput
  }

  export type InterviewSessionUncheckedCreateInput = {
    id?: string
    applicationId: string
    provider: string
    modelUsed?: string | null
    status?: $Enums.InterviewSessionStatus
    transcript: JsonNullValueInput | InputJsonValue
    evaluationEvents: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    application?: CandidateApplicationUpdateOneRequiredWithoutSessionNestedInput
  }

  export type InterviewSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionCreateManyInput = {
    id?: string
    applicationId: string
    provider: string
    modelUsed?: string | null
    status?: $Enums.InterviewSessionStatus
    transcript: JsonNullValueInput | InputJsonValue
    evaluationEvents: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ContactSubmissionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    subject?: SortOrder
    message?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactSubmissionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    subject?: SortOrder
    message?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactSubmissionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    subject?: SortOrder
    message?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type JobSeekerSubmissionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    description?: SortOrder
    resumeUrl?: SortOrder
    resumeFileName?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type JobSeekerSubmissionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    description?: SortOrder
    resumeUrl?: SortOrder
    resumeFileName?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type JobSeekerSubmissionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    description?: SortOrder
    resumeUrl?: SortOrder
    resumeFileName?: SortOrder
    sourcePath?: SortOrder
    referrer?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    deviceType?: SortOrder
    country?: SortOrder
    region?: SortOrder
    city?: SortOrder
    createdAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PurchaseCountOrderByAggregateInput = {
    id?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    serviceName?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    stripePaymentIntentId?: SortOrder
    status?: SortOrder
    country?: SortOrder
    mockInterviewStatus?: SortOrder
    mockInterviewDate?: SortOrder
    deliveryStatus?: SortOrder
    deliveryDeadline?: SortOrder
    completionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type PurchaseMaxOrderByAggregateInput = {
    id?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    serviceName?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    stripePaymentIntentId?: SortOrder
    status?: SortOrder
    country?: SortOrder
    mockInterviewStatus?: SortOrder
    mockInterviewDate?: SortOrder
    deliveryStatus?: SortOrder
    deliveryDeadline?: SortOrder
    completionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseMinOrderByAggregateInput = {
    id?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    serviceName?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    stripePaymentIntentId?: SortOrder
    status?: SortOrder
    country?: SortOrder
    mockInterviewStatus?: SortOrder
    mockInterviewDate?: SortOrder
    deliveryStatus?: SortOrder
    deliveryDeadline?: SortOrder
    completionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FunnelEventCountOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type FunnelEventMaxOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type FunnelEventMinOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type KnowledgeChunkListRelationFilter = {
    every?: KnowledgeChunkWhereInput
    some?: KnowledgeChunkWhereInput
    none?: KnowledgeChunkWhereInput
  }

  export type KnowledgeChunkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KnowledgeDocumentCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    sourceType?: SortOrder
    fileName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KnowledgeDocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    sourceType?: SortOrder
    fileName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KnowledgeDocumentMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    sourceType?: SortOrder
    fileName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type KnowledgeDocumentRelationFilter = {
    is?: KnowledgeDocumentWhereInput
    isNot?: KnowledgeDocumentWhereInput
  }

  export type KnowledgeChunkCountOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
  }

  export type KnowledgeChunkAvgOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type KnowledgeChunkMaxOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
  }

  export type KnowledgeChunkMinOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
  }

  export type KnowledgeChunkSumOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ChatConversationCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    messages?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatConversationMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    fullName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    fullName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    fullName?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type EnumInterviewTemplateOwnerRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewTemplateOwnerRole | EnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel> | $Enums.InterviewTemplateOwnerRole
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type CandidateApplicationListRelationFilter = {
    every?: CandidateApplicationWhereInput
    some?: CandidateApplicationWhereInput
    none?: CandidateApplicationWhereInput
  }

  export type CandidateApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    ownerRole?: SortOrder
    jobRole?: SortOrder
    experienceLevel?: SortOrder
    techStack?: SortOrder
    requiredSkills?: SortOrder
    durationMinutes?: SortOrder
    difficultyLevel?: SortOrder
    advancedConfig?: SortOrder
    interviewDescription?: SortOrder
    systemInstructions?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewTemplateAvgOrderByAggregateInput = {
    durationMinutes?: SortOrder
  }

  export type InterviewTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    ownerRole?: SortOrder
    jobRole?: SortOrder
    experienceLevel?: SortOrder
    durationMinutes?: SortOrder
    difficultyLevel?: SortOrder
    interviewDescription?: SortOrder
    systemInstructions?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    ownerRole?: SortOrder
    jobRole?: SortOrder
    experienceLevel?: SortOrder
    durationMinutes?: SortOrder
    difficultyLevel?: SortOrder
    interviewDescription?: SortOrder
    systemInstructions?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewTemplateSumOrderByAggregateInput = {
    durationMinutes?: SortOrder
  }

  export type EnumInterviewTemplateOwnerRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewTemplateOwnerRole | EnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTemplateOwnerRoleWithAggregatesFilter<$PrismaModel> | $Enums.InterviewTemplateOwnerRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel>
    _max?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumCandidateInterviewPreferenceFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateInterviewPreference | EnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel> | $Enums.CandidateInterviewPreference
  }

  export type EnumCandidateApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateApplicationStatus | EnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel> | $Enums.CandidateApplicationStatus
  }

  export type InterviewTemplateRelationFilter = {
    is?: InterviewTemplateWhereInput
    isNot?: InterviewTemplateWhereInput
  }

  export type InterviewSessionNullableRelationFilter = {
    is?: InterviewSessionWhereInput | null
    isNot?: InterviewSessionWhereInput | null
  }

  export type CandidateApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    linkedInUrl?: SortOrder
    resumeUrl?: SortOrder
    resumeText?: SortOrder
    interviewPreference?: SortOrder
    accessTokenHash?: SortOrder
    accessTokenExpiresAt?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    linkedInUrl?: SortOrder
    resumeUrl?: SortOrder
    resumeText?: SortOrder
    interviewPreference?: SortOrder
    accessTokenHash?: SortOrder
    accessTokenExpiresAt?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    candidatePhone?: SortOrder
    linkedInUrl?: SortOrder
    resumeUrl?: SortOrder
    resumeText?: SortOrder
    interviewPreference?: SortOrder
    accessTokenHash?: SortOrder
    accessTokenExpiresAt?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumCandidateInterviewPreferenceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateInterviewPreference | EnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateInterviewPreferenceWithAggregatesFilter<$PrismaModel> | $Enums.CandidateInterviewPreference
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel>
    _max?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel>
  }

  export type EnumCandidateApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateApplicationStatus | EnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.CandidateApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel>
  }

  export type EnumInterviewSessionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewSessionStatus | EnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewSessionStatusFilter<$PrismaModel> | $Enums.InterviewSessionStatus
  }

  export type CandidateApplicationRelationFilter = {
    is?: CandidateApplicationWhereInput
    isNot?: CandidateApplicationWhereInput
  }

  export type InterviewSessionCountOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    provider?: SortOrder
    modelUsed?: SortOrder
    status?: SortOrder
    transcript?: SortOrder
    evaluationEvents?: SortOrder
    finalReport?: SortOrder
    referenceCards?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    provider?: SortOrder
    modelUsed?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewSessionMinOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    provider?: SortOrder
    modelUsed?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumInterviewSessionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewSessionStatus | EnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewSessionStatusWithAggregatesFilter<$PrismaModel> | $Enums.InterviewSessionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewSessionStatusFilter<$PrismaModel>
    _max?: NestedEnumInterviewSessionStatusFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type KnowledgeChunkCreateNestedManyWithoutDocumentInput = {
    connect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
  }

  export type KnowledgeChunkUncheckedCreateNestedManyWithoutDocumentInput = {
    connect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type KnowledgeChunkUpdateManyWithoutDocumentNestedInput = {
    set?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    disconnect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    delete?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    connect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    update?: KnowledgeChunkUpdateWithWhereUniqueWithoutDocumentInput | KnowledgeChunkUpdateWithWhereUniqueWithoutDocumentInput[]
    updateMany?: KnowledgeChunkUpdateManyWithWhereWithoutDocumentInput | KnowledgeChunkUpdateManyWithWhereWithoutDocumentInput[]
    deleteMany?: KnowledgeChunkScalarWhereInput | KnowledgeChunkScalarWhereInput[]
  }

  export type KnowledgeChunkUncheckedUpdateManyWithoutDocumentNestedInput = {
    set?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    disconnect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    delete?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    connect?: KnowledgeChunkWhereUniqueInput | KnowledgeChunkWhereUniqueInput[]
    update?: KnowledgeChunkUpdateWithWhereUniqueWithoutDocumentInput | KnowledgeChunkUpdateWithWhereUniqueWithoutDocumentInput[]
    updateMany?: KnowledgeChunkUpdateManyWithWhereWithoutDocumentInput | KnowledgeChunkUpdateManyWithWhereWithoutDocumentInput[]
    deleteMany?: KnowledgeChunkScalarWhereInput | KnowledgeChunkScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type KnowledgeDocumentUpdateOneRequiredWithoutChunksNestedInput = {
    create?: XOR<KnowledgeDocumentCreateWithoutChunksInput, KnowledgeDocumentUncheckedCreateWithoutChunksInput>
    connectOrCreate?: KnowledgeDocumentCreateOrConnectWithoutChunksInput
    upsert?: KnowledgeDocumentUpsertWithoutChunksInput
    connect?: KnowledgeDocumentWhereUniqueInput
    update?: XOR<XOR<KnowledgeDocumentUpdateToOneWithWhereWithoutChunksInput, KnowledgeDocumentUpdateWithoutChunksInput>, KnowledgeDocumentUncheckedUpdateWithoutChunksInput>
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type InterviewTemplateCreatetechStackInput = {
    set: string[]
  }

  export type InterviewTemplateCreaterequiredSkillsInput = {
    set: string[]
  }

  export type CandidateApplicationCreateNestedManyWithoutTemplateInput = {
    create?: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput> | CandidateApplicationCreateWithoutTemplateInput[] | CandidateApplicationUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutTemplateInput | CandidateApplicationCreateOrConnectWithoutTemplateInput[]
    createMany?: CandidateApplicationCreateManyTemplateInputEnvelope
    connect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
  }

  export type CandidateApplicationUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput> | CandidateApplicationCreateWithoutTemplateInput[] | CandidateApplicationUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutTemplateInput | CandidateApplicationCreateOrConnectWithoutTemplateInput[]
    createMany?: CandidateApplicationCreateManyTemplateInputEnvelope
    connect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
  }

  export type EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput = {
    set?: $Enums.InterviewTemplateOwnerRole
  }

  export type InterviewTemplateUpdatetechStackInput = {
    set?: string[]
    push?: string | string[]
  }

  export type InterviewTemplateUpdaterequiredSkillsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type CandidateApplicationUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput> | CandidateApplicationCreateWithoutTemplateInput[] | CandidateApplicationUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutTemplateInput | CandidateApplicationCreateOrConnectWithoutTemplateInput[]
    upsert?: CandidateApplicationUpsertWithWhereUniqueWithoutTemplateInput | CandidateApplicationUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: CandidateApplicationCreateManyTemplateInputEnvelope
    set?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    disconnect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    delete?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    connect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    update?: CandidateApplicationUpdateWithWhereUniqueWithoutTemplateInput | CandidateApplicationUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: CandidateApplicationUpdateManyWithWhereWithoutTemplateInput | CandidateApplicationUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: CandidateApplicationScalarWhereInput | CandidateApplicationScalarWhereInput[]
  }

  export type CandidateApplicationUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput> | CandidateApplicationCreateWithoutTemplateInput[] | CandidateApplicationUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutTemplateInput | CandidateApplicationCreateOrConnectWithoutTemplateInput[]
    upsert?: CandidateApplicationUpsertWithWhereUniqueWithoutTemplateInput | CandidateApplicationUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: CandidateApplicationCreateManyTemplateInputEnvelope
    set?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    disconnect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    delete?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    connect?: CandidateApplicationWhereUniqueInput | CandidateApplicationWhereUniqueInput[]
    update?: CandidateApplicationUpdateWithWhereUniqueWithoutTemplateInput | CandidateApplicationUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: CandidateApplicationUpdateManyWithWhereWithoutTemplateInput | CandidateApplicationUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: CandidateApplicationScalarWhereInput | CandidateApplicationScalarWhereInput[]
  }

  export type InterviewTemplateCreateNestedOneWithoutApplicationsInput = {
    create?: XOR<InterviewTemplateCreateWithoutApplicationsInput, InterviewTemplateUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: InterviewTemplateCreateOrConnectWithoutApplicationsInput
    connect?: InterviewTemplateWhereUniqueInput
  }

  export type InterviewSessionCreateNestedOneWithoutApplicationInput = {
    create?: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutApplicationInput
    connect?: InterviewSessionWhereUniqueInput
  }

  export type InterviewSessionUncheckedCreateNestedOneWithoutApplicationInput = {
    create?: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutApplicationInput
    connect?: InterviewSessionWhereUniqueInput
  }

  export type EnumCandidateInterviewPreferenceFieldUpdateOperationsInput = {
    set?: $Enums.CandidateInterviewPreference
  }

  export type EnumCandidateApplicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.CandidateApplicationStatus
  }

  export type InterviewTemplateUpdateOneRequiredWithoutApplicationsNestedInput = {
    create?: XOR<InterviewTemplateCreateWithoutApplicationsInput, InterviewTemplateUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: InterviewTemplateCreateOrConnectWithoutApplicationsInput
    upsert?: InterviewTemplateUpsertWithoutApplicationsInput
    connect?: InterviewTemplateWhereUniqueInput
    update?: XOR<XOR<InterviewTemplateUpdateToOneWithWhereWithoutApplicationsInput, InterviewTemplateUpdateWithoutApplicationsInput>, InterviewTemplateUncheckedUpdateWithoutApplicationsInput>
  }

  export type InterviewSessionUpdateOneWithoutApplicationNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutApplicationInput
    upsert?: InterviewSessionUpsertWithoutApplicationInput
    disconnect?: InterviewSessionWhereInput | boolean
    delete?: InterviewSessionWhereInput | boolean
    connect?: InterviewSessionWhereUniqueInput
    update?: XOR<XOR<InterviewSessionUpdateToOneWithWhereWithoutApplicationInput, InterviewSessionUpdateWithoutApplicationInput>, InterviewSessionUncheckedUpdateWithoutApplicationInput>
  }

  export type InterviewSessionUncheckedUpdateOneWithoutApplicationNestedInput = {
    create?: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: InterviewSessionCreateOrConnectWithoutApplicationInput
    upsert?: InterviewSessionUpsertWithoutApplicationInput
    disconnect?: InterviewSessionWhereInput | boolean
    delete?: InterviewSessionWhereInput | boolean
    connect?: InterviewSessionWhereUniqueInput
    update?: XOR<XOR<InterviewSessionUpdateToOneWithWhereWithoutApplicationInput, InterviewSessionUpdateWithoutApplicationInput>, InterviewSessionUncheckedUpdateWithoutApplicationInput>
  }

  export type CandidateApplicationCreateNestedOneWithoutSessionInput = {
    create?: XOR<CandidateApplicationCreateWithoutSessionInput, CandidateApplicationUncheckedCreateWithoutSessionInput>
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutSessionInput
    connect?: CandidateApplicationWhereUniqueInput
  }

  export type EnumInterviewSessionStatusFieldUpdateOperationsInput = {
    set?: $Enums.InterviewSessionStatus
  }

  export type CandidateApplicationUpdateOneRequiredWithoutSessionNestedInput = {
    create?: XOR<CandidateApplicationCreateWithoutSessionInput, CandidateApplicationUncheckedCreateWithoutSessionInput>
    connectOrCreate?: CandidateApplicationCreateOrConnectWithoutSessionInput
    upsert?: CandidateApplicationUpsertWithoutSessionInput
    connect?: CandidateApplicationWhereUniqueInput
    update?: XOR<XOR<CandidateApplicationUpdateToOneWithWhereWithoutSessionInput, CandidateApplicationUpdateWithoutSessionInput>, CandidateApplicationUncheckedUpdateWithoutSessionInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewTemplateOwnerRole | EnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel> | $Enums.InterviewTemplateOwnerRole
  }

  export type NestedEnumInterviewTemplateOwnerRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewTemplateOwnerRole | EnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewTemplateOwnerRole[] | ListEnumInterviewTemplateOwnerRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTemplateOwnerRoleWithAggregatesFilter<$PrismaModel> | $Enums.InterviewTemplateOwnerRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel>
    _max?: NestedEnumInterviewTemplateOwnerRoleFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateInterviewPreference | EnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel> | $Enums.CandidateInterviewPreference
  }

  export type NestedEnumCandidateApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateApplicationStatus | EnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel> | $Enums.CandidateApplicationStatus
  }

  export type NestedEnumCandidateInterviewPreferenceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateInterviewPreference | EnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateInterviewPreference[] | ListEnumCandidateInterviewPreferenceFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateInterviewPreferenceWithAggregatesFilter<$PrismaModel> | $Enums.CandidateInterviewPreference
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel>
    _max?: NestedEnumCandidateInterviewPreferenceFilter<$PrismaModel>
  }

  export type NestedEnumCandidateApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CandidateApplicationStatus | EnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CandidateApplicationStatus[] | ListEnumCandidateApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCandidateApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.CandidateApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumCandidateApplicationStatusFilter<$PrismaModel>
  }

  export type NestedEnumInterviewSessionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewSessionStatus | EnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewSessionStatusFilter<$PrismaModel> | $Enums.InterviewSessionStatus
  }

  export type NestedEnumInterviewSessionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewSessionStatus | EnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewSessionStatus[] | ListEnumInterviewSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewSessionStatusWithAggregatesFilter<$PrismaModel> | $Enums.InterviewSessionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewSessionStatusFilter<$PrismaModel>
    _max?: NestedEnumInterviewSessionStatusFilter<$PrismaModel>
  }

  export type KnowledgeChunkUpdateWithWhereUniqueWithoutDocumentInput = {
    where: KnowledgeChunkWhereUniqueInput
    data: XOR<KnowledgeChunkUpdateWithoutDocumentInput, KnowledgeChunkUncheckedUpdateWithoutDocumentInput>
  }

  export type KnowledgeChunkUpdateManyWithWhereWithoutDocumentInput = {
    where: KnowledgeChunkScalarWhereInput
    data: XOR<KnowledgeChunkUpdateManyMutationInput, KnowledgeChunkUncheckedUpdateManyWithoutDocumentInput>
  }

  export type KnowledgeChunkScalarWhereInput = {
    AND?: KnowledgeChunkScalarWhereInput | KnowledgeChunkScalarWhereInput[]
    OR?: KnowledgeChunkScalarWhereInput[]
    NOT?: KnowledgeChunkScalarWhereInput | KnowledgeChunkScalarWhereInput[]
    id?: StringFilter<"KnowledgeChunk"> | string
    documentId?: StringFilter<"KnowledgeChunk"> | string
    content?: StringFilter<"KnowledgeChunk"> | string
    chunkIndex?: IntFilter<"KnowledgeChunk"> | number
    createdAt?: DateTimeFilter<"KnowledgeChunk"> | Date | string
  }

  export type KnowledgeDocumentCreateWithoutChunksInput = {
    id?: string
    title: string
    content: string
    sourceType: string
    fileName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KnowledgeDocumentUncheckedCreateWithoutChunksInput = {
    id?: string
    title: string
    content: string
    sourceType: string
    fileName?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KnowledgeDocumentCreateOrConnectWithoutChunksInput = {
    where: KnowledgeDocumentWhereUniqueInput
    create: XOR<KnowledgeDocumentCreateWithoutChunksInput, KnowledgeDocumentUncheckedCreateWithoutChunksInput>
  }

  export type KnowledgeDocumentUpsertWithoutChunksInput = {
    update: XOR<KnowledgeDocumentUpdateWithoutChunksInput, KnowledgeDocumentUncheckedUpdateWithoutChunksInput>
    create: XOR<KnowledgeDocumentCreateWithoutChunksInput, KnowledgeDocumentUncheckedCreateWithoutChunksInput>
    where?: KnowledgeDocumentWhereInput
  }

  export type KnowledgeDocumentUpdateToOneWithWhereWithoutChunksInput = {
    where?: KnowledgeDocumentWhereInput
    data: XOR<KnowledgeDocumentUpdateWithoutChunksInput, KnowledgeDocumentUncheckedUpdateWithoutChunksInput>
  }

  export type KnowledgeDocumentUpdateWithoutChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeDocumentUncheckedUpdateWithoutChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateApplicationCreateWithoutTemplateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session?: InterviewSessionCreateNestedOneWithoutApplicationInput
  }

  export type CandidateApplicationUncheckedCreateWithoutTemplateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    session?: InterviewSessionUncheckedCreateNestedOneWithoutApplicationInput
  }

  export type CandidateApplicationCreateOrConnectWithoutTemplateInput = {
    where: CandidateApplicationWhereUniqueInput
    create: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput>
  }

  export type CandidateApplicationCreateManyTemplateInputEnvelope = {
    data: CandidateApplicationCreateManyTemplateInput | CandidateApplicationCreateManyTemplateInput[]
    skipDuplicates?: boolean
  }

  export type CandidateApplicationUpsertWithWhereUniqueWithoutTemplateInput = {
    where: CandidateApplicationWhereUniqueInput
    update: XOR<CandidateApplicationUpdateWithoutTemplateInput, CandidateApplicationUncheckedUpdateWithoutTemplateInput>
    create: XOR<CandidateApplicationCreateWithoutTemplateInput, CandidateApplicationUncheckedCreateWithoutTemplateInput>
  }

  export type CandidateApplicationUpdateWithWhereUniqueWithoutTemplateInput = {
    where: CandidateApplicationWhereUniqueInput
    data: XOR<CandidateApplicationUpdateWithoutTemplateInput, CandidateApplicationUncheckedUpdateWithoutTemplateInput>
  }

  export type CandidateApplicationUpdateManyWithWhereWithoutTemplateInput = {
    where: CandidateApplicationScalarWhereInput
    data: XOR<CandidateApplicationUpdateManyMutationInput, CandidateApplicationUncheckedUpdateManyWithoutTemplateInput>
  }

  export type CandidateApplicationScalarWhereInput = {
    AND?: CandidateApplicationScalarWhereInput | CandidateApplicationScalarWhereInput[]
    OR?: CandidateApplicationScalarWhereInput[]
    NOT?: CandidateApplicationScalarWhereInput | CandidateApplicationScalarWhereInput[]
    id?: StringFilter<"CandidateApplication"> | string
    templateId?: StringFilter<"CandidateApplication"> | string
    candidateName?: StringFilter<"CandidateApplication"> | string
    candidateEmail?: StringFilter<"CandidateApplication"> | string
    candidatePhone?: StringNullableFilter<"CandidateApplication"> | string | null
    linkedInUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeUrl?: StringNullableFilter<"CandidateApplication"> | string | null
    resumeText?: StringNullableFilter<"CandidateApplication"> | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFilter<"CandidateApplication"> | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFilter<"CandidateApplication"> | string
    accessTokenExpiresAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    status?: EnumCandidateApplicationStatusFilter<"CandidateApplication"> | $Enums.CandidateApplicationStatus
    scheduledAt?: DateTimeNullableFilter<"CandidateApplication"> | Date | string | null
    createdAt?: DateTimeFilter<"CandidateApplication"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateApplication"> | Date | string
  }

  export type InterviewTemplateCreateWithoutApplicationsInput = {
    id?: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack?: InterviewTemplateCreatetechStackInput | string[]
    requiredSkills?: InterviewTemplateCreaterequiredSkillsInput | string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: string | null
    systemInstructions?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewTemplateUncheckedCreateWithoutApplicationsInput = {
    id?: string
    ownerRole: $Enums.InterviewTemplateOwnerRole
    jobRole: string
    experienceLevel: string
    techStack?: InterviewTemplateCreatetechStackInput | string[]
    requiredSkills?: InterviewTemplateCreaterequiredSkillsInput | string[]
    durationMinutes: number
    difficultyLevel: string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: string | null
    systemInstructions?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewTemplateCreateOrConnectWithoutApplicationsInput = {
    where: InterviewTemplateWhereUniqueInput
    create: XOR<InterviewTemplateCreateWithoutApplicationsInput, InterviewTemplateUncheckedCreateWithoutApplicationsInput>
  }

  export type InterviewSessionCreateWithoutApplicationInput = {
    id?: string
    provider: string
    modelUsed?: string | null
    status?: $Enums.InterviewSessionStatus
    transcript: JsonNullValueInput | InputJsonValue
    evaluationEvents: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewSessionUncheckedCreateWithoutApplicationInput = {
    id?: string
    provider: string
    modelUsed?: string | null
    status?: $Enums.InterviewSessionStatus
    transcript: JsonNullValueInput | InputJsonValue
    evaluationEvents: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewSessionCreateOrConnectWithoutApplicationInput = {
    where: InterviewSessionWhereUniqueInput
    create: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
  }

  export type InterviewTemplateUpsertWithoutApplicationsInput = {
    update: XOR<InterviewTemplateUpdateWithoutApplicationsInput, InterviewTemplateUncheckedUpdateWithoutApplicationsInput>
    create: XOR<InterviewTemplateCreateWithoutApplicationsInput, InterviewTemplateUncheckedCreateWithoutApplicationsInput>
    where?: InterviewTemplateWhereInput
  }

  export type InterviewTemplateUpdateToOneWithWhereWithoutApplicationsInput = {
    where?: InterviewTemplateWhereInput
    data: XOR<InterviewTemplateUpdateWithoutApplicationsInput, InterviewTemplateUncheckedUpdateWithoutApplicationsInput>
  }

  export type InterviewTemplateUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewTemplateUncheckedUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerRole?: EnumInterviewTemplateOwnerRoleFieldUpdateOperationsInput | $Enums.InterviewTemplateOwnerRole
    jobRole?: StringFieldUpdateOperationsInput | string
    experienceLevel?: StringFieldUpdateOperationsInput | string
    techStack?: InterviewTemplateUpdatetechStackInput | string[]
    requiredSkills?: InterviewTemplateUpdaterequiredSkillsInput | string[]
    durationMinutes?: IntFieldUpdateOperationsInput | number
    difficultyLevel?: StringFieldUpdateOperationsInput | string
    advancedConfig?: NullableJsonNullValueInput | InputJsonValue
    interviewDescription?: NullableStringFieldUpdateOperationsInput | string | null
    systemInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionUpsertWithoutApplicationInput = {
    update: XOR<InterviewSessionUpdateWithoutApplicationInput, InterviewSessionUncheckedUpdateWithoutApplicationInput>
    create: XOR<InterviewSessionCreateWithoutApplicationInput, InterviewSessionUncheckedCreateWithoutApplicationInput>
    where?: InterviewSessionWhereInput
  }

  export type InterviewSessionUpdateToOneWithWhereWithoutApplicationInput = {
    where?: InterviewSessionWhereInput
    data: XOR<InterviewSessionUpdateWithoutApplicationInput, InterviewSessionUncheckedUpdateWithoutApplicationInput>
  }

  export type InterviewSessionUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewSessionUncheckedUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    modelUsed?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInterviewSessionStatusFieldUpdateOperationsInput | $Enums.InterviewSessionStatus
    transcript?: JsonNullValueInput | InputJsonValue
    evaluationEvents?: JsonNullValueInput | InputJsonValue
    finalReport?: NullableJsonNullValueInput | InputJsonValue
    referenceCards?: JsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateApplicationCreateWithoutSessionInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    template: InterviewTemplateCreateNestedOneWithoutApplicationsInput
  }

  export type CandidateApplicationUncheckedCreateWithoutSessionInput = {
    id?: string
    templateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateApplicationCreateOrConnectWithoutSessionInput = {
    where: CandidateApplicationWhereUniqueInput
    create: XOR<CandidateApplicationCreateWithoutSessionInput, CandidateApplicationUncheckedCreateWithoutSessionInput>
  }

  export type CandidateApplicationUpsertWithoutSessionInput = {
    update: XOR<CandidateApplicationUpdateWithoutSessionInput, CandidateApplicationUncheckedUpdateWithoutSessionInput>
    create: XOR<CandidateApplicationCreateWithoutSessionInput, CandidateApplicationUncheckedCreateWithoutSessionInput>
    where?: CandidateApplicationWhereInput
  }

  export type CandidateApplicationUpdateToOneWithWhereWithoutSessionInput = {
    where?: CandidateApplicationWhereInput
    data: XOR<CandidateApplicationUpdateWithoutSessionInput, CandidateApplicationUncheckedUpdateWithoutSessionInput>
  }

  export type CandidateApplicationUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: InterviewTemplateUpdateOneRequiredWithoutApplicationsNestedInput
  }

  export type CandidateApplicationUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUpdateWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUncheckedUpdateWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeChunkUncheckedUpdateManyWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateApplicationCreateManyTemplateInput = {
    id?: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string | null
    linkedInUrl?: string | null
    resumeUrl?: string | null
    resumeText?: string | null
    interviewPreference: $Enums.CandidateInterviewPreference
    accessTokenHash: string
    accessTokenExpiresAt: Date | string
    status?: $Enums.CandidateApplicationStatus
    scheduledAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateApplicationUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUpdateOneWithoutApplicationNestedInput
  }

  export type CandidateApplicationUncheckedUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: InterviewSessionUncheckedUpdateOneWithoutApplicationNestedInput
  }

  export type CandidateApplicationUncheckedUpdateManyWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateName?: StringFieldUpdateOperationsInput | string
    candidateEmail?: StringFieldUpdateOperationsInput | string
    candidatePhone?: NullableStringFieldUpdateOperationsInput | string | null
    linkedInUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    resumeText?: NullableStringFieldUpdateOperationsInput | string | null
    interviewPreference?: EnumCandidateInterviewPreferenceFieldUpdateOperationsInput | $Enums.CandidateInterviewPreference
    accessTokenHash?: StringFieldUpdateOperationsInput | string
    accessTokenExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCandidateApplicationStatusFieldUpdateOperationsInput | $Enums.CandidateApplicationStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use KnowledgeDocumentCountOutputTypeDefaultArgs instead
     */
    export type KnowledgeDocumentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KnowledgeDocumentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InterviewTemplateCountOutputTypeDefaultArgs instead
     */
    export type InterviewTemplateCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InterviewTemplateCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ContactSubmissionDefaultArgs instead
     */
    export type ContactSubmissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ContactSubmissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use JobSeekerSubmissionDefaultArgs instead
     */
    export type JobSeekerSubmissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = JobSeekerSubmissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseDefaultArgs instead
     */
    export type PurchaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FunnelEventDefaultArgs instead
     */
    export type FunnelEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FunnelEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use KnowledgeDocumentDefaultArgs instead
     */
    export type KnowledgeDocumentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KnowledgeDocumentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use KnowledgeChunkDefaultArgs instead
     */
    export type KnowledgeChunkArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KnowledgeChunkDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChatConversationDefaultArgs instead
     */
    export type ChatConversationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChatConversationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InterviewTemplateDefaultArgs instead
     */
    export type InterviewTemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InterviewTemplateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CandidateApplicationDefaultArgs instead
     */
    export type CandidateApplicationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CandidateApplicationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InterviewSessionDefaultArgs instead
     */
    export type InterviewSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InterviewSessionDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}