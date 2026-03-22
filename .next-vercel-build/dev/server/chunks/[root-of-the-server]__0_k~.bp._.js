module.exports = [
"[project]/node_modules/is-node-process/lib/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNodeProcess",
    ()=>isNodeProcess
]);
// src/index.ts
function isNodeProcess() {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
        return true;
    }
    if (typeof process !== "undefined") {
        const type = process.type;
        if (type === "renderer" || type === "worker") {
            return false;
        }
        return !!(process.versions && process.versions.node);
    }
    return false;
}
;
}),
"[project]/node_modules/is-buffer/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ module.exports = function isBuffer(obj) {
    return obj != null && obj.constructor != null && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
};
}),
"[project]/node_modules/async-retry/node_modules/retry/lib/retry_operation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

function RetryOperation(timeouts, options) {
    // Compatibility for the old (timeouts, retryForever) signature
    if (typeof options === 'boolean') {
        options = {
            forever: options
        };
    }
    this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
    this._timeouts = timeouts;
    this._options = options || {};
    this._maxRetryTime = options && options.maxRetryTime || Infinity;
    this._fn = null;
    this._errors = [];
    this._attempts = 1;
    this._operationTimeout = null;
    this._operationTimeoutCb = null;
    this._timeout = null;
    this._operationStart = null;
    this._timer = null;
    if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
    }
}
module.exports = RetryOperation;
RetryOperation.prototype.reset = function() {
    this._attempts = 1;
    this._timeouts = this._originalTimeouts.slice(0);
};
RetryOperation.prototype.stop = function() {
    if (this._timeout) {
        clearTimeout(this._timeout);
    }
    if (this._timer) {
        clearTimeout(this._timer);
    }
    this._timeouts = [];
    this._cachedTimeouts = null;
};
RetryOperation.prototype.retry = function(err) {
    if (this._timeout) {
        clearTimeout(this._timeout);
    }
    if (!err) {
        return false;
    }
    var currentTime = new Date().getTime();
    if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error('RetryOperation timeout occurred'));
        return false;
    }
    this._errors.push(err);
    var timeout = this._timeouts.shift();
    if (timeout === undefined) {
        if (this._cachedTimeouts) {
            // retry forever, only keep last error
            this._errors.splice(0, this._errors.length - 1);
            timeout = this._cachedTimeouts.slice(-1);
        } else {
            return false;
        }
    }
    var self = this;
    this._timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
            self._timeout = setTimeout(function() {
                self._operationTimeoutCb(self._attempts);
            }, self._operationTimeout);
            if (self._options.unref) {
                self._timeout.unref();
            }
        }
        self._fn(self._attempts);
    }, timeout);
    if (this._options.unref) {
        this._timer.unref();
    }
    return true;
};
RetryOperation.prototype.attempt = function(fn, timeoutOps) {
    this._fn = fn;
    if (timeoutOps) {
        if (timeoutOps.timeout) {
            this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
            this._operationTimeoutCb = timeoutOps.cb;
        }
    }
    var self = this;
    if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
            self._operationTimeoutCb();
        }, self._operationTimeout);
    }
    this._operationStart = new Date().getTime();
    this._fn(this._attempts);
};
RetryOperation.prototype.try = function(fn) {
    console.log('Using RetryOperation.try() is deprecated');
    this.attempt(fn);
};
RetryOperation.prototype.start = function(fn) {
    console.log('Using RetryOperation.start() is deprecated');
    this.attempt(fn);
};
RetryOperation.prototype.start = RetryOperation.prototype.try;
RetryOperation.prototype.errors = function() {
    return this._errors;
};
RetryOperation.prototype.attempts = function() {
    return this._attempts;
};
RetryOperation.prototype.mainError = function() {
    if (this._errors.length === 0) {
        return null;
    }
    var counts = {};
    var mainError = null;
    var mainErrorCount = 0;
    for(var i = 0; i < this._errors.length; i++){
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
            mainError = error;
            mainErrorCount = count;
        }
    }
    return mainError;
};
}),
"[project]/node_modules/async-retry/node_modules/retry/lib/retry.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var RetryOperation = __turbopack_context__.r("[project]/node_modules/async-retry/node_modules/retry/lib/retry_operation.js [app-route] (ecmascript)");
exports.operation = function(options) {
    var timeouts = exports.timeouts(options);
    return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
    });
};
exports.timeouts = function(options) {
    if (options instanceof Array) {
        return [].concat(options);
    }
    var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1000,
        maxTimeout: Infinity,
        randomize: false
    };
    for(var key in options){
        opts[key] = options[key];
    }
    if (opts.minTimeout > opts.maxTimeout) {
        throw new Error('minTimeout is greater than maxTimeout');
    }
    var timeouts = [];
    for(var i = 0; i < opts.retries; i++){
        timeouts.push(this.createTimeout(i, opts));
    }
    if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
    }
    // sort the array numerically ascending
    timeouts.sort(function(a, b) {
        return a - b;
    });
    return timeouts;
};
exports.createTimeout = function(attempt, opts) {
    var random = opts.randomize ? Math.random() + 1 : 1;
    var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
    timeout = Math.min(timeout, opts.maxTimeout);
    return timeout;
};
exports.wrap = function(obj, options, methods) {
    if (options instanceof Array) {
        methods = options;
        options = null;
    }
    if (!methods) {
        methods = [];
        for(var key in obj){
            if (typeof obj[key] === 'function') {
                methods.push(key);
            }
        }
    }
    for(var i = 0; i < methods.length; i++){
        var method = methods[i];
        var original = obj[method];
        obj[method] = (function retryWrapper(original) {
            var op = exports.operation(options);
            var args = Array.prototype.slice.call(arguments, 1);
            var callback = args.pop();
            args.push(function(err) {
                if (op.retry(err)) {
                    return;
                }
                if (err) {
                    arguments[0] = op.mainError();
                }
                callback.apply(this, arguments);
            });
            op.attempt(function() {
                original.apply(obj, args);
            });
        }).bind(obj, original);
        obj[method].options = options;
    }
};
}),
"[project]/node_modules/async-retry/node_modules/retry/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/async-retry/node_modules/retry/lib/retry.js [app-route] (ecmascript)");
}),
"[project]/node_modules/async-retry/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// Packages
var retrier = __turbopack_context__.r("[project]/node_modules/async-retry/node_modules/retry/index.js [app-route] (ecmascript)");
function retry(fn, opts) {
    function run(resolve, reject) {
        var options = opts || {};
        var op;
        // Default `randomize` to true
        if (!('randomize' in options)) {
            options.randomize = true;
        }
        op = retrier.operation(options);
        // We allow the user to abort retrying
        // this makes sense in the cases where
        // knowledge is obtained that retrying
        // would be futile (e.g.: auth errors)
        function bail(err) {
            reject(err || new Error('Aborted'));
        }
        function onError(err, num) {
            if (err.bail) {
                bail(err);
                return;
            }
            if (!op.retry(err)) {
                reject(op.mainError());
            } else if (options.onRetry) {
                options.onRetry(err, num);
            }
        }
        function runAttempt(num) {
            var val;
            try {
                val = fn(bail, num);
            } catch (err) {
                onError(err, num);
                return;
            }
            Promise.resolve(val).then(resolve).catch(function catchIt(err) {
                onError(err, num);
            });
        }
        op.attempt(runAttempt);
    }
    return new Promise(run);
}
module.exports = retry;
}),
"[project]/node_modules/throttleit/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

function throttle(function_, wait) {
    if (typeof function_ !== 'function') {
        throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof function_}\`.`);
    }
    // TODO: Add `wait` validation too in the next major version.
    let timeoutId;
    let lastCallTime = 0;
    return function throttled(...arguments_) {
        clearTimeout(timeoutId);
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;
        const delayForNextCall = wait - timeSinceLastCall;
        if (delayForNextCall <= 0) {
            lastCallTime = now;
            function_.apply(this, arguments_);
        } else {
            timeoutId = setTimeout(()=>{
                lastCallTime = Date.now();
                function_.apply(this, arguments_);
            }, delayForNextCall);
        }
    };
}
module.exports = throttle;
}),
"[project]/node_modules/@vercel/blob/dist/chunk-UG4PCJMA.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlobAccessError",
    ()=>BlobAccessError,
    "BlobClientTokenExpiredError",
    ()=>BlobClientTokenExpiredError,
    "BlobContentTypeNotAllowedError",
    ()=>BlobContentTypeNotAllowedError,
    "BlobError",
    ()=>BlobError,
    "BlobFileTooLargeError",
    ()=>BlobFileTooLargeError,
    "BlobNotFoundError",
    ()=>BlobNotFoundError,
    "BlobPathnameMismatchError",
    ()=>BlobPathnameMismatchError,
    "BlobPreconditionFailedError",
    ()=>BlobPreconditionFailedError,
    "BlobRequestAbortedError",
    ()=>BlobRequestAbortedError,
    "BlobServiceNotAvailable",
    ()=>BlobServiceNotAvailable,
    "BlobServiceRateLimited",
    ()=>BlobServiceRateLimited,
    "BlobStoreNotFoundError",
    ()=>BlobStoreNotFoundError,
    "BlobStoreSuspendedError",
    ()=>BlobStoreSuspendedError,
    "BlobUnknownError",
    ()=>BlobUnknownError,
    "MAXIMUM_PATHNAME_LENGTH",
    ()=>MAXIMUM_PATHNAME_LENGTH,
    "createCompleteMultipartUploadMethod",
    ()=>createCompleteMultipartUploadMethod,
    "createCreateMultipartUploadMethod",
    ()=>createCreateMultipartUploadMethod,
    "createCreateMultipartUploaderMethod",
    ()=>createCreateMultipartUploaderMethod,
    "createFolder",
    ()=>createFolder,
    "createPutMethod",
    ()=>createPutMethod,
    "createUploadPartMethod",
    ()=>createUploadPartMethod,
    "disallowedPathnameCharacters",
    ()=>disallowedPathnameCharacters,
    "getDownloadUrl",
    ()=>getDownloadUrl,
    "getTokenFromOptionsOrEnv",
    ()=>getTokenFromOptionsOrEnv,
    "requestApi",
    ()=>requestApi
]);
// src/helpers.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$node$2d$process$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/is-node-process/lib/index.mjs [app-route] (ecmascript)");
// src/multipart/helpers.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/is-buffer/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
// src/api.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$async$2d$retry$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/async-retry/lib/index.js [app-route] (ecmascript)");
// src/fetch.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
// src/multipart/upload.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$throttleit$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/throttleit/index.js [app-route] (ecmascript)");
;
;
;
var supportsNewBlobFromArrayBuffer = new Promise((resolve)=>{
    try {
        const helloAsArrayBuffer = new Uint8Array([
            104,
            101,
            108,
            108,
            111
        ]);
        const blob = new Blob([
            helloAsArrayBuffer
        ]);
        blob.text().then((text)=>{
            resolve(text === "hello");
        }).catch(()=>{
            resolve(false);
        });
    } catch  {
        resolve(false);
    }
});
async function toReadableStream(value) {
    if (value instanceof ReadableStream) {
        return value;
    }
    if (value instanceof Blob) {
        return value.stream();
    }
    if (isNodeJsReadableStream(value)) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"].toWeb(value);
    }
    let streamValue;
    if (value instanceof ArrayBuffer) {
        streamValue = new Uint8Array(value);
    } else if (isNodeJsBuffer(value)) {
        streamValue = value;
    } else {
        streamValue = stringToUint8Array(value);
    }
    if (await supportsNewBlobFromArrayBuffer) {
        return new Blob([
            streamValue
        ]).stream();
    }
    return new ReadableStream({
        start (controller) {
            controller.enqueue(streamValue);
            controller.close();
        }
    });
}
function isNodeJsReadableStream(value) {
    return typeof value === "object" && typeof value.pipe === "function" && value.readable && typeof value._read === "function" && // @ts-expect-error _readableState does exists on Readable
    typeof value._readableState === "object";
}
function stringToUint8Array(s) {
    const enc = new TextEncoder();
    return enc.encode(s);
}
function isNodeJsBuffer(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(value);
}
// src/bytes.ts
var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;
var map = {
    b: 1,
    kb: 1 << 10,
    mb: 1 << 20,
    gb: 1 << 30,
    tb: 1024 ** 4,
    pb: 1024 ** 5
};
function bytes(val) {
    if (typeof val === "number" && !Number.isNaN(val)) {
        return val;
    }
    if (typeof val !== "string") {
        return null;
    }
    const results = parseRegExp.exec(val);
    let floatValue;
    let unit = "b";
    if (!results) {
        floatValue = parseInt(val, 10);
    } else {
        const [, res, , , unitMatch] = results;
        if (!res) {
            return null;
        }
        floatValue = parseFloat(res);
        if (unitMatch) {
            unit = unitMatch.toLowerCase();
        }
    }
    if (Number.isNaN(floatValue)) {
        return null;
    }
    return Math.floor(map[unit] * floatValue);
}
// src/helpers.ts
var defaultVercelBlobApiUrl = "https://vercel.com/api/blob";
function getTokenFromOptionsOrEnv(options) {
    if (options == null ? void 0 : options.token) {
        return options.token;
    }
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        return process.env.BLOB_READ_WRITE_TOKEN;
    }
    throw new BlobError("No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token` option to your calls.");
}
var BlobError = class extends Error {
    constructor(message){
        super(`Vercel Blob: ${message}`);
    }
};
function getDownloadUrl(blobUrl) {
    const url = new URL(blobUrl);
    url.searchParams.set("download", "1");
    return url.toString();
}
function isPlainObject(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
var disallowedPathnameCharacters = [
    "//"
];
var supportsRequestStreams = (()=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$node$2d$process$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNodeProcess"])()) {
        return true;
    }
    const apiUrl = getApiUrl();
    if (apiUrl.startsWith("http://localhost")) {
        return false;
    }
    let duplexAccessed = false;
    const hasContentType = new Request(getApiUrl(), {
        body: new ReadableStream(),
        method: "POST",
        // @ts-expect-error -- TypeScript doesn't yet have duplex but it's in the spec: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1729
        get duplex () {
            duplexAccessed = true;
            return "half";
        }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
})();
function getApiUrl(pathname = "") {
    let baseUrl = null;
    try {
        baseUrl = process.env.VERCEL_BLOB_API_URL || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL;
    } catch  {}
    return `${baseUrl || defaultVercelBlobApiUrl}${pathname}`;
}
var TEXT_ENCODER = typeof TextEncoder === "function" ? new TextEncoder() : null;
function computeBodyLength(body) {
    if (!body) {
        return 0;
    }
    if (typeof body === "string") {
        if (TEXT_ENCODER) {
            return TEXT_ENCODER.encode(body).byteLength;
        }
        return new Blob([
            body
        ]).size;
    }
    if ("byteLength" in body && typeof body.byteLength === "number") {
        return body.byteLength;
    }
    if ("size" in body && typeof body.size === "number") {
        return body.size;
    }
    return 0;
}
var createChunkTransformStream = (chunkSize, onProgress)=>{
    let buffer = new Uint8Array(0);
    return new TransformStream({
        transform (chunk, controller) {
            queueMicrotask(()=>{
                const newBuffer = new Uint8Array(buffer.length + chunk.byteLength);
                newBuffer.set(buffer);
                newBuffer.set(new Uint8Array(chunk), buffer.length);
                buffer = newBuffer;
                while(buffer.length >= chunkSize){
                    const newChunk = buffer.slice(0, chunkSize);
                    controller.enqueue(newChunk);
                    onProgress == null ? void 0 : onProgress(newChunk.byteLength);
                    buffer = buffer.slice(chunkSize);
                }
            });
        },
        flush (controller) {
            queueMicrotask(()=>{
                if (buffer.length > 0) {
                    controller.enqueue(buffer);
                    onProgress == null ? void 0 : onProgress(buffer.byteLength);
                }
            });
        }
    });
};
function isReadableStream(value) {
    return globalThis.ReadableStream && // TODO: Can be removed once Node.js 16 is no more required internally
    value instanceof ReadableStream;
}
function isStream(value) {
    if (isReadableStream(value)) {
        return true;
    }
    if (isNodeJsReadableStream(value)) {
        return true;
    }
    return false;
}
;
// src/debug.ts
var debugIsActive = false;
var _a, _b;
try {
    if (((_a = process.env.DEBUG) == null ? void 0 : _a.includes("blob")) || ((_b = process.env.NEXT_PUBLIC_DEBUG) == null ? void 0 : _b.includes("blob"))) {
        debugIsActive = true;
    }
} catch  {}
function debug(message, ...args) {
    if (debugIsActive) {
        console.debug(`vercel-blob: ${message}`, ...args);
    }
}
// src/dom-exception.ts
var _a2;
var DOMException2 = (_a2 = globalThis.DOMException) != null ? _a2 : (()=>{
    try {
        atob("~");
    } catch (err) {
        return Object.getPrototypeOf(err).constructor;
    }
})();
// src/is-network-error.ts
var objectToString = Object.prototype.toString;
var isError = (value)=>objectToString.call(value) === "[object Error]";
var errorMessages = /* @__PURE__ */ new Set([
    "network error",
    // Chrome
    "Failed to fetch",
    // Chrome
    "NetworkError when attempting to fetch resource.",
    // Firefox
    "The Internet connection appears to be offline.",
    // Safari 16
    "Load failed",
    // Safari 17+
    "Network request failed",
    // `cross-fetch`
    "fetch failed",
    // Undici (Node.js)
    "terminated"
]);
function isNetworkError(error) {
    const isValid = error && isError(error) && error.name === "TypeError" && typeof error.message === "string";
    if (!isValid) {
        return false;
    }
    if (error.message === "Load failed") {
        return error.stack === void 0;
    }
    return errorMessages.has(error.message);
}
;
var hasFetch = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"] === "function";
var hasFetchWithUploadProgress = hasFetch && supportsRequestStreams;
var CHUNK_SIZE = 64 * 1024;
var blobFetch = async ({ input, init, onUploadProgress })=>{
    debug("using fetch");
    let body;
    if (init.body) {
        if (onUploadProgress) {
            const stream = await toReadableStream(init.body);
            let loaded = 0;
            const chunkTransformStream = createChunkTransformStream(CHUNK_SIZE, (newLoaded)=>{
                loaded += newLoaded;
                onUploadProgress(loaded);
            });
            body = stream.pipeThrough(chunkTransformStream);
        } else {
            body = init.body;
        }
    }
    const duplex = supportsRequestStreams && body && isStream(body) ? "half" : void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"])(input, // @ts-expect-error -- Blob and Nodejs Blob are triggering type errors, fine with it
    {
        ...init,
        ...init.body ? {
            body
        } : {},
        duplex
    });
};
// src/xhr.ts
var hasXhr = typeof XMLHttpRequest !== "undefined";
var blobXhr = async ({ input, init, onUploadProgress })=>{
    debug("using xhr");
    let body = null;
    if (init.body) {
        if (isReadableStream(init.body)) {
            body = await new Response(init.body).blob();
        } else {
            body = init.body;
        }
    }
    return new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open(init.method || "GET", input.toString(), true);
        if (onUploadProgress) {
            xhr.upload.addEventListener("progress", (event)=>{
                if (event.lengthComputable) {
                    onUploadProgress(event.loaded);
                }
            });
        }
        xhr.onload = ()=>{
            var _a3;
            if ((_a3 = init.signal) == null ? void 0 : _a3.aborted) {
                reject(new DOMException("The user aborted the request.", "AbortError"));
                return;
            }
            const headers = new Headers();
            const rawHeaders = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
            rawHeaders.forEach((line)=>{
                const parts = line.split(": ");
                const key = parts.shift();
                const value = parts.join(": ");
                if (key) headers.set(key.toLowerCase(), value);
            });
            const response = new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers
            });
            resolve(response);
        };
        xhr.onerror = ()=>{
            reject(new TypeError("Network request failed"));
        };
        xhr.ontimeout = ()=>{
            reject(new TypeError("Network request timed out"));
        };
        xhr.onabort = ()=>{
            reject(new DOMException("The user aborted a request.", "AbortError"));
        };
        if (init.headers) {
            const headers = new Headers(init.headers);
            headers.forEach((value, key)=>{
                xhr.setRequestHeader(key, value);
            });
        }
        if (init.signal) {
            init.signal.addEventListener("abort", ()=>{
                xhr.abort();
            });
            if (init.signal.aborted) {
                xhr.abort();
                return;
            }
        }
        xhr.send(body);
    });
};
// src/request.ts
var blobRequest = async ({ input, init, onUploadProgress })=>{
    if (onUploadProgress) {
        if (hasFetchWithUploadProgress) {
            return blobFetch({
                input,
                init,
                onUploadProgress
            });
        }
        if (hasXhr) {
            return blobXhr({
                input,
                init,
                onUploadProgress
            });
        }
    }
    if (hasFetch) {
        return blobFetch({
            input,
            init
        });
    }
    if (hasXhr) {
        return blobXhr({
            input,
            init
        });
    }
    throw new Error("No request implementation available");
};
// src/api.ts
var MAXIMUM_PATHNAME_LENGTH = 950;
var BlobAccessError = class extends BlobError {
    constructor(){
        super("Access denied, please provide a valid token for this resource.");
    }
};
var BlobContentTypeNotAllowedError = class extends BlobError {
    constructor(message){
        super(`Content type mismatch, ${message}.`);
    }
};
var BlobPathnameMismatchError = class extends BlobError {
    constructor(message){
        super(`Pathname mismatch, ${message}. Check the pathname used in upload() or put() matches the one from the client token.`);
    }
};
var BlobClientTokenExpiredError = class extends BlobError {
    constructor(){
        super("Client token has expired.");
    }
};
var BlobFileTooLargeError = class extends BlobError {
    constructor(message){
        super(`File is too large, ${message}.`);
    }
};
var BlobStoreNotFoundError = class extends BlobError {
    constructor(){
        super("This store does not exist.");
    }
};
var BlobStoreSuspendedError = class extends BlobError {
    constructor(){
        super("This store has been suspended.");
    }
};
var BlobUnknownError = class extends BlobError {
    constructor(){
        super("Unknown error, please visit https://vercel.com/help.");
    }
};
var BlobNotFoundError = class extends BlobError {
    constructor(){
        super("The requested blob does not exist");
    }
};
var BlobServiceNotAvailable = class extends BlobError {
    constructor(){
        super("The blob service is currently not available. Please try again.");
    }
};
var BlobServiceRateLimited = class extends BlobError {
    constructor(seconds){
        super(`Too many requests please lower the number of concurrent requests ${seconds ? ` - try again in ${seconds} seconds` : ""}.`);
        this.retryAfter = seconds != null ? seconds : 0;
    }
};
var BlobRequestAbortedError = class extends BlobError {
    constructor(){
        super("The request was aborted.");
    }
};
var BlobPreconditionFailedError = class extends BlobError {
    constructor(){
        super("Precondition failed: ETag mismatch.");
    }
};
var BLOB_API_VERSION = 12;
function getApiVersion() {
    let versionOverride = null;
    try {
        versionOverride = process.env.VERCEL_BLOB_API_VERSION_OVERRIDE || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_VERSION_OVERRIDE;
    } catch  {}
    return `${versionOverride != null ? versionOverride : BLOB_API_VERSION}`;
}
function getRetries() {
    try {
        const retries = process.env.VERCEL_BLOB_RETRIES || "10";
        return parseInt(retries, 10);
    } catch  {
        return 10;
    }
}
function createBlobServiceRateLimited(response) {
    const retryAfter = response.headers.get("retry-after");
    return new BlobServiceRateLimited(retryAfter ? parseInt(retryAfter, 10) : void 0);
}
async function getBlobError(response) {
    var _a3, _b2, _c;
    let code;
    let message;
    try {
        const data = await response.json();
        code = (_b2 = (_a3 = data.error) == null ? void 0 : _a3.code) != null ? _b2 : "unknown_error";
        message = (_c = data.error) == null ? void 0 : _c.message;
    } catch  {
        code = "unknown_error";
    }
    if ((message == null ? void 0 : message.includes("contentType")) && message.includes("is not allowed")) {
        code = "content_type_not_allowed";
    }
    if ((message == null ? void 0 : message.includes('"pathname"')) && message.includes("does not match the token payload")) {
        code = "client_token_pathname_mismatch";
    }
    if (message === "Token expired") {
        code = "client_token_expired";
    }
    if (message == null ? void 0 : message.includes("the file length cannot be greater than")) {
        code = "file_too_large";
    }
    let error;
    switch(code){
        case "store_suspended":
            error = new BlobStoreSuspendedError();
            break;
        case "forbidden":
            error = new BlobAccessError();
            break;
        case "content_type_not_allowed":
            error = new BlobContentTypeNotAllowedError(message);
            break;
        case "client_token_pathname_mismatch":
            error = new BlobPathnameMismatchError(message);
            break;
        case "client_token_expired":
            error = new BlobClientTokenExpiredError();
            break;
        case "file_too_large":
            error = new BlobFileTooLargeError(message);
            break;
        case "not_found":
            error = new BlobNotFoundError();
            break;
        case "store_not_found":
            error = new BlobStoreNotFoundError();
            break;
        case "bad_request":
            error = new BlobError(message != null ? message : "Bad request");
            break;
        case "service_unavailable":
            error = new BlobServiceNotAvailable();
            break;
        case "rate_limited":
            error = createBlobServiceRateLimited(response);
            break;
        case "precondition_failed":
            error = new BlobPreconditionFailedError();
            break;
        case "unknown_error":
        case "not_allowed":
        default:
            error = new BlobUnknownError();
            break;
    }
    return {
        code,
        error
    };
}
async function requestApi(pathname, init, commandOptions) {
    const apiVersion = getApiVersion();
    const token = getTokenFromOptionsOrEnv(commandOptions);
    const extraHeaders = getProxyThroughAlternativeApiHeaderFromEnv();
    const [, , , storeId = ""] = token.split("_");
    const requestId = `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    let retryCount = 0;
    let bodyLength = 0;
    let totalLoaded = 0;
    const sendBodyLength = (commandOptions == null ? void 0 : commandOptions.onUploadProgress) || shouldUseXContentLength();
    if (init.body && // 1. For upload progress we always need to know the total size of the body
    // 2. In development we need the header for put() to work correctly when passing a stream
    sendBodyLength) {
        bodyLength = computeBodyLength(init.body);
    }
    if (commandOptions == null ? void 0 : commandOptions.onUploadProgress) {
        commandOptions.onUploadProgress({
            loaded: 0,
            total: bodyLength,
            percentage: 0
        });
    }
    const apiResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$async$2d$retry$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(async (bail)=>{
        let res;
        try {
            res = await blobRequest({
                input: getApiUrl(pathname),
                init: {
                    ...init,
                    headers: {
                        "x-api-blob-request-id": requestId,
                        "x-api-blob-request-attempt": String(retryCount),
                        "x-api-version": apiVersion,
                        ...sendBodyLength ? {
                            "x-content-length": String(bodyLength)
                        } : {},
                        authorization: `Bearer ${token}`,
                        ...extraHeaders,
                        ...init.headers
                    }
                },
                onUploadProgress: (commandOptions == null ? void 0 : commandOptions.onUploadProgress) ? (loaded)=>{
                    var _a3;
                    const total = bodyLength !== 0 ? bodyLength : loaded;
                    totalLoaded = loaded;
                    const percentage = bodyLength > 0 ? Number((loaded / total * 100).toFixed(2)) : 0;
                    if (percentage === 100 && bodyLength > 0) {
                        return;
                    }
                    (_a3 = commandOptions.onUploadProgress) == null ? void 0 : _a3.call(commandOptions, {
                        loaded,
                        // When passing a stream to put(), we have no way to know the total size of the body.
                        // Instead of defining total as total?: number we decided to set the total to the currently
                        // loaded number. This is not inaccurate and way more practical for DX.
                        // Passing down a stream to put() is very rare
                        total,
                        percentage
                    });
                } : void 0
            });
        } catch (error2) {
            if (error2 instanceof DOMException2 && error2.name === "AbortError") {
                bail(new BlobRequestAbortedError());
                return;
            }
            if (isNetworkError(error2)) {
                throw error2;
            }
            if (error2 instanceof TypeError) {
                bail(error2);
                return;
            }
            throw error2;
        }
        if (res.ok) {
            return res;
        }
        const { code, error } = await getBlobError(res);
        if (code === "unknown_error" || code === "service_unavailable" || code === "internal_server_error") {
            throw error;
        }
        bail(error);
    }, {
        retries: getRetries(),
        onRetry: (error)=>{
            if (error instanceof Error) {
                debug(`retrying API request to ${pathname}`, error.message);
            }
            retryCount = retryCount + 1;
        }
    });
    if (!apiResponse) {
        throw new BlobUnknownError();
    }
    if (commandOptions == null ? void 0 : commandOptions.onUploadProgress) {
        commandOptions.onUploadProgress({
            loaded: totalLoaded,
            total: totalLoaded,
            percentage: 100
        });
    }
    return await apiResponse.json();
}
function getProxyThroughAlternativeApiHeaderFromEnv() {
    const extraHeaders = {};
    try {
        if ("VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API" in process.env && process.env.VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API !== void 0) {
            extraHeaders["x-proxy-through-alternative-api"] = process.env.VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API;
        } else if ("NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API" in process.env && process.env.NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API !== void 0) {
            extraHeaders["x-proxy-through-alternative-api"] = process.env.NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API;
        }
    } catch  {}
    return extraHeaders;
}
function shouldUseXContentLength() {
    try {
        return process.env.VERCEL_BLOB_USE_X_CONTENT_LENGTH === "1";
    } catch  {
        return false;
    }
}
// src/put-helpers.ts
var putOptionHeaderMap = {
    cacheControlMaxAge: "x-cache-control-max-age",
    addRandomSuffix: "x-add-random-suffix",
    allowOverwrite: "x-allow-overwrite",
    contentType: "x-content-type",
    access: "x-vercel-blob-access",
    ifMatch: "x-if-match"
};
function createPutHeaders(allowedOptions, options) {
    const headers = {};
    headers[putOptionHeaderMap.access] = options.access;
    if (allowedOptions.includes("contentType") && options.contentType) {
        headers[putOptionHeaderMap.contentType] = options.contentType;
    }
    if (allowedOptions.includes("addRandomSuffix") && options.addRandomSuffix !== void 0) {
        headers[putOptionHeaderMap.addRandomSuffix] = options.addRandomSuffix ? "1" : "0";
    }
    if (allowedOptions.includes("allowOverwrite") && options.allowOverwrite !== void 0) {
        headers[putOptionHeaderMap.allowOverwrite] = options.allowOverwrite ? "1" : "0";
    }
    if (allowedOptions.includes("cacheControlMaxAge") && options.cacheControlMaxAge !== void 0) {
        headers[putOptionHeaderMap.cacheControlMaxAge] = options.cacheControlMaxAge.toString();
    }
    if (allowedOptions.includes("ifMatch") && options.ifMatch) {
        headers[putOptionHeaderMap.ifMatch] = options.ifMatch;
    }
    return headers;
}
async function createPutOptions({ pathname, options, extraChecks, getToken }) {
    if (!pathname) {
        throw new BlobError("pathname is required");
    }
    if (pathname.length > MAXIMUM_PATHNAME_LENGTH) {
        throw new BlobError(`pathname is too long, maximum length is ${MAXIMUM_PATHNAME_LENGTH}`);
    }
    for (const invalidCharacter of disallowedPathnameCharacters){
        if (pathname.includes(invalidCharacter)) {
            throw new BlobError(`pathname cannot contain "${invalidCharacter}", please encode it if needed`);
        }
    }
    if (!options) {
        throw new BlobError("missing options, see usage");
    }
    if (options.access !== "public" && options.access !== "private") {
        throw new BlobError('access must be "private" or "public", see https://vercel.com/docs/vercel-blob');
    }
    if (extraChecks) {
        extraChecks(options);
    }
    if (getToken) {
        options.token = await getToken(pathname, options);
    }
    return options;
}
// src/multipart/complete.ts
function createCompleteMultipartUploadMethod({ allowedOptions, getToken, extraChecks }) {
    return async (pathname, parts, optionsInput)=>{
        const options = await createPutOptions({
            pathname,
            options: optionsInput,
            extraChecks,
            getToken
        });
        const headers = createPutHeaders(allowedOptions, options);
        return completeMultipartUpload({
            uploadId: options.uploadId,
            key: options.key,
            pathname,
            headers,
            options,
            parts
        });
    };
}
async function completeMultipartUpload({ uploadId, key, pathname, parts, headers, options }) {
    const params = new URLSearchParams({
        pathname
    });
    try {
        const response = await requestApi(`/mpu?${params.toString()}`, {
            method: "POST",
            headers: {
                ...headers,
                "content-type": "application/json",
                "x-mpu-action": "complete",
                "x-mpu-upload-id": uploadId,
                // key can be any utf8 character so we need to encode it as HTTP headers can only be us-ascii
                // https://www.rfc-editor.org/rfc/rfc7230#swection-3.2.4
                "x-mpu-key": encodeURIComponent(key)
            },
            body: JSON.stringify(parts),
            signal: options.abortSignal
        }, options);
        debug("mpu: complete", response);
        return response;
    } catch (error) {
        if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
            throw new BlobServiceNotAvailable();
        } else {
            throw error;
        }
    }
}
// src/multipart/create.ts
function createCreateMultipartUploadMethod({ allowedOptions, getToken, extraChecks }) {
    return async (pathname, optionsInput)=>{
        const options = await createPutOptions({
            pathname,
            options: optionsInput,
            extraChecks,
            getToken
        });
        const headers = createPutHeaders(allowedOptions, options);
        const createMultipartUploadResponse = await createMultipartUpload(pathname, headers, options);
        return {
            key: createMultipartUploadResponse.key,
            uploadId: createMultipartUploadResponse.uploadId
        };
    };
}
async function createMultipartUpload(pathname, headers, options) {
    debug("mpu: create", "pathname:", pathname);
    const params = new URLSearchParams({
        pathname
    });
    try {
        const response = await requestApi(`/mpu?${params.toString()}`, {
            method: "POST",
            headers: {
                ...headers,
                "x-mpu-action": "create"
            },
            signal: options.abortSignal
        }, options);
        debug("mpu: create", response);
        return response;
    } catch (error) {
        if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
            throw new BlobServiceNotAvailable();
        }
        throw error;
    }
}
;
function createUploadPartMethod({ allowedOptions, getToken, extraChecks }) {
    return async (pathname, body, optionsInput)=>{
        const options = await createPutOptions({
            pathname,
            options: optionsInput,
            extraChecks,
            getToken
        });
        const headers = createPutHeaders(allowedOptions, options);
        if (isPlainObject(body)) {
            throw new BlobError("Body must be a string, buffer or stream. You sent a plain JavaScript object, double check what you're trying to upload.");
        }
        const result = await uploadPart({
            uploadId: options.uploadId,
            key: options.key,
            pathname,
            part: {
                blob: body,
                partNumber: options.partNumber
            },
            headers,
            options
        });
        return {
            etag: result.etag,
            partNumber: options.partNumber
        };
    };
}
async function uploadPart({ uploadId, key, pathname, headers, options, internalAbortController = new AbortController(), part }) {
    var _a3, _b2, _c;
    const params = new URLSearchParams({
        pathname
    });
    const responsePromise = requestApi(`/mpu?${params.toString()}`, {
        signal: internalAbortController.signal,
        method: "POST",
        headers: {
            ...headers,
            "x-mpu-action": "upload",
            "x-mpu-key": encodeURIComponent(key),
            "x-mpu-upload-id": uploadId,
            "x-mpu-part-number": part.partNumber.toString()
        },
        // weird things between undici types and native fetch types
        body: part.blob
    }, options);
    function handleAbort() {
        internalAbortController.abort();
    }
    if ((_a3 = options.abortSignal) == null ? void 0 : _a3.aborted) {
        handleAbort();
    } else {
        (_b2 = options.abortSignal) == null ? void 0 : _b2.addEventListener("abort", handleAbort);
    }
    const response = await responsePromise;
    (_c = options.abortSignal) == null ? void 0 : _c.removeEventListener("abort", handleAbort);
    return response;
}
var maxConcurrentUploads = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 8;
var partSizeInBytes = 8 * 1024 * 1024;
var maxBytesInMemory = maxConcurrentUploads * partSizeInBytes * 2;
function uploadAllParts({ uploadId, key, pathname, stream, headers, options, totalToLoad }) {
    debug("mpu: upload init", "key:", key);
    const internalAbortController = new AbortController();
    return new Promise((resolve, reject)=>{
        const partsToUpload = [];
        const completedParts = [];
        const reader = stream.getReader();
        let activeUploads = 0;
        let reading = false;
        let currentPartNumber = 1;
        let rejected = false;
        let currentBytesInMemory = 0;
        let doneReading = false;
        let bytesSent = 0;
        let arrayBuffers = [];
        let currentPartBytesRead = 0;
        let onUploadProgress;
        const totalLoadedPerPartNumber = {};
        if (options.onUploadProgress) {
            onUploadProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$throttleit$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(()=>{
                var _a3;
                const loaded = Object.values(totalLoadedPerPartNumber).reduce((acc, cur)=>{
                    return acc + cur;
                }, 0);
                const total = totalToLoad || loaded;
                const percentage = totalToLoad > 0 ? Number(((loaded / totalToLoad || loaded) * 100).toFixed(2)) : 0;
                (_a3 = options.onUploadProgress) == null ? void 0 : _a3.call(options, {
                    loaded,
                    total,
                    percentage
                });
            }, 150);
        }
        read().catch(cancel);
        async function read() {
            debug("mpu: upload read start", "activeUploads:", activeUploads, "currentBytesInMemory:", `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`, "bytesSent:", bytes(bytesSent));
            reading = true;
            while(currentBytesInMemory < maxBytesInMemory && !rejected){
                try {
                    const { value, done } = await reader.read();
                    if (done) {
                        doneReading = true;
                        debug("mpu: upload read consumed the whole stream");
                        if (arrayBuffers.length > 0) {
                            partsToUpload.push({
                                partNumber: currentPartNumber++,
                                blob: new Blob(arrayBuffers, {
                                    type: "application/octet-stream"
                                })
                            });
                            sendParts();
                        }
                        reading = false;
                        return;
                    }
                    currentBytesInMemory += value.byteLength;
                    let valueOffset = 0;
                    while(valueOffset < value.byteLength){
                        const remainingPartSize = partSizeInBytes - currentPartBytesRead;
                        const endOffset = Math.min(valueOffset + remainingPartSize, value.byteLength);
                        const chunk = value.slice(valueOffset, endOffset);
                        arrayBuffers.push(chunk);
                        currentPartBytesRead += chunk.byteLength;
                        valueOffset = endOffset;
                        if (currentPartBytesRead === partSizeInBytes) {
                            partsToUpload.push({
                                partNumber: currentPartNumber++,
                                blob: new Blob(arrayBuffers, {
                                    type: "application/octet-stream"
                                })
                            });
                            arrayBuffers = [];
                            currentPartBytesRead = 0;
                            sendParts();
                        }
                    }
                } catch (error) {
                    cancel(error);
                }
            }
            debug("mpu: upload read end", "activeUploads:", activeUploads, "currentBytesInMemory:", `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`, "bytesSent:", bytes(bytesSent));
            reading = false;
        }
        async function sendPart(part) {
            activeUploads++;
            debug("mpu: upload send part start", "partNumber:", part.partNumber, "size:", part.blob.size, "activeUploads:", activeUploads, "currentBytesInMemory:", `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`, "bytesSent:", bytes(bytesSent));
            try {
                const uploadProgressForPart = options.onUploadProgress ? (event)=>{
                    totalLoadedPerPartNumber[part.partNumber] = event.loaded;
                    if (onUploadProgress) {
                        onUploadProgress();
                    }
                } : void 0;
                const completedPart = await uploadPart({
                    uploadId,
                    key,
                    pathname,
                    headers,
                    options: {
                        ...options,
                        onUploadProgress: uploadProgressForPart
                    },
                    internalAbortController,
                    part
                });
                debug("mpu: upload send part end", "partNumber:", part.partNumber, "activeUploads", activeUploads, "currentBytesInMemory:", `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`, "bytesSent:", bytes(bytesSent));
                if (rejected) {
                    return;
                }
                completedParts.push({
                    partNumber: part.partNumber,
                    etag: completedPart.etag
                });
                currentBytesInMemory -= part.blob.size;
                activeUploads--;
                bytesSent += part.blob.size;
                if (partsToUpload.length > 0) {
                    sendParts();
                }
                if (doneReading) {
                    if (activeUploads === 0) {
                        reader.releaseLock();
                        resolve(completedParts);
                    }
                    return;
                }
                if (!reading) {
                    read().catch(cancel);
                }
            } catch (error) {
                cancel(error);
            }
        }
        function sendParts() {
            if (rejected) {
                return;
            }
            debug("send parts", "activeUploads", activeUploads, "partsToUpload", partsToUpload.length);
            while(activeUploads < maxConcurrentUploads && partsToUpload.length > 0){
                const partToSend = partsToUpload.shift();
                if (partToSend) {
                    void sendPart(partToSend);
                }
            }
        }
        function cancel(error) {
            if (rejected) {
                return;
            }
            rejected = true;
            internalAbortController.abort();
            reader.releaseLock();
            if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
                reject(new BlobServiceNotAvailable());
            } else {
                reject(error);
            }
        }
    });
}
// src/multipart/create-uploader.ts
function createCreateMultipartUploaderMethod({ allowedOptions, getToken, extraChecks }) {
    return async (pathname, optionsInput)=>{
        const options = await createPutOptions({
            pathname,
            options: optionsInput,
            extraChecks,
            getToken
        });
        const headers = createPutHeaders(allowedOptions, options);
        const createMultipartUploadResponse = await createMultipartUpload(pathname, headers, options);
        return {
            key: createMultipartUploadResponse.key,
            uploadId: createMultipartUploadResponse.uploadId,
            async uploadPart (partNumber, body) {
                if (isPlainObject(body)) {
                    throw new BlobError("Body must be a string, buffer or stream. You sent a plain JavaScript object, double check what you're trying to upload.");
                }
                const result = await uploadPart({
                    uploadId: createMultipartUploadResponse.uploadId,
                    key: createMultipartUploadResponse.key,
                    pathname,
                    part: {
                        partNumber,
                        blob: body
                    },
                    headers,
                    options
                });
                return {
                    etag: result.etag,
                    partNumber
                };
            },
            async complete (parts) {
                return completeMultipartUpload({
                    uploadId: createMultipartUploadResponse.uploadId,
                    key: createMultipartUploadResponse.key,
                    pathname,
                    parts,
                    headers,
                    options
                });
            }
        };
    };
}
;
// src/multipart/uncontrolled.ts
async function uncontrolledMultipartUpload(pathname, body, headers, options) {
    debug("mpu: init", "pathname:", pathname, "headers:", headers);
    const optionsWithoutOnUploadProgress = {
        ...options,
        onUploadProgress: void 0
    };
    const createMultipartUploadResponse = await createMultipartUpload(pathname, headers, optionsWithoutOnUploadProgress);
    const totalToLoad = computeBodyLength(body);
    const stream = await toReadableStream(body);
    const parts = await uploadAllParts({
        uploadId: createMultipartUploadResponse.uploadId,
        key: createMultipartUploadResponse.key,
        pathname,
        // @ts-expect-error ReadableStream<ArrayBuffer | Uint8Array> is compatible at runtime
        stream,
        headers,
        options,
        totalToLoad
    });
    const blob = await completeMultipartUpload({
        uploadId: createMultipartUploadResponse.uploadId,
        key: createMultipartUploadResponse.key,
        pathname,
        parts,
        headers,
        options: optionsWithoutOnUploadProgress
    });
    return blob;
}
// src/put.ts
function createPutMethod({ allowedOptions, getToken, extraChecks }) {
    return async function put(pathname, body, optionsInput) {
        if (!body) {
            throw new BlobError("body is required");
        }
        if (isPlainObject(body)) {
            throw new BlobError("Body must be a string, buffer or stream. You sent a plain JavaScript object, double check what you're trying to upload.");
        }
        const options = await createPutOptions({
            pathname,
            options: optionsInput,
            extraChecks,
            getToken
        });
        const headers = createPutHeaders(allowedOptions, options);
        if (options.multipart === true) {
            return uncontrolledMultipartUpload(pathname, body, headers, options);
        }
        const onUploadProgress = options.onUploadProgress ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$throttleit$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(options.onUploadProgress, 100) : void 0;
        const params = new URLSearchParams({
            pathname
        });
        const response = await requestApi(`/?${params.toString()}`, {
            method: "PUT",
            body,
            headers,
            signal: options.abortSignal
        }, {
            ...options,
            onUploadProgress
        });
        return {
            url: response.url,
            downloadUrl: response.downloadUrl,
            pathname: response.pathname,
            contentType: response.contentType,
            contentDisposition: response.contentDisposition,
            etag: response.etag
        };
    };
}
// src/create-folder.ts
async function createFolder(pathname, options = {
    access: "public"
}) {
    var _a3;
    const access = (_a3 = options.access) != null ? _a3 : "public";
    const folderPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const headers = {};
    headers[putOptionHeaderMap.access] = access;
    headers[putOptionHeaderMap.addRandomSuffix] = "0";
    const params = new URLSearchParams({
        pathname: folderPathname
    });
    const response = await requestApi(`/?${params.toString()}`, {
        method: "PUT",
        headers,
        signal: options.abortSignal
    }, options);
    return {
        url: response.url,
        pathname: response.pathname
    };
}
;
 /*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */ }),
"[project]/node_modules/@vercel/blob/dist/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "completeMultipartUpload",
    ()=>completeMultipartUpload,
    "copy",
    ()=>copy,
    "createMultipartUpload",
    ()=>createMultipartUpload,
    "createMultipartUploader",
    ()=>createMultipartUploader,
    "del",
    ()=>del,
    "get",
    ()=>get,
    "head",
    ()=>head,
    "list",
    ()=>list,
    "put",
    ()=>put,
    "uploadPart",
    ()=>uploadPart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@vercel/blob/dist/chunk-UG4PCJMA.js [app-route] (ecmascript)");
// src/get.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
;
// src/del.ts
async function del(urlOrPathname, options) {
    const urls = Array.isArray(urlOrPathname) ? urlOrPathname : [
        urlOrPathname
    ];
    if ((options == null ? void 0 : options.ifMatch) && urls.length > 1) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("ifMatch can only be used when deleting a single URL.");
    }
    const headers = {
        "content-type": "application/json"
    };
    if (options == null ? void 0 : options.ifMatch) {
        headers["x-if-match"] = options.ifMatch;
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requestApi"])("/delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
            urls
        }),
        signal: options == null ? void 0 : options.abortSignal
    }, options);
}
// src/head.ts
async function head(urlOrPathname, options) {
    const searchParams = new URLSearchParams({
        url: urlOrPathname
    });
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requestApi"])(`?${searchParams.toString()}`, // HEAD can't have body as a response, so we use GET
    {
        method: "GET",
        signal: options == null ? void 0 : options.abortSignal
    }, options);
    return {
        url: response.url,
        downloadUrl: response.downloadUrl,
        pathname: response.pathname,
        size: response.size,
        contentType: response.contentType,
        contentDisposition: response.contentDisposition,
        cacheControl: response.cacheControl,
        uploadedAt: new Date(response.uploadedAt),
        etag: response.etag
    };
}
;
function isUrl(urlOrPathname) {
    return urlOrPathname.startsWith("http://") || urlOrPathname.startsWith("https://");
}
function extractPathnameFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.slice(1);
    } catch  {
        return url;
    }
}
function getStoreIdFromToken(token) {
    const [, , , storeId = ""] = token.split("_");
    return storeId;
}
function constructBlobUrl(storeId, pathname, access) {
    return `https://${storeId}.${access}.blob.vercel-storage.com/${pathname}`;
}
async function get(urlOrPathname, options) {
    if (!urlOrPathname) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("url or pathname is required");
    }
    if (!options) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("missing options, see usage");
    }
    if (options.access !== "public" && options.access !== "private") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]('access must be "private" or "public", see https://vercel.com/docs/vercel-blob');
    }
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokenFromOptionsOrEnv"])(options);
    let blobUrl;
    let pathname;
    const access = options.access;
    if (isUrl(urlOrPathname)) {
        blobUrl = urlOrPathname;
        pathname = extractPathnameFromUrl(urlOrPathname);
        try {
            const { hostname } = new URL(blobUrl);
            if (!hostname.endsWith(".blob.vercel-storage.com")) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("Invalid URL: the URL does not point to a Vercel Blob store. Use a pathname instead, see https://vercel.com/docs/vercel-blob");
            }
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]) throw error;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("Invalid URL: unable to parse the provided URL");
        }
    } else {
        const storeId = getStoreIdFromToken(token);
        if (!storeId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("Invalid token: unable to extract store ID");
        }
        pathname = urlOrPathname;
        blobUrl = constructBlobUrl(storeId, pathname, access);
    }
    const requestHeaders = {
        ...options.ifNoneMatch ? {
            "If-None-Match": options.ifNoneMatch
        } : {},
        authorization: `Bearer ${token}`,
        ...options.headers
    };
    let fetchUrl = blobUrl;
    if (options.useCache === false) {
        const url = new URL(blobUrl);
        url.searchParams.set("cache", "0");
        fetchUrl = url.toString();
    }
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"])(fetchUrl, {
        method: "GET",
        headers: requestHeaders,
        signal: options.abortSignal
    });
    if (response.status === 304) {
        const downloadUrlObj = new URL(blobUrl);
        downloadUrlObj.searchParams.set("download", "1");
        const lastModified2 = response.headers.get("last-modified");
        return {
            statusCode: 304,
            stream: null,
            headers: response.headers,
            blob: {
                url: blobUrl,
                downloadUrl: downloadUrlObj.toString(),
                pathname,
                contentType: null,
                contentDisposition: response.headers.get("content-disposition") || "",
                cacheControl: response.headers.get("cache-control") || "",
                size: null,
                uploadedAt: lastModified2 ? new Date(lastModified2) : /* @__PURE__ */ new Date(),
                etag: response.headers.get("etag") || ""
            }
        };
    }
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"](`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    const stream = response.body;
    if (!stream) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("Response body is null");
    }
    const contentLength = response.headers.get("content-length");
    const lastModified = response.headers.get("last-modified");
    const downloadUrl = new URL(blobUrl);
    downloadUrl.searchParams.set("download", "1");
    return {
        statusCode: 200,
        stream,
        headers: response.headers,
        blob: {
            url: blobUrl,
            downloadUrl: downloadUrl.toString(),
            pathname,
            contentType: response.headers.get("content-type") || "application/octet-stream",
            contentDisposition: response.headers.get("content-disposition") || "",
            cacheControl: response.headers.get("cache-control") || "",
            size: contentLength ? parseInt(contentLength, 10) : 0,
            uploadedAt: lastModified ? new Date(lastModified) : /* @__PURE__ */ new Date(),
            etag: response.headers.get("etag") || ""
        }
    };
}
// src/list.ts
async function list(options) {
    var _a;
    const searchParams = new URLSearchParams();
    if (options == null ? void 0 : options.limit) {
        searchParams.set("limit", options.limit.toString());
    }
    if (options == null ? void 0 : options.prefix) {
        searchParams.set("prefix", options.prefix);
    }
    if (options == null ? void 0 : options.cursor) {
        searchParams.set("cursor", options.cursor);
    }
    if (options == null ? void 0 : options.mode) {
        searchParams.set("mode", options.mode);
    }
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requestApi"])(`?${searchParams.toString()}`, {
        method: "GET",
        signal: options == null ? void 0 : options.abortSignal
    }, options);
    if ((options == null ? void 0 : options.mode) === "folded") {
        return {
            folders: (_a = response.folders) != null ? _a : [],
            cursor: response.cursor,
            hasMore: response.hasMore,
            blobs: response.blobs.map(mapBlobResult)
        };
    }
    return {
        cursor: response.cursor,
        hasMore: response.hasMore,
        blobs: response.blobs.map(mapBlobResult)
    };
}
function mapBlobResult(blobResult) {
    return {
        url: blobResult.url,
        downloadUrl: blobResult.downloadUrl,
        pathname: blobResult.pathname,
        size: blobResult.size,
        uploadedAt: new Date(blobResult.uploadedAt),
        etag: blobResult.etag
    };
}
// src/copy.ts
async function copy(fromUrlOrPathname, toPathname, options) {
    if (!options) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]("missing options, see usage");
    }
    if (options.access !== "public" && options.access !== "private") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"]('access must be "private" or "public", see https://vercel.com/docs/vercel-blob');
    }
    if (toPathname.length > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAXIMUM_PATHNAME_LENGTH"]) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"](`pathname is too long, maximum length is ${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAXIMUM_PATHNAME_LENGTH"]}`);
    }
    for (const invalidCharacter of __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disallowedPathnameCharacters"]){
        if (toPathname.includes(invalidCharacter)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobError"](`pathname cannot contain "${invalidCharacter}", please encode it if needed`);
        }
    }
    const headers = {};
    headers["x-vercel-blob-access"] = options.access;
    if (options.addRandomSuffix !== void 0) {
        headers["x-add-random-suffix"] = options.addRandomSuffix ? "1" : "0";
    }
    if (options.allowOverwrite !== void 0) {
        headers["x-allow-overwrite"] = options.allowOverwrite ? "1" : "0";
    }
    if (options.contentType) {
        headers["x-content-type"] = options.contentType;
    }
    if (options.cacheControlMaxAge !== void 0) {
        headers["x-cache-control-max-age"] = options.cacheControlMaxAge.toString();
    }
    if (options.ifMatch) {
        headers["x-if-match"] = options.ifMatch;
    }
    const params = new URLSearchParams({
        pathname: toPathname,
        fromUrl: fromUrlOrPathname
    });
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requestApi"])(`?${params.toString()}`, {
        method: "PUT",
        headers,
        signal: options.abortSignal
    }, options);
    return {
        url: response.url,
        downloadUrl: response.downloadUrl,
        pathname: response.pathname,
        contentType: response.contentType,
        contentDisposition: response.contentDisposition,
        etag: response.etag
    };
}
// src/index.ts
var put = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPutMethod"])({
    allowedOptions: [
        "cacheControlMaxAge",
        "addRandomSuffix",
        "allowOverwrite",
        "contentType",
        "ifMatch"
    ]
});
var createMultipartUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCreateMultipartUploadMethod"])({
    allowedOptions: [
        "cacheControlMaxAge",
        "addRandomSuffix",
        "allowOverwrite",
        "contentType",
        "ifMatch"
    ]
});
var createMultipartUploader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCreateMultipartUploaderMethod"])({
    allowedOptions: [
        "cacheControlMaxAge",
        "addRandomSuffix",
        "allowOverwrite",
        "contentType",
        "ifMatch"
    ]
});
var uploadPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadPartMethod"])({
    allowedOptions: [
        "cacheControlMaxAge",
        "addRandomSuffix",
        "allowOverwrite",
        "contentType"
    ]
});
var completeMultipartUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$chunk$2d$UG4PCJMA$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompleteMultipartUploadMethod"])({
    allowedOptions: [
        "cacheControlMaxAge",
        "addRandomSuffix",
        "allowOverwrite",
        "contentType"
    ]
});
;
}),
"[project]/node_modules/dotenv/package.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "name": "dotenv",
    "version": "17.3.1",
    "description": "Loads environment variables from .env file",
    "main": "lib/main.js",
    "types": "lib/main.d.ts",
    "exports": {
        ".": {
            "types": "./lib/main.d.ts",
            "require": "./lib/main.js",
            "default": "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
    },
    "scripts": {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        "lint": "standard",
        "pretest": "npm run lint && npm run dts-check",
        "test": "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        "prerelease": "npm test",
        "release": "standard-version"
    },
    "repository": {
        "type": "git",
        "url": "git://github.com/motdotla/dotenv.git"
    },
    "homepage": "https://github.com/motdotla/dotenv#readme",
    "funding": "https://dotenvx.com",
    "keywords": [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
    ],
    "readmeFilename": "README.md",
    "license": "BSD-2-Clause",
    "devDependencies": {
        "@types/node": "^18.11.3",
        "decache": "^4.6.2",
        "sinon": "^14.0.1",
        "standard": "^17.0.0",
        "standard-version": "^9.5.0",
        "tap": "^19.2.0",
        "typescript": "^4.8.4"
    },
    "engines": {
        "node": ">=12"
    },
    "browser": {
        "fs": false
    }
};
}),
"[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const packageJson = __turbopack_context__.r("[project]/node_modules/dotenv/package.json.[json].cjs [app-route] (ecmascript)");
const version = packageJson.version;
// Array of tips to display randomly
const TIPS = [
    '🔐 encrypt with Dotenvx: https://dotenvx.com',
    '🔐 prevent committing .env to code: https://dotenvx.com/precommit',
    '🔐 prevent building .env in docker: https://dotenvx.com/prebuild',
    '🤖 agentic secret storage: https://dotenvx.com/as2',
    '⚡️ secrets for agents: https://dotenvx.com/as2',
    '🛡️ auth for agents: https://vestauth.com',
    '🛠️  run anywhere with `dotenvx run -- yourcommand`',
    '⚙️  specify custom .env file path with { path: \'/custom/path/.env\' }',
    '⚙️  enable debug logging with { debug: true }',
    '⚙️  override existing env vars with { override: true }',
    '⚙️  suppress all logs with { quiet: true }',
    '⚙️  write to custom object with { processEnv: myObject }',
    '⚙️  load multiple .env files with { path: [\'.env.local\', \'.env\'] }'
];
// Get a random tip from the tips array
function _getRandomTip() {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
}
function parseBoolean(value) {
    if (typeof value === 'string') {
        return ![
            'false',
            '0',
            'no',
            'off',
            ''
        ].includes(value.toLowerCase());
    }
    return Boolean(value);
}
function supportsAnsi() {
    return process.stdout.isTTY // && process.env.TERM !== 'dumb'
    ;
}
function dim(text) {
    return supportsAnsi() ? `\x1b[2m${text}\x1b[0m` : text;
}
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
// Parse src into an Object
function parse(src) {
    const obj = {};
    // Convert buffer to string
    let lines = src.toString();
    // Convert line breaks to same format
    lines = lines.replace(/\r\n?/mg, '\n');
    let match;
    while((match = LINE.exec(lines)) != null){
        const key = match[1];
        // Default undefined or null to empty string
        let value = match[2] || '';
        // Remove whitespace
        value = value.trim();
        // Check if double quoted
        const maybeQuote = value[0];
        // Remove surrounding quotes
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');
        // Expand newlines if double quoted
        if (maybeQuote === '"') {
            value = value.replace(/\\n/g, '\n');
            value = value.replace(/\\r/g, '\r');
        }
        // Add to object
        obj[key] = value;
    }
    return obj;
}
function _parseVault(options) {
    options = options || {};
    const vaultPath = _vaultPath(options);
    options.path = vaultPath; // parse .env.vault
    const result = DotenvModule.configDotenv(options);
    if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = 'MISSING_DATA';
        throw err;
    }
    // handle scenario for comma separated keys - for use with key rotation
    // example: DOTENV_KEY="dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod"
    const keys = _dotenvKey(options).split(',');
    const length = keys.length;
    let decrypted;
    for(let i = 0; i < length; i++){
        try {
            // Get full key
            const key = keys[i].trim();
            // Get instructions for decrypt
            const attrs = _instructions(result, key);
            // Decrypt
            decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
            break;
        } catch (error) {
            // last key
            if (i + 1 >= length) {
                throw error;
            }
        // try next key
        }
    }
    // Parse decrypted .env string
    return DotenvModule.parse(decrypted);
}
function _warn(message) {
    console.error(`[dotenv@${version}][WARN] ${message}`);
}
function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`);
}
function _log(message) {
    console.log(`[dotenv@${version}] ${message}`);
}
function _dotenvKey(options) {
    // prioritize developer directly setting options.DOTENV_KEY
    if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
    }
    // secondary infra already contains a DOTENV_KEY environment variable
    if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
    }
    // fallback to empty string
    return '';
}
function _instructions(result, dotenvKey) {
    // Parse DOTENV_KEY. Format is a URI
    let uri;
    try {
        uri = new URL(dotenvKey);
    } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
            const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development');
            err.code = 'INVALID_DOTENV_KEY';
            throw err;
        }
        throw error;
    }
    // Get decrypt key
    const key = uri.password;
    if (!key) {
        const err = new Error('INVALID_DOTENV_KEY: Missing key part');
        err.code = 'INVALID_DOTENV_KEY';
        throw err;
    }
    // Get environment
    const environment = uri.searchParams.get('environment');
    if (!environment) {
        const err = new Error('INVALID_DOTENV_KEY: Missing environment part');
        err.code = 'INVALID_DOTENV_KEY';
        throw err;
    }
    // Get ciphertext payload
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
    const ciphertext = result.parsed[environmentKey] // DOTENV_VAULT_PRODUCTION
    ;
    if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT';
        throw err;
    }
    return {
        ciphertext,
        key
    };
}
function _vaultPath(options) {
    let possibleVaultPath = null;
    if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
            for (const filepath of options.path){
                if (fs.existsSync(filepath)) {
                    possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`;
                }
            }
        } else {
            possibleVaultPath = options.path.endsWith('.vault') ? options.path : `${options.path}.vault`;
        }
    } else {
        possibleVaultPath = path.resolve(process.cwd(), '.env.vault');
    }
    if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
    }
    return null;
}
function _resolveHome(envPath) {
    return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options) {
    const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
    const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
    if (debug || !quiet) {
        _log('Loading env from encrypted .env.vault');
    }
    const parsed = DotenvModule._parseVault(options);
    let processEnv = process.env;
    if (options && options.processEnv != null) {
        processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsed, options);
    return {
        parsed
    };
}
function configDotenv(options) {
    const dotenvPath = path.resolve(process.cwd(), '.env');
    let encoding = 'utf8';
    let processEnv = process.env;
    if (options && options.processEnv != null) {
        processEnv = options.processEnv;
    }
    let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
    let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
    if (options && options.encoding) {
        encoding = options.encoding;
    } else {
        if (debug) {
            _debug('No encoding is specified. UTF-8 is used by default');
        }
    }
    let optionPaths = [
        dotenvPath
    ] // default, look for .env
    ;
    if (options && options.path) {
        if (!Array.isArray(options.path)) {
            optionPaths = [
                _resolveHome(options.path)
            ];
        } else {
            optionPaths = []; // reset default
            for (const filepath of options.path){
                optionPaths.push(_resolveHome(filepath));
            }
        }
    }
    // Build the parsed data in a temporary object (because we need to return it).  Once we have the final
    // parsed data, we will combine it with process.env (or options.processEnv if provided).
    let lastError;
    const parsedAll = {};
    for (const path of optionPaths){
        try {
            // Specifying an encoding returns a string instead of a buffer
            const parsed = DotenvModule.parse(fs.readFileSync(path, {
                encoding
            }));
            DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
            if (debug) {
                _debug(`Failed to load ${path} ${e.message}`);
            }
            lastError = e;
        }
    }
    const populated = DotenvModule.populate(processEnv, parsedAll, options);
    // handle user settings DOTENV_CONFIG_ options inside .env file(s)
    debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
    quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
    if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths){
            try {
                const relative = path.relative(process.cwd(), filePath);
                shortPaths.push(relative);
            } catch (e) {
                if (debug) {
                    _debug(`Failed to load ${filePath} ${e.message}`);
                }
                lastError = e;
            }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(',')} ${dim(`-- tip: ${_getRandomTip()}`)}`);
    }
    if (lastError) {
        return {
            parsed: parsedAll,
            error: lastError
        };
    } else {
        return {
            parsed: parsedAll
        };
    }
}
// Populates process.env from .env file
function config(options) {
    // fallback to original dotenv if DOTENV_KEY is not set
    if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
    }
    const vaultPath = _vaultPath(options);
    // dotenvKey exists but .env.vault file does not exist
    if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
    }
    return DotenvModule._configVault(options);
}
function decrypt(encrypted, keyStr) {
    const key = Buffer.from(keyStr.slice(-64), 'hex');
    let ciphertext = Buffer.from(encrypted, 'base64');
    const nonce = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(-16);
    ciphertext = ciphertext.subarray(12, -16);
    try {
        const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
    } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === 'Invalid key length';
        const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data';
        if (isRange || invalidKeyLength) {
            const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)');
            err.code = 'INVALID_DOTENV_KEY';
            throw err;
        } else if (decryptionFailed) {
            const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY');
            err.code = 'DECRYPTION_FAILED';
            throw err;
        } else {
            throw error;
        }
    }
}
// Populate process.env with parsed values
function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);
    const populated = {};
    if (typeof parsed !== 'object') {
        const err = new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate');
        err.code = 'OBJECT_REQUIRED';
        throw err;
    }
    // Set process.env
    for (const key of Object.keys(parsed)){
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
            if (override === true) {
                processEnv[key] = parsed[key];
                populated[key] = parsed[key];
            }
            if (debug) {
                if (override === true) {
                    _debug(`"${key}" is already defined and WAS overwritten`);
                } else {
                    _debug(`"${key}" is already defined and was NOT overwritten`);
                }
            }
        } else {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
        }
    }
    return populated;
}
const DotenvModule = {
    configDotenv,
    _configVault,
    _parseVault,
    config,
    decrypt,
    parse,
    populate
};
module.exports.configDotenv = DotenvModule.configDotenv;
module.exports._configVault = DotenvModule._configVault;
module.exports._parseVault = DotenvModule._parseVault;
module.exports.config = DotenvModule.config;
module.exports.decrypt = DotenvModule.decrypt;
module.exports.parse = DotenvModule.parse;
module.exports.populate = DotenvModule.populate;
module.exports = DotenvModule;
}),
"[project]/node_modules/dotenv/lib/env-options.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// ../config.js accepts options via environment variables
const options = {};
if (process.env.DOTENV_CONFIG_ENCODING != null) {
    options.encoding = process.env.DOTENV_CONFIG_ENCODING;
}
if (process.env.DOTENV_CONFIG_PATH != null) {
    options.path = process.env.DOTENV_CONFIG_PATH;
}
if (process.env.DOTENV_CONFIG_QUIET != null) {
    options.quiet = process.env.DOTENV_CONFIG_QUIET;
}
if (process.env.DOTENV_CONFIG_DEBUG != null) {
    options.debug = process.env.DOTENV_CONFIG_DEBUG;
}
if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
    options.override = process.env.DOTENV_CONFIG_OVERRIDE;
}
if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
    options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
}
module.exports = options;
}),
"[project]/node_modules/dotenv/lib/cli-options.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
module.exports = function optionMatcher(args) {
    const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
            acc[matches[1]] = matches[2];
        }
        return acc;
    }, {});
    if (!('quiet' in options)) {
        options.quiet = 'true';
    }
    return options;
};
}),
"[project]/node_modules/dotenv/config.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

(function() {
    __turbopack_context__.r("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)").config(Object.assign({}, __turbopack_context__.r("[project]/node_modules/dotenv/lib/env-options.js [app-route] (ecmascript)"), __turbopack_context__.r("[project]/node_modules/dotenv/lib/cli-options.js [app-route] (ecmascript)")(process.argv)));
})();
}),
"[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Debug",
    ()=>Debug,
    "clearLogs",
    ()=>clearLogs,
    "default",
    ()=>index_default,
    "getLogs",
    ()=>getLogs
]);
var __defProp = Object.defineProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
// ../../node_modules/.pnpm/kleur@4.1.5/node_modules/kleur/colors.mjs
var colors_exports = {};
__export(colors_exports, {
    $: ()=>$,
    bgBlack: ()=>bgBlack,
    bgBlue: ()=>bgBlue,
    bgCyan: ()=>bgCyan,
    bgGreen: ()=>bgGreen,
    bgMagenta: ()=>bgMagenta,
    bgRed: ()=>bgRed,
    bgWhite: ()=>bgWhite,
    bgYellow: ()=>bgYellow,
    black: ()=>black,
    blue: ()=>blue,
    bold: ()=>bold,
    cyan: ()=>cyan,
    dim: ()=>dim,
    gray: ()=>gray,
    green: ()=>green,
    grey: ()=>grey,
    hidden: ()=>hidden,
    inverse: ()=>inverse,
    italic: ()=>italic,
    magenta: ()=>magenta,
    red: ()=>red,
    reset: ()=>reset,
    strikethrough: ()=>strikethrough,
    underline: ()=>underline,
    white: ()=>white,
    yellow: ()=>yellow
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
    let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
    return function(txt) {
        if (!$.enabled || txt == null) return txt;
        return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
}
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
// src/index.ts
var MAX_ARGS_HISTORY = 100;
var COLORS = [
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "red"
];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
    enable (namespace) {
        if (typeof namespace === "string") {
            globalThis.DEBUG = namespace;
        }
    },
    disable () {
        const prev = globalThis.DEBUG;
        globalThis.DEBUG = "";
        return prev;
    },
    // this is the core logic to check if logging should happen or not
    enabled (namespace) {
        const listenedNamespaces = globalThis.DEBUG.split(",").map((s)=>{
            return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        });
        const isListened = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
            return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
        });
        const isExcluded = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
            return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
        });
        return isListened && !isExcluded;
    },
    log: (...args)=>{
        const [namespace, format, ...rest] = args;
        const logWithFormatting = console.warn ?? console.log;
        logWithFormatting(`${namespace} ${format}`, ...rest);
    },
    formatters: {}
};
function debugCreate(namespace) {
    const instanceProps = {
        color: COLORS[lastColor++ % COLORS.length],
        enabled: topProps.enabled(namespace),
        namespace,
        log: topProps.log,
        extend: ()=>{}
    };
    const debugCall = (...args)=>{
        const { enabled, namespace: namespace2, color, log } = instanceProps;
        if (args.length !== 0) {
            argsHistory.push([
                namespace2,
                ...args
            ]);
        }
        if (argsHistory.length > MAX_ARGS_HISTORY) {
            argsHistory.shift();
        }
        if (topProps.enabled(namespace2) || enabled) {
            const stringArgs = args.map((arg)=>{
                if (typeof arg === "string") {
                    return arg;
                }
                return safeStringify(arg);
            });
            const ms = `+${Date.now() - lastTimestamp}ms`;
            lastTimestamp = Date.now();
            if (globalThis.DEBUG_COLORS) {
                log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
            } else {
                log(namespace2, ...stringArgs, ms);
            }
        }
    };
    return new Proxy(debugCall, {
        get: (_, prop)=>instanceProps[prop],
        set: (_, prop, value)=>instanceProps[prop] = value
    });
}
var Debug = new Proxy(debugCreate, {
    get: (_, prop)=>topProps[prop],
    set: (_, prop, value)=>topProps[prop] = value
});
function safeStringify(value, indent = 2) {
    const cache = /* @__PURE__ */ new Set();
    return JSON.stringify(value, (key, value2)=>{
        if (typeof value2 === "object" && value2 !== null) {
            if (cache.has(value2)) {
                return `[Circular *]`;
            }
            cache.add(value2);
        } else if (typeof value2 === "bigint") {
            return value2.toString();
        }
        return value2;
    }, indent);
}
function getLogs(numChars = 7500) {
    const logs = argsHistory.map(([namespace, ...args])=>{
        return `${namespace} ${args.map((arg)=>{
            if (typeof arg === "string") {
                return arg;
            } else {
                return JSON.stringify(arg);
            }
        }).join(" ")}`;
    }).join("\n");
    if (logs.length < numChars) {
        return logs;
    }
    return logs.slice(-numChars);
}
function clearLogs() {
    argsHistory.length = 0;
}
var index_default = Debug;
;
}),
"[project]/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColumnTypeEnum",
    ()=>ColumnTypeEnum,
    "DriverAdapterError",
    ()=>DriverAdapterError,
    "bindAdapter",
    ()=>bindAdapter,
    "bindMigrationAwareSqlAdapterFactory",
    ()=>bindMigrationAwareSqlAdapterFactory,
    "bindSqlAdapterFactory",
    ()=>bindSqlAdapterFactory,
    "err",
    ()=>err,
    "isDriverAdapterError",
    ()=>isDriverAdapterError,
    "mockAdapter",
    ()=>mockAdapter,
    "mockAdapterErrors",
    ()=>mockAdapterErrors,
    "mockAdapterFactory",
    ()=>mockAdapterFactory,
    "mockMigrationAwareAdapterFactory",
    ()=>mockMigrationAwareAdapterFactory,
    "ok",
    ()=>ok
]);
// src/debug.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)");
;
// src/error.ts
var DriverAdapterError = class extends Error {
    name = "DriverAdapterError";
    cause;
    constructor(payload){
        super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
        this.cause = payload;
    }
};
function isDriverAdapterError(error) {
    return error["name"] === "DriverAdapterError" && typeof error["cause"] === "object";
}
// src/result.ts
function ok(value) {
    return {
        ok: true,
        value,
        map (fn) {
            return ok(fn(value));
        },
        flatMap (fn) {
            return fn(value);
        }
    };
}
function err(error) {
    return {
        ok: false,
        error,
        map () {
            return err(error);
        },
        flatMap () {
            return err(error);
        }
    };
}
// src/binder.ts
var debug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Debug"])("driver-adapter-utils");
var ErrorRegistryInternal = class {
    registeredErrors = [];
    consumeError(id) {
        return this.registeredErrors[id];
    }
    registerNewError(error) {
        let i = 0;
        while(this.registeredErrors[i] !== void 0){
            i++;
        }
        this.registeredErrors[i] = {
            error
        };
        return i;
    }
};
function copySymbolsFromSource(source, target) {
    const symbols = Object.getOwnPropertySymbols(source);
    const symbolObject = Object.fromEntries(symbols.map((symbol)=>[
            symbol,
            true
        ]));
    Object.assign(target, symbolObject);
}
var bindMigrationAwareSqlAdapterFactory = (adapterFactory)=>{
    const errorRegistry = new ErrorRegistryInternal();
    const boundFactory = {
        adapterName: adapterFactory.adapterName,
        provider: adapterFactory.provider,
        errorRegistry,
        connect: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connect.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        },
        connectToShadowDb: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connectToShadowDb.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        }
    };
    copySymbolsFromSource(adapterFactory, boundFactory);
    return boundFactory;
};
var bindSqlAdapterFactory = (adapterFactory)=>{
    const errorRegistry = new ErrorRegistryInternal();
    const boundFactory = {
        adapterName: adapterFactory.adapterName,
        provider: adapterFactory.provider,
        errorRegistry,
        connect: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connect.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        }
    };
    copySymbolsFromSource(adapterFactory, boundFactory);
    return boundFactory;
};
var bindAdapter = (adapter, errorRegistry = new ErrorRegistryInternal())=>{
    const boundAdapter = {
        adapterName: adapter.adapterName,
        errorRegistry,
        queryRaw: wrapAsync(errorRegistry, adapter.queryRaw.bind(adapter)),
        executeRaw: wrapAsync(errorRegistry, adapter.executeRaw.bind(adapter)),
        executeScript: wrapAsync(errorRegistry, adapter.executeScript.bind(adapter)),
        dispose: wrapAsync(errorRegistry, adapter.dispose.bind(adapter)),
        provider: adapter.provider,
        startTransaction: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapter.startTransaction.bind(adapter))(...args);
            return ctx.map((ctx2)=>bindTransaction(errorRegistry, ctx2));
        }
    };
    if (adapter.getConnectionInfo) {
        boundAdapter.getConnectionInfo = wrapSync(errorRegistry, adapter.getConnectionInfo.bind(adapter));
    }
    return boundAdapter;
};
var bindTransaction = (errorRegistry, transaction)=>{
    const boundTransaction = {
        adapterName: transaction.adapterName,
        provider: transaction.provider,
        options: transaction.options,
        queryRaw: wrapAsync(errorRegistry, transaction.queryRaw.bind(transaction)),
        executeRaw: wrapAsync(errorRegistry, transaction.executeRaw.bind(transaction)),
        commit: wrapAsync(errorRegistry, transaction.commit.bind(transaction)),
        rollback: wrapAsync(errorRegistry, transaction.rollback.bind(transaction))
    };
    if (transaction.createSavepoint) {
        boundTransaction.createSavepoint = wrapAsync(errorRegistry, transaction.createSavepoint.bind(transaction));
    }
    if (transaction.rollbackToSavepoint) {
        boundTransaction.rollbackToSavepoint = wrapAsync(errorRegistry, transaction.rollbackToSavepoint.bind(transaction));
    }
    if (transaction.releaseSavepoint) {
        boundTransaction.releaseSavepoint = wrapAsync(errorRegistry, transaction.releaseSavepoint.bind(transaction));
    }
    return boundTransaction;
};
function wrapAsync(registry, fn) {
    return async (...args)=>{
        try {
            return ok(await fn(...args));
        } catch (error) {
            debug("[error@wrapAsync]", error);
            if (isDriverAdapterError(error)) {
                return err(error.cause);
            }
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
function wrapSync(registry, fn) {
    return (...args)=>{
        try {
            return ok(fn(...args));
        } catch (error) {
            debug("[error@wrapSync]", error);
            if (isDriverAdapterError(error)) {
                return err(error.cause);
            }
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
// src/const.ts
var ColumnTypeEnum = {
    // Scalars
    Int32: 0,
    Int64: 1,
    Float: 2,
    Double: 3,
    Numeric: 4,
    Boolean: 5,
    Character: 6,
    Text: 7,
    Date: 8,
    Time: 9,
    DateTime: 10,
    Json: 11,
    Enum: 12,
    Bytes: 13,
    Set: 14,
    Uuid: 15,
    // Arrays
    Int32Array: 64,
    Int64Array: 65,
    FloatArray: 66,
    DoubleArray: 67,
    NumericArray: 68,
    BooleanArray: 69,
    CharacterArray: 70,
    TextArray: 71,
    DateArray: 72,
    TimeArray: 73,
    DateTimeArray: 74,
    JsonArray: 75,
    EnumArray: 76,
    BytesArray: 77,
    UuidArray: 78,
    // Custom
    UnknownNumber: 128
};
// src/mock.ts
var mockAdapterErrors = {
    queryRaw: new Error("Not implemented: queryRaw"),
    executeRaw: new Error("Not implemented: executeRaw"),
    startTransaction: new Error("Not implemented: startTransaction"),
    executeScript: new Error("Not implemented: executeScript"),
    dispose: new Error("Not implemented: dispose")
};
function mockAdapter(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        queryRaw: ()=>Promise.reject(mockAdapterErrors.queryRaw),
        executeRaw: ()=>Promise.reject(mockAdapterErrors.executeRaw),
        startTransaction: ()=>Promise.reject(mockAdapterErrors.startTransaction),
        executeScript: ()=>Promise.reject(mockAdapterErrors.executeScript),
        dispose: ()=>Promise.reject(mockAdapterErrors.dispose),
        [Symbol.for("adapter.mockAdapter")]: true
    };
}
function mockAdapterFactory(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        connect: ()=>Promise.resolve(mockAdapter(provider)),
        [Symbol.for("adapter.mockAdapterFactory")]: true
    };
}
function mockMigrationAwareAdapterFactory(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        connect: ()=>Promise.resolve(mockAdapter(provider)),
        connectToShadowDb: ()=>Promise.resolve(mockAdapter(provider)),
        [Symbol.for("adapter.mockMigrationAwareAdapterFactory")]: true
    };
}
;
}),
"[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg-587764f78a6c7a9c");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/postgres-array/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const BACKSLASH = '\\';
const DQUOT = '"';
const LBRACE = '{';
const RBRACE = '}';
const LBRACKET = '[';
const EQUALS = '=';
const COMMA = ',';
/** When the raw value is this, it means a literal `null` */ const NULL_STRING = 'NULL';
/**
 * Parses an array according to
 * https://www.postgresql.org/docs/17/arrays.html#ARRAYS-IO
 *
 * Trusts the data (mostly), so only hook up to trusted Postgres servers.
 */ function makeParseArrayWithTransform(transform) {
    const haveTransform = transform != null;
    return function parseArray(str) {
        const rbraceIndex = str.length - 1;
        if (rbraceIndex === 1) {
            return [];
        }
        if (str[rbraceIndex] !== RBRACE) {
            throw new Error('Invalid array text - must end with }');
        }
        // If starts with `[`, it is specifying the index boundas. Skip past first `=`.
        let position = 0;
        if (str[position] === LBRACKET) {
            position = str.indexOf(EQUALS) + 1;
        }
        if (str[position++] !== LBRACE) {
            throw new Error('Invalid array text - must start with {');
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = '';
        let expectValue = true;
        for(; position < rbraceIndex; ++position){
            let char = str[position];
            // > The array output routine will put double quotes around element values if
            // > they are empty strings, contain curly braces, delimiter characters, double
            // > quotes, backslashes, or white space, or match the word NULL. Double quotes
            // > and backslashes embedded in element values will be backslash-escaped.
            if (char === DQUOT) {
                // It's escaped
                currentStringStart = ++position;
                let dquot = str.indexOf(DQUOT, currentStringStart);
                let backSlash = str.indexOf(BACKSLASH, currentStringStart);
                while(backSlash !== -1 && backSlash < dquot){
                    position = backSlash;
                    const part = str.slice(currentStringStart, position);
                    currentString += part;
                    currentStringStart = ++position;
                    if (dquot === position++) {
                        // This was an escaped doublequote; find the next one!
                        dquot = str.indexOf(DQUOT, position);
                    }
                    // Either way, find the next backslash
                    backSlash = str.indexOf(BACKSLASH, position);
                }
                position = dquot;
                const part = str.slice(currentStringStart, position);
                currentString += part;
                current.push(haveTransform ? transform(currentString) : currentString);
                currentString = '';
                expectValue = false;
            } else if (char === LBRACE) {
                const newArray = [];
                current.push(newArray);
                stack.push(current);
                current = newArray;
                currentStringStart = position + 1;
                expectValue = true;
            } else if (char === COMMA) {
                expectValue = true;
            } else if (char === RBRACE) {
                expectValue = false;
                const arr = stack.pop();
                if (arr === undefined) {
                    throw new Error("Invalid array text - too many '}'");
                }
                current = arr;
            } else if (expectValue) {
                currentStringStart = position;
                while((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex){
                    ++position;
                }
                const part = str.slice(currentStringStart, position--);
                current.push(part === NULL_STRING ? null : haveTransform ? transform(part) : part);
                expectValue = false;
            } else {
                throw new Error('Was expecting delimeter');
            }
        }
        return output;
    };
}
const parseArray = makeParseArrayWithTransform();
exports.parse = (source, transform)=>transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray(source);
}),
"[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PrismaPg",
    ()=>PrismaPgAdapterFactory
]);
// src/pg.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2d$array$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres-array/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// package.json
var name = "@prisma/adapter-pg";
// src/constants.ts
var FIRST_NORMAL_OBJECT_ID = 16384;
;
;
;
var { types } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"];
var { builtins: ScalarColumnType, getTypeParser } = types;
var AdditionalScalarColumnType = {
    NAME: 19
};
var ArrayColumnType = {
    BIT_ARRAY: 1561,
    BOOL_ARRAY: 1e3,
    BYTEA_ARRAY: 1001,
    BPCHAR_ARRAY: 1014,
    CHAR_ARRAY: 1002,
    CIDR_ARRAY: 651,
    DATE_ARRAY: 1182,
    FLOAT4_ARRAY: 1021,
    FLOAT8_ARRAY: 1022,
    INET_ARRAY: 1041,
    INT2_ARRAY: 1005,
    INT4_ARRAY: 1007,
    INT8_ARRAY: 1016,
    JSONB_ARRAY: 3807,
    JSON_ARRAY: 199,
    MONEY_ARRAY: 791,
    NUMERIC_ARRAY: 1231,
    OID_ARRAY: 1028,
    TEXT_ARRAY: 1009,
    TIMESTAMP_ARRAY: 1115,
    TIMESTAMPTZ_ARRAY: 1185,
    TIME_ARRAY: 1183,
    UUID_ARRAY: 2951,
    VARBIT_ARRAY: 1563,
    VARCHAR_ARRAY: 1015,
    XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
    // map of type codes to type names
    static typeNames = {
        16: "bool",
        17: "bytea",
        18: "char",
        19: "name",
        20: "int8",
        21: "int2",
        22: "int2vector",
        23: "int4",
        24: "regproc",
        25: "text",
        26: "oid",
        27: "tid",
        28: "xid",
        29: "cid",
        30: "oidvector",
        32: "pg_ddl_command",
        71: "pg_type",
        75: "pg_attribute",
        81: "pg_proc",
        83: "pg_class",
        114: "json",
        142: "xml",
        194: "pg_node_tree",
        269: "table_am_handler",
        325: "index_am_handler",
        600: "point",
        601: "lseg",
        602: "path",
        603: "box",
        604: "polygon",
        628: "line",
        650: "cidr",
        700: "float4",
        701: "float8",
        705: "unknown",
        718: "circle",
        774: "macaddr8",
        790: "money",
        829: "macaddr",
        869: "inet",
        1033: "aclitem",
        1042: "bpchar",
        1043: "varchar",
        1082: "date",
        1083: "time",
        1114: "timestamp",
        1184: "timestamptz",
        1186: "interval",
        1266: "timetz",
        1560: "bit",
        1562: "varbit",
        1700: "numeric",
        1790: "refcursor",
        2202: "regprocedure",
        2203: "regoper",
        2204: "regoperator",
        2205: "regclass",
        2206: "regtype",
        2249: "record",
        2275: "cstring",
        2276: "any",
        2277: "anyarray",
        2278: "void",
        2279: "trigger",
        2280: "language_handler",
        2281: "internal",
        2283: "anyelement",
        2287: "_record",
        2776: "anynonarray",
        2950: "uuid",
        2970: "txid_snapshot",
        3115: "fdw_handler",
        3220: "pg_lsn",
        3310: "tsm_handler",
        3361: "pg_ndistinct",
        3402: "pg_dependencies",
        3500: "anyenum",
        3614: "tsvector",
        3615: "tsquery",
        3642: "gtsvector",
        3734: "regconfig",
        3769: "regdictionary",
        3802: "jsonb",
        3831: "anyrange",
        3838: "event_trigger",
        3904: "int4range",
        3906: "numrange",
        3908: "tsrange",
        3910: "tstzrange",
        3912: "daterange",
        3926: "int8range",
        4072: "jsonpath",
        4089: "regnamespace",
        4096: "regrole",
        4191: "regcollation",
        4451: "int4multirange",
        4532: "nummultirange",
        4533: "tsmultirange",
        4534: "tstzmultirange",
        4535: "datemultirange",
        4536: "int8multirange",
        4537: "anymultirange",
        4538: "anycompatiblemultirange",
        4600: "pg_brin_bloom_summary",
        4601: "pg_brin_minmax_multi_summary",
        5017: "pg_mcv_list",
        5038: "pg_snapshot",
        5069: "xid8",
        5077: "anycompatible",
        5078: "anycompatiblearray",
        5079: "anycompatiblenonarray",
        5080: "anycompatiblerange"
    };
    type;
    constructor(code){
        super();
        this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
        this.message = `Unsupported column type ${this.type}`;
    }
};
function fieldToColumnType(fieldTypeId) {
    switch(fieldTypeId){
        case ScalarColumnType.INT2:
        case ScalarColumnType.INT4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32;
        case ScalarColumnType.INT8:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case ScalarColumnType.FLOAT4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Float;
        case ScalarColumnType.FLOAT8:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Double;
        case ScalarColumnType.BOOL:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Boolean;
        case ScalarColumnType.DATE:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Date;
        case ScalarColumnType.TIME:
        case ScalarColumnType.TIMETZ:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Time;
        case ScalarColumnType.TIMESTAMP:
        case ScalarColumnType.TIMESTAMPTZ:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTime;
        case ScalarColumnType.NUMERIC:
        case ScalarColumnType.MONEY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Numeric;
        case ScalarColumnType.JSON:
        case ScalarColumnType.JSONB:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Json;
        case ScalarColumnType.UUID:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Uuid;
        case ScalarColumnType.OID:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case ScalarColumnType.BPCHAR:
        case ScalarColumnType.TEXT:
        case ScalarColumnType.VARCHAR:
        case ScalarColumnType.BIT:
        case ScalarColumnType.VARBIT:
        case ScalarColumnType.INET:
        case ScalarColumnType.CIDR:
        case ScalarColumnType.XML:
        case AdditionalScalarColumnType.NAME:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
        case ScalarColumnType.BYTEA:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Bytes;
        case ArrayColumnType.INT2_ARRAY:
        case ArrayColumnType.INT4_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32Array;
        case ArrayColumnType.FLOAT4_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].FloatArray;
        case ArrayColumnType.FLOAT8_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DoubleArray;
        case ArrayColumnType.NUMERIC_ARRAY:
        case ArrayColumnType.MONEY_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].NumericArray;
        case ArrayColumnType.BOOL_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].BooleanArray;
        case ArrayColumnType.CHAR_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].CharacterArray;
        case ArrayColumnType.BPCHAR_ARRAY:
        case ArrayColumnType.TEXT_ARRAY:
        case ArrayColumnType.VARCHAR_ARRAY:
        case ArrayColumnType.VARBIT_ARRAY:
        case ArrayColumnType.BIT_ARRAY:
        case ArrayColumnType.INET_ARRAY:
        case ArrayColumnType.CIDR_ARRAY:
        case ArrayColumnType.XML_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].TextArray;
        case ArrayColumnType.DATE_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateArray;
        case ArrayColumnType.TIME_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].TimeArray;
        case ArrayColumnType.TIMESTAMP_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTimeArray;
        case ArrayColumnType.TIMESTAMPTZ_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTimeArray;
        case ArrayColumnType.JSON_ARRAY:
        case ArrayColumnType.JSONB_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].JsonArray;
        case ArrayColumnType.BYTEA_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].BytesArray;
        case ArrayColumnType.UUID_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].UuidArray;
        case ArrayColumnType.INT8_ARRAY:
        case ArrayColumnType.OID_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64Array;
        default:
            if (fieldTypeId >= FIRST_NORMAL_OBJECT_ID) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
            }
            throw new UnsupportedNativeDataType(fieldTypeId);
    }
}
function normalize_array(element_normalizer) {
    return (str)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2d$array$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(str, element_normalizer);
}
function normalize_numeric(numeric) {
    return numeric;
}
function normalize_date(date) {
    return date;
}
function normalize_timestamp(time) {
    return `${time.replace(" ", "T")}+00:00`;
}
function normalize_timestamptz(time) {
    return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
function normalize_time(time) {
    return time;
}
function normalize_timez(time) {
    return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
function normalize_money(money) {
    return money.slice(1);
}
function normalize_xml(xml) {
    return xml;
}
function toJson(json) {
    return json;
}
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var normalizeByteaArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function convertBytes(serializedBytes) {
    return parsePgBytes(serializedBytes);
}
function normalizeBit(bit) {
    return bit;
}
var customParsers = {
    [ScalarColumnType.NUMERIC]: normalize_numeric,
    [ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
    [ScalarColumnType.TIME]: normalize_time,
    [ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
    [ScalarColumnType.TIMETZ]: normalize_timez,
    [ScalarColumnType.DATE]: normalize_date,
    [ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
    [ScalarColumnType.TIMESTAMP]: normalize_timestamp,
    [ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
    [ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
    [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
    [ScalarColumnType.MONEY]: normalize_money,
    [ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
    [ScalarColumnType.JSON]: toJson,
    [ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
    [ScalarColumnType.JSONB]: toJson,
    [ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
    [ScalarColumnType.BYTEA]: convertBytes,
    [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
    [ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
    [ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
    [ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
    if (arg === null) {
        return null;
    }
    if (Array.isArray(arg) && argType.arity === "list") {
        return arg.map((value)=>mapArg(value, argType));
    }
    if (typeof arg === "string" && argType.scalarType === "datetime") {
        arg = new Date(arg);
    }
    if (arg instanceof Date) {
        switch(argType.dbType){
            case "TIME":
            case "TIMETZ":
                return formatTime(arg);
            case "DATE":
                return formatDate(arg);
            default:
                return formatDateTime(arg);
        }
    }
    if (typeof arg === "string" && argType.scalarType === "bytes") {
        return Buffer.from(arg, "base64");
    }
    if (ArrayBuffer.isView(arg)) {
        return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
    }
    return arg;
}
function formatDateTime(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    const ms = date.getUTCMilliseconds();
    return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
function formatDate(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
function formatTime(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    const ms = date.getUTCMilliseconds();
    return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
// src/errors.ts
var TLS_ERRORS = /* @__PURE__ */ new Set([
    "UNABLE_TO_GET_ISSUER_CERT",
    "UNABLE_TO_GET_CRL",
    "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
    "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
    "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
    "CERT_SIGNATURE_FAILURE",
    "CRL_SIGNATURE_FAILURE",
    "CERT_NOT_YET_VALID",
    "CERT_HAS_EXPIRED",
    "CRL_NOT_YET_VALID",
    "CRL_HAS_EXPIRED",
    "ERROR_IN_CERT_NOT_BEFORE_FIELD",
    "ERROR_IN_CERT_NOT_AFTER_FIELD",
    "ERROR_IN_CRL_LAST_UPDATE_FIELD",
    "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "CERT_CHAIN_TOO_LONG",
    "CERT_REVOKED",
    "INVALID_CA",
    "INVALID_PURPOSE",
    "CERT_UNTRUSTED",
    "CERT_REJECTED",
    "HOSTNAME_MISMATCH",
    "ERR_TLS_CERT_ALTNAME_FORMAT",
    "ERR_TLS_CERT_ALTNAME_INVALID"
]);
var SOCKET_ERRORS = /* @__PURE__ */ new Set([
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT"
]);
function convertDriverError(error) {
    if (isSocketError(error)) {
        return mapSocketError(error);
    }
    if (isTlsError(error)) {
        return {
            kind: "TlsConnectionError",
            reason: error.message
        };
    }
    if (isDriverError(error)) {
        return {
            originalCode: error.code,
            originalMessage: error.message,
            ...mapDriverError(error)
        };
    }
    throw error;
}
function mapDriverError(error) {
    switch(error.code){
        case "22001":
            return {
                kind: "LengthMismatch",
                column: error.column
            };
        case "22003":
            return {
                kind: "ValueOutOfRange",
                cause: error.message
            };
        case "22P02":
            return {
                kind: "InvalidInputValue",
                message: error.message
            };
        case "23505":
            {
                const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
                return {
                    kind: "UniqueConstraintViolation",
                    constraint: fields !== void 0 ? {
                        fields
                    } : void 0
                };
            }
        case "23502":
            {
                const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
                return {
                    kind: "NullConstraintViolation",
                    constraint: fields !== void 0 ? {
                        fields
                    } : void 0
                };
            }
        case "23503":
            {
                let constraint;
                if (error.column) {
                    constraint = {
                        fields: [
                            error.column
                        ]
                    };
                } else if (error.constraint) {
                    constraint = {
                        index: error.constraint
                    };
                }
                return {
                    kind: "ForeignKeyConstraintViolation",
                    constraint
                };
            }
        case "3D000":
            return {
                kind: "DatabaseDoesNotExist",
                db: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "28000":
            return {
                kind: "DatabaseAccessDenied",
                db: error.message.split(",").find((s)=>s.startsWith(" database"))?.split('"').at(1)
            };
        case "28P01":
            return {
                kind: "AuthenticationFailed",
                user: error.message.split(" ").pop()?.split('"').at(1)
            };
        case "40001":
            return {
                kind: "TransactionWriteConflict"
            };
        case "42P01":
            return {
                kind: "TableDoesNotExist",
                table: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "42703":
            return {
                kind: "ColumnNotFound",
                column: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "42P04":
            return {
                kind: "DatabaseAlreadyExists",
                db: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "53300":
            return {
                kind: "TooManyConnections",
                cause: error.message
            };
        default:
            return {
                kind: "postgres",
                code: error.code ?? "N/A",
                severity: error.severity ?? "N/A",
                message: error.message,
                detail: error.detail,
                column: error.column,
                hint: error.hint
            };
    }
}
function isDriverError(error) {
    return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
function mapSocketError(error) {
    switch(error.code){
        case "ENOTFOUND":
        case "ECONNREFUSED":
            return {
                kind: "DatabaseNotReachable",
                host: error.address ?? error.hostname,
                port: error.port
            };
        case "ECONNRESET":
            return {
                kind: "ConnectionClosed"
            };
        case "ETIMEDOUT":
            return {
                kind: "SocketTimeout"
            };
    }
}
function isSocketError(error) {
    return typeof error.code === "string" && typeof error.syscall === "string" && typeof error.errno === "number" && SOCKET_ERRORS.has(error.code);
}
function isTlsError(error) {
    if (typeof error.code === "string") {
        return TLS_ERRORS.has(error.code);
    }
    switch(error.message){
        case "The server does not support SSL connections":
        case "There was an error establishing an SSL connection":
            return true;
    }
    return false;
}
// src/pg.ts
var types2 = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].types;
var debug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Debug"])("prisma:driver-adapter:pg");
var PgQueryable = class {
    constructor(client, pgOptions){
        this.client = client;
        this.pgOptions = pgOptions;
    }
    provider = "postgres";
    adapterName = name;
    /**
   * Execute a query given as SQL, interpolating the given parameters.
   */ async queryRaw(query) {
        const tag = "[js::query_raw]";
        debug(`${tag} %O`, query);
        const { fields, rows } = await this.performIO(query);
        const columnNames = fields.map((field)=>field.name);
        let columnTypes = [];
        try {
            columnTypes = fields.map((field)=>fieldToColumnType(field.dataTypeID));
        } catch (e) {
            if (e instanceof UnsupportedNativeDataType) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DriverAdapterError"]({
                    kind: "UnsupportedNativeDataType",
                    type: e.type
                });
            }
            throw e;
        }
        const udtParser = this.pgOptions?.userDefinedTypeParser;
        if (udtParser) {
            for(let i = 0; i < fields.length; i++){
                const field = fields[i];
                if (field.dataTypeID >= FIRST_NORMAL_OBJECT_ID && !Object.hasOwn(customParsers, field.dataTypeID)) {
                    for(let j = 0; j < rows.length; j++){
                        rows[j][i] = await udtParser(field.dataTypeID, rows[j][i], this);
                    }
                }
            }
        }
        return {
            columnNames,
            columnTypes,
            rows
        };
    }
    /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */ async executeRaw(query) {
        const tag = "[js::execute_raw]";
        debug(`${tag} %O`, query);
        return (await this.performIO(query)).rowCount ?? 0;
    }
    /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */ async performIO(query) {
        const { sql, args } = query;
        const values = args.map((arg, i)=>mapArg(arg, query.argTypes[i]));
        try {
            const result = await this.client.query({
                text: sql,
                values,
                rowMode: "array",
                types: {
                    // This is the error expected:
                    // No overload matches this call.
                    // The last overload gave the following error.
                    // Type '(oid: number, format?: any) => (json: string) => unknown' is not assignable to type '{ <T>(oid: number): TypeParser<string, string | T>; <T>(oid: number, format: "text"): TypeParser<string, string | T>; <T>(oid: number, format: "binary"): TypeParser<...>; }'.
                    //   Type '(json: string) => unknown' is not assignable to type 'TypeParser<Buffer, any>'.
                    //     Types of parameters 'json' and 'value' are incompatible.
                    //       Type 'Buffer' is not assignable to type 'string'.ts(2769)
                    //
                    // Because pg-types types expect us to handle both binary and text protocol versions,
                    // where as far we can see, pg will ever pass only text version.
                    //
                    // @ts-expect-error
                    getTypeParser: (oid, format)=>{
                        if (format === "text" && customParsers[oid]) {
                            return customParsers[oid];
                        }
                        return types2.getTypeParser(oid, format);
                    }
                }
            }, values);
            return result;
        } catch (e) {
            this.onError(e);
        }
    }
    onError(error) {
        debug("Error in performIO: %O", error);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DriverAdapterError"](convertDriverError(error));
    }
};
var PgTransaction = class extends PgQueryable {
    constructor(client, options, pgOptions, cleanup){
        super(client, pgOptions);
        this.options = options;
        this.pgOptions = pgOptions;
        this.cleanup = cleanup;
    }
    async commit() {
        debug(`[js::commit]`);
        this.cleanup?.();
        this.client.release();
    }
    async rollback() {
        debug(`[js::rollback]`);
        this.cleanup?.();
        this.client.release();
    }
    async createSavepoint(name2) {
        await this.executeRaw({
            sql: `SAVEPOINT ${name2}`,
            args: [],
            argTypes: []
        });
    }
    async rollbackToSavepoint(name2) {
        await this.executeRaw({
            sql: `ROLLBACK TO SAVEPOINT ${name2}`,
            args: [],
            argTypes: []
        });
    }
    async releaseSavepoint(name2) {
        await this.executeRaw({
            sql: `RELEASE SAVEPOINT ${name2}`,
            args: [],
            argTypes: []
        });
    }
};
var PrismaPgAdapter = class extends PgQueryable {
    constructor(client, pgOptions, release){
        super(client);
        this.pgOptions = pgOptions;
        this.release = release;
    }
    async startTransaction(isolationLevel) {
        const options = {
            usePhantomQuery: false
        };
        const tag = "[js::startTransaction]";
        debug("%s options: %O", tag, options);
        const conn = await this.client.connect().catch((error)=>this.onError(error));
        const onError = (err)=>{
            debug(`Error from pool connection: ${err.message} %O`, err);
            this.pgOptions?.onConnectionError?.(err);
        };
        conn.on("error", onError);
        const cleanup = ()=>{
            conn.removeListener("error", onError);
        };
        try {
            const tx = new PgTransaction(conn, options, this.pgOptions, cleanup);
            await tx.executeRaw({
                sql: "BEGIN",
                args: [],
                argTypes: []
            });
            if (isolationLevel) {
                await tx.executeRaw({
                    sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
                    args: [],
                    argTypes: []
                });
            }
            return tx;
        } catch (error) {
            cleanup();
            conn.release(error);
            this.onError(error);
        }
    }
    async executeScript(script) {
        const statements = script.split(";").map((stmt)=>stmt.trim()).filter((stmt)=>stmt.length > 0);
        for (const stmt of statements){
            try {
                await this.client.query(stmt);
            } catch (error) {
                this.onError(error);
            }
        }
    }
    getConnectionInfo() {
        return {
            schemaName: this.pgOptions?.schema,
            supportsRelationJoins: true
        };
    }
    async dispose() {
        return this.release?.();
    }
    underlyingDriver() {
        return this.client;
    }
};
var PrismaPgAdapterFactory = class {
    constructor(poolOrConfig, options){
        this.options = options;
        if (poolOrConfig instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool) {
            this.externalPool = poolOrConfig;
            this.config = poolOrConfig.options;
        } else {
            this.externalPool = null;
            this.config = poolOrConfig;
        }
    }
    provider = "postgres";
    adapterName = name;
    config;
    externalPool;
    async connect() {
        const client = this.externalPool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool(this.config);
        const onIdleClientError = (err)=>{
            debug(`Error from idle pool client: ${err.message} %O`, err);
            this.options?.onPoolError?.(err);
        };
        client.on("error", onIdleClientError);
        return new PrismaPgAdapter(client, this.options, async ()=>{
            if (this.externalPool) {
                if (this.options?.disposeExternalPool) {
                    await this.externalPool.end();
                    this.externalPool = null;
                } else {
                    this.externalPool.removeListener("error", onIdleClientError);
                }
            } else {
                await client.end();
            }
        });
    }
    async connectToShadowDb() {
        const conn = await this.connect();
        const database = `prisma_migrate_shadow_db_${globalThis.crypto.randomUUID()}`;
        await conn.executeScript(`CREATE DATABASE "${database}"`);
        const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool({
            ...this.config,
            database
        });
        return new PrismaPgAdapter(client, void 0, async ()=>{
            await conn.executeScript(`DROP DATABASE "${database}"`);
            await client.end();
        });
    }
};
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/@prisma/client/runtime/client [external] (@prisma/client/runtime/client, cjs, [project]/node_modules/@prisma/client)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client-2c3a283f134fdcb6/runtime/client", () => require("@prisma/client-2c3a283f134fdcb6/runtime/client"));

module.exports = mod;
}),
"[project]/node_modules/@napi-rs/canvas/js-binding.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// prettier-ignore
/* eslint-disable */ // @ts-nocheck
/* auto-generated by NAPI-RS */ const { readFileSync } = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
let nativeBinding = null;
const loadErrors = [];
const isMusl = ()=>{
    let musl = false;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return musl;
};
const isFileMusl = (f)=>f.includes('libc.musl-') || f.includes('ld-musl-');
const isMuslFromFilesystem = ()=>{
    try {
        return readFileSync('/usr/bin/ldd', 'utf-8').includes('musl');
    } catch  {
        return null;
    }
};
const isMuslFromReport = ()=>{
    const report = typeof process.report.getReport === 'function' ? process.report.getReport() : null;
    if (!report) {
        return null;
    }
    if (report.header && report.header.glibcVersionRuntime) {
        return false;
    }
    if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
            return true;
        }
    }
    return false;
};
const isMuslFromChildProcess = ()=>{
    try {
        return __turbopack_context__.r("[externals]/child_process [external] (child_process, cjs)").execSync('ldd --version', {
            encoding: 'utf8'
        }).includes('musl');
    } catch (e) {
        // If we reach this case, we don't know if the system is musl or not, so is better to just fallback to false
        return false;
    }
};
function requireNative() {
    if (process.env.NAPI_RS_NATIVE_LIBRARY_PATH) {
        try {
            nativeBinding = (()=>{
                const e = new Error("Cannot find module as expression is too dynamic");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            })();
        } catch (err) {
            loadErrors.push(err);
        }
    } else if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else if ("TURBOPACK compile-time truthy", 1) {
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                return (()=>{
                    const e = new Error("Cannot find module './skia.win32-x64-msvc.node'");
                    e.code = 'MODULE_NOT_FOUND';
                    throw e;
                })();
            } catch (e) {
                loadErrors.push(e);
            }
            try {
                return (()=>{
                    throw new Error('could not resolve "' + '@napi-rs/canvas-win32-x64-msvc' + '" into a module');
                })();
            } catch (e) {
                loadErrors.push(e);
            }
        } else //TURBOPACK unreachable
        ;
    } else //TURBOPACK unreachable
    ;
}
nativeBinding = requireNative();
if (!nativeBinding || process.env.NAPI_RS_FORCE_WASI) {
    try {
        nativeBinding = (()=>{
            const e = new Error("Cannot find module './skia.wasi.cjs'");
            e.code = 'MODULE_NOT_FOUND';
            throw e;
        })();
    } catch (err) {
        if (process.env.NAPI_RS_FORCE_WASI) {
            loadErrors.push(err);
        }
    }
    if (!nativeBinding) {
        try {
            nativeBinding = (()=>{
                const e = new Error("Cannot find module '@napi-rs/canvas-wasm32-wasi'");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            })();
        } catch (err) {
            if (process.env.NAPI_RS_FORCE_WASI) {
                loadErrors.push(err);
            }
        }
    }
}
if (!nativeBinding) {
    if (loadErrors.length > 0) {
        // TODO Link to documentation with potential fixes
        //  - The package owner could build/publish bindings for this arch
        //  - The user may need to bundle the correct files
        //  - The user may need to re-install node_modules to get new packages
        throw new Error('Failed to load native binding', {
            cause: loadErrors
        });
    }
    throw new Error(`Failed to load native binding`);
}
module.exports.GlobalFonts = nativeBinding.GlobalFonts;
module.exports.CanvasElement = nativeBinding.CanvasElement;
module.exports.CanvasGradient = nativeBinding.CanvasGradient;
module.exports.CanvasPattern = nativeBinding.CanvasPattern;
module.exports.CanvasRenderingContext2D = nativeBinding.CanvasRenderingContext2D;
module.exports.FontKey = nativeBinding.FontKey;
module.exports.Image = nativeBinding.Image;
module.exports.ImageData = nativeBinding.ImageData;
module.exports.Path = nativeBinding.Path;
module.exports.SVGCanvas = nativeBinding.SVGCanvas;
module.exports.ChromaSubsampling = nativeBinding.ChromaSubsampling;
module.exports.clearAllCache = nativeBinding.clearAllCache;
module.exports.convertSVGTextToPath = nativeBinding.convertSVGTextToPath;
module.exports.FillType = nativeBinding.FillType;
module.exports.PathOp = nativeBinding.PathOp;
module.exports.StrokeCap = nativeBinding.StrokeCap;
module.exports.StrokeJoin = nativeBinding.StrokeJoin;
module.exports.SvgExportFlag = nativeBinding.SvgExportFlag;
}),
"[project]/node_modules/@napi-rs/canvas/geometry.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { inspect } = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/*
 * vendored in order to fix its dependence on the window global [cds 2020/08/04]
 * otherwise unchanged from https://github.com/jarek-foksa/geometry-polyfill/tree/f36bbc8f4bc43539d980687904ce46c8e915543d
 */ // @info
//   DOMPoint polyfill
// @src
//   https://drafts.fxtf.org/geometry/#DOMPoint
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_point_read_only.cc
class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static fromPoint(otherPoint) {
        return new DOMPoint(otherPoint.x, otherPoint.y, otherPoint.z !== undefined ? otherPoint.z : 0, otherPoint.w !== undefined ? otherPoint.w : 1);
    }
    matrixTransform(matrix) {
        if ((matrix.is2D || matrix instanceof SVGMatrix) && this.z === 0 && this.w === 1) {
            return new DOMPoint(this.x * matrix.a + this.y * matrix.c + matrix.e, this.x * matrix.b + this.y * matrix.d + matrix.f, 0, 1);
        } else {
            return new DOMPoint(this.x * matrix.m11 + this.y * matrix.m21 + this.z * matrix.m31 + this.w * matrix.m41, this.x * matrix.m12 + this.y * matrix.m22 + this.z * matrix.m32 + this.w * matrix.m42, this.x * matrix.m13 + this.y * matrix.m23 + this.z * matrix.m33 + this.w * matrix.m43, this.x * matrix.m14 + this.y * matrix.m24 + this.z * matrix.m34 + this.w * matrix.m44);
        }
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w
        };
    }
}
// @info
//   DOMRect polyfill
// @src
//   https://drafts.fxtf.org/geometry/#DOMRect
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_rect_read_only.cc
class DOMRect {
    constructor(x = 0, y = 0, width = 0, height = 0){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    static fromRect(otherRect) {
        return new DOMRect(otherRect.x, otherRect.y, otherRect.width, otherRect.height);
    }
    get top() {
        return this.y;
    }
    get left() {
        return this.x;
    }
    get right() {
        return this.x + this.width;
    }
    get bottom() {
        return this.y + this.height;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            top: this.top,
            left: this.left,
            right: this.right,
            bottom: this.bottom
        };
    }
}
for (const propertyName of [
    'top',
    'right',
    'bottom',
    'left'
]){
    const propertyDescriptor = Object.getOwnPropertyDescriptor(DOMRect.prototype, propertyName);
    propertyDescriptor.enumerable = true;
    Object.defineProperty(DOMRect.prototype, propertyName, propertyDescriptor);
}
// @info
//   DOMMatrix polyfill (SVG 2)
// @src
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_matrix_read_only.cc
//   https://github.com/tocharomera/generativecanvas/blob/master/node-canvas/lib/DOMMatrix.js
const M11 = 0, M12 = 1, M13 = 2, M14 = 3;
const M21 = 4, M22 = 5, M23 = 6, M24 = 7;
const M31 = 8, M32 = 9, M33 = 10, M34 = 11;
const M41 = 12, M42 = 13, M43 = 14, M44 = 15;
const A = M11, B = M12;
const C = M21, D = M22;
const E = M41, F = M42;
const DEGREE_PER_RAD = 180 / Math.PI;
const RAD_PER_DEGREE = Math.PI / 180;
const VALUES = Symbol('values');
const IS_2D = Symbol('is2D');
function parseMatrix(init) {
    let parsed = init.replace(/matrix\(/, '').split(/,/, 7);
    if (parsed.length !== 6) {
        throw new Error(`Failed to parse ${init}`);
    }
    parsed = parsed.map(parseFloat);
    return [
        parsed[0],
        parsed[1],
        0,
        0,
        parsed[2],
        parsed[3],
        0,
        0,
        0,
        0,
        1,
        0,
        parsed[4],
        parsed[5],
        0,
        1
    ];
}
function parseMatrix3d(init) {
    const parsed = init.replace(/matrix3d\(/, '').split(/,/, 17);
    if (parsed.length !== 16) {
        throw new Error(`Failed to parse ${init}`);
    }
    return parsed.map(parseFloat);
}
function parseTransform(tform) {
    const type = tform.split(/\(/, 1)[0];
    if (type === 'matrix') {
        return parseMatrix(tform);
    } else if (type === 'matrix3d') {
        return parseMatrix3d(tform);
    } else {
        throw new Error(`${type} parsing not implemented`);
    }
}
const setNumber2D = (receiver, index, value)=>{
    if (typeof value !== 'number') {
        throw new TypeError('Expected number');
    }
    receiver[VALUES][index] = value;
};
const setNumber3D = (receiver, index, value)=>{
    if (typeof value !== 'number') {
        throw new TypeError('Expected number');
    }
    if (index === M33 || index === M44) {
        if (value !== 1) {
            receiver[IS_2D] = false;
        }
    } else if (value !== 0) {
        receiver[IS_2D] = false;
    }
    receiver[VALUES][index] = value;
};
const newInstance = (values)=>{
    const instance = Object.create(DOMMatrix.prototype);
    instance.constructor = DOMMatrix;
    instance[IS_2D] = true;
    instance[VALUES] = values;
    return instance;
};
const multiply = (first, second)=>{
    const dest = new Float64Array(16);
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            let sum = 0;
            for(let k = 0; k < 4; k++){
                sum += first[i * 4 + k] * second[k * 4 + j];
            }
            dest[i * 4 + j] = sum;
        }
    }
    return dest;
};
class DOMMatrix {
    get m11() {
        return this[VALUES][M11];
    }
    set m11(value) {
        setNumber2D(this, M11, value);
    }
    get m12() {
        return this[VALUES][M12];
    }
    set m12(value) {
        setNumber2D(this, M12, value);
    }
    get m13() {
        return this[VALUES][M13];
    }
    set m13(value) {
        setNumber3D(this, M13, value);
    }
    get m14() {
        return this[VALUES][M14];
    }
    set m14(value) {
        setNumber3D(this, M14, value);
    }
    get m21() {
        return this[VALUES][M21];
    }
    set m21(value) {
        setNumber2D(this, M21, value);
    }
    get m22() {
        return this[VALUES][M22];
    }
    set m22(value) {
        setNumber2D(this, M22, value);
    }
    get m23() {
        return this[VALUES][M23];
    }
    set m23(value) {
        setNumber3D(this, M23, value);
    }
    get m24() {
        return this[VALUES][M24];
    }
    set m24(value) {
        setNumber3D(this, M24, value);
    }
    get m31() {
        return this[VALUES][M31];
    }
    set m31(value) {
        setNumber3D(this, M31, value);
    }
    get m32() {
        return this[VALUES][M32];
    }
    set m32(value) {
        setNumber3D(this, M32, value);
    }
    get m33() {
        return this[VALUES][M33];
    }
    set m33(value) {
        setNumber3D(this, M33, value);
    }
    get m34() {
        return this[VALUES][M34];
    }
    set m34(value) {
        setNumber3D(this, M34, value);
    }
    get m41() {
        return this[VALUES][M41];
    }
    set m41(value) {
        setNumber2D(this, M41, value);
    }
    get m42() {
        return this[VALUES][M42];
    }
    set m42(value) {
        setNumber2D(this, M42, value);
    }
    get m43() {
        return this[VALUES][M43];
    }
    set m43(value) {
        setNumber3D(this, M43, value);
    }
    get m44() {
        return this[VALUES][M44];
    }
    set m44(value) {
        setNumber3D(this, M44, value);
    }
    get a() {
        return this[VALUES][A];
    }
    set a(value) {
        setNumber2D(this, A, value);
    }
    get b() {
        return this[VALUES][B];
    }
    set b(value) {
        setNumber2D(this, B, value);
    }
    get c() {
        return this[VALUES][C];
    }
    set c(value) {
        setNumber2D(this, C, value);
    }
    get d() {
        return this[VALUES][D];
    }
    set d(value) {
        setNumber2D(this, D, value);
    }
    get e() {
        return this[VALUES][E];
    }
    set e(value) {
        setNumber2D(this, E, value);
    }
    get f() {
        return this[VALUES][F];
    }
    set f(value) {
        setNumber2D(this, F, value);
    }
    get is2D() {
        return this[IS_2D];
    }
    get isIdentity() {
        const values = this[VALUES];
        return values[M11] === 1 && values[M12] === 0 && values[M13] === 0 && values[M14] === 0 && values[M21] === 0 && values[M22] === 1 && values[M23] === 0 && values[M24] === 0 && values[M31] === 0 && values[M32] === 0 && values[M33] === 1 && values[M34] === 0 && values[M41] === 0 && values[M42] === 0 && values[M43] === 0 && values[M44] === 1;
    }
    static fromMatrix(init) {
        if (init instanceof DOMMatrix) {
            return new DOMMatrix(init[VALUES]);
        } else if (init instanceof SVGMatrix) {
            return new DOMMatrix([
                init.a,
                init.b,
                init.c,
                init.d,
                init.e,
                init.f
            ]);
        } else {
            throw new TypeError('Expected DOMMatrix');
        }
    }
    static fromFloat32Array(init) {
        if (!(init instanceof Float32Array)) throw new TypeError('Expected Float32Array');
        return new DOMMatrix(init);
    }
    static fromFloat64Array(init) {
        if (!(init instanceof Float64Array)) throw new TypeError('Expected Float64Array');
        return new DOMMatrix(init);
    }
    // @type
    // (Float64Array) => void
    constructor(init){
        this[IS_2D] = true;
        this[VALUES] = new Float64Array([
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ]);
        // Parse CSS transformList
        if (typeof init === 'string') {
            if (init === '') {
                return;
            } else {
                const tforms = init.split(/\)\s+/, 20).map(parseTransform);
                if (tforms.length === 0) {
                    return;
                }
                init = tforms[0];
                for(let i = 1; i < tforms.length; i++){
                    init = multiply(tforms[i], init);
                }
            }
        }
        let i = 0;
        if (init && init.length === 6) {
            setNumber2D(this, A, init[i++]);
            setNumber2D(this, B, init[i++]);
            setNumber2D(this, C, init[i++]);
            setNumber2D(this, D, init[i++]);
            setNumber2D(this, E, init[i++]);
            setNumber2D(this, F, init[i++]);
        } else if (init && init.length === 16) {
            setNumber2D(this, M11, init[i++]);
            setNumber2D(this, M12, init[i++]);
            setNumber3D(this, M13, init[i++]);
            setNumber3D(this, M14, init[i++]);
            setNumber2D(this, M21, init[i++]);
            setNumber2D(this, M22, init[i++]);
            setNumber3D(this, M23, init[i++]);
            setNumber3D(this, M24, init[i++]);
            setNumber3D(this, M31, init[i++]);
            setNumber3D(this, M32, init[i++]);
            setNumber3D(this, M33, init[i++]);
            setNumber3D(this, M34, init[i++]);
            setNumber2D(this, M41, init[i++]);
            setNumber2D(this, M42, init[i++]);
            setNumber3D(this, M43, init[i++]);
            setNumber3D(this, M44, init[i]);
        } else if (init !== undefined) {
            throw new TypeError('Expected string or array.');
        }
    }
    dump() {
        const mat = this[VALUES];
        console.info([
            mat.slice(0, 4),
            mat.slice(4, 8),
            mat.slice(8, 12),
            mat.slice(12, 16)
        ]);
    }
    [inspect.custom](depth) {
        if (depth < 0) return '[DOMMatrix]';
        const { a, b, c, d, e, f, is2D, isIdentity } = this;
        if (this.is2D) {
            return `DOMMatrix ${inspect({
                a,
                b,
                c,
                d,
                e,
                f,
                is2D,
                isIdentity
            }, {
                colors: true
            })}`;
        } else {
            const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44, is2D, isIdentity } = this;
            return `DOMMatrix ${inspect({
                a,
                b,
                c,
                d,
                e,
                f,
                m11,
                m12,
                m13,
                m14,
                m21,
                m22,
                m23,
                m24,
                m31,
                m32,
                m33,
                m34,
                m41,
                m42,
                m43,
                m44,
                is2D,
                isIdentity
            }, {
                colors: true
            })}`;
        }
    }
    multiply(other) {
        return newInstance(this[VALUES]).multiplySelf(other);
    }
    multiplySelf(other) {
        this[VALUES] = multiply(other[VALUES], this[VALUES]);
        if (!other.is2D) {
            this[IS_2D] = false;
        }
        return this;
    }
    preMultiplySelf(other) {
        this[VALUES] = multiply(this[VALUES], other[VALUES]);
        if (!other.is2D) {
            this[IS_2D] = false;
        }
        return this;
    }
    translate(tx, ty, tz) {
        return newInstance(this[VALUES]).translateSelf(tx, ty, tz);
    }
    translateSelf(tx = 0, ty = 0, tz = 0) {
        this[VALUES] = multiply([
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            tx,
            ty,
            tz,
            1
        ], this[VALUES]);
        if (tz !== 0) {
            this[IS_2D] = false;
        }
        return this;
    }
    scale(scaleX, scaleY, scaleZ, originX, originY, originZ) {
        return newInstance(this[VALUES]).scaleSelf(scaleX, scaleY, scaleZ, originX, originY, originZ);
    }
    scale3d(scale, originX, originY, originZ) {
        return newInstance(this[VALUES]).scale3dSelf(scale, originX, originY, originZ);
    }
    scale3dSelf(scale, originX, originY, originZ) {
        return this.scaleSelf(scale, scale, scale, originX, originY, originZ);
    }
    scaleSelf(scaleX, scaleY, scaleZ, originX, originY, originZ) {
        // Not redundant with translate's checks because we need to negate the values later.
        if (typeof originX !== 'number') originX = 0;
        if (typeof originY !== 'number') originY = 0;
        if (typeof originZ !== 'number') originZ = 0;
        this.translateSelf(originX, originY, originZ);
        if (typeof scaleX !== 'number') scaleX = 1;
        if (typeof scaleY !== 'number') scaleY = scaleX;
        if (typeof scaleZ !== 'number') scaleZ = 1;
        this[VALUES] = multiply([
            scaleX,
            0,
            0,
            0,
            0,
            scaleY,
            0,
            0,
            0,
            0,
            scaleZ,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        this.translateSelf(-originX, -originY, -originZ);
        if (scaleZ !== 1 || originZ !== 0) {
            this[IS_2D] = false;
        }
        return this;
    }
    rotateFromVector(x, y) {
        return newInstance(this[VALUES]).rotateFromVectorSelf(x, y);
    }
    rotateFromVectorSelf(x = 0, y = 0) {
        const theta = x === 0 && y === 0 ? 0 : Math.atan2(y, x) * DEGREE_PER_RAD;
        return this.rotateSelf(theta);
    }
    rotate(rotX, rotY, rotZ) {
        return newInstance(this[VALUES]).rotateSelf(rotX, rotY, rotZ);
    }
    rotateSelf(rotX, rotY, rotZ) {
        if (rotY === undefined && rotZ === undefined) {
            rotZ = rotX;
            rotX = rotY = 0;
        }
        if (typeof rotY !== 'number') rotY = 0;
        if (typeof rotZ !== 'number') rotZ = 0;
        if (rotX !== 0 || rotY !== 0) {
            this[IS_2D] = false;
        }
        rotX *= RAD_PER_DEGREE;
        rotY *= RAD_PER_DEGREE;
        rotZ *= RAD_PER_DEGREE;
        let c = Math.cos(rotZ);
        let s = Math.sin(rotZ);
        this[VALUES] = multiply([
            c,
            s,
            0,
            0,
            -s,
            c,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        c = Math.cos(rotY);
        s = Math.sin(rotY);
        this[VALUES] = multiply([
            c,
            0,
            -s,
            0,
            0,
            1,
            0,
            0,
            s,
            0,
            c,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        c = Math.cos(rotX);
        s = Math.sin(rotX);
        this[VALUES] = multiply([
            1,
            0,
            0,
            0,
            0,
            c,
            s,
            0,
            0,
            -s,
            c,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        return this;
    }
    rotateAxisAngle(x, y, z, angle) {
        return newInstance(this[VALUES]).rotateAxisAngleSelf(x, y, z, angle);
    }
    rotateAxisAngleSelf(x = 0, y = 0, z = 0, angle = 0) {
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length === 0) {
            return this;
        }
        if (length !== 1) {
            x /= length;
            y /= length;
            z /= length;
        }
        angle *= RAD_PER_DEGREE;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const tx = t * x;
        const ty = t * y;
        this[VALUES] = multiply([
            tx * x + c,
            tx * y + s * z,
            tx * z - s * y,
            0,
            tx * y - s * z,
            ty * y + c,
            ty * z + s * x,
            0,
            tx * z + s * y,
            ty * z - s * x,
            t * z * z + c,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        if (x !== 0 || y !== 0) {
            this[IS_2D] = false;
        }
        return this;
    }
    skewX(sx) {
        return newInstance(this[VALUES]).skewXSelf(sx);
    }
    skewXSelf(sx) {
        if (typeof sx !== 'number') {
            return this;
        }
        const t = Math.tan(sx * RAD_PER_DEGREE);
        this[VALUES] = multiply([
            1,
            0,
            0,
            0,
            t,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        return this;
    }
    skewY(sy) {
        return newInstance(this[VALUES]).skewYSelf(sy);
    }
    skewYSelf(sy) {
        if (typeof sy !== 'number') {
            return this;
        }
        const t = Math.tan(sy * RAD_PER_DEGREE);
        this[VALUES] = multiply([
            1,
            t,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]);
        return this;
    }
    flipX() {
        return newInstance(multiply([
            -1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]));
    }
    flipY() {
        return newInstance(multiply([
            1,
            0,
            0,
            0,
            0,
            -1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ], this[VALUES]));
    }
    inverse() {
        return newInstance(this[VALUES].slice()).invertSelf();
    }
    invertSelf() {
        if (this[IS_2D]) {
            const det = this[VALUES][A] * this[VALUES][D] - this[VALUES][B] * this[VALUES][C];
            // Invertable
            if (det !== 0) {
                const newA = this[VALUES][D] / det;
                const newB = -this[VALUES][B] / det;
                const newC = -this[VALUES][C] / det;
                const newD = this[VALUES][A] / det;
                const newE = (this[VALUES][C] * this[VALUES][F] - this[VALUES][D] * this[VALUES][E]) / det;
                const newF = (this[VALUES][B] * this[VALUES][E] - this[VALUES][A] * this[VALUES][F]) / det;
                this.a = newA;
                this.b = newB;
                this.c = newC;
                this.d = newD;
                this.e = newE;
                this.f = newF;
                return this;
            } else {
                this[IS_2D] = false;
                this[VALUES] = [
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN
                ];
                return this;
            }
        } else {
            throw new Error('3D matrix inversion is not implemented.');
        }
    }
    setMatrixValue(transformList) {
        const temp = new DOMMatrix(transformList);
        this[VALUES] = temp[VALUES];
        this[IS_2D] = temp[IS_2D];
        return this;
    }
    transformPoint(point) {
        const x = point.x || 0;
        const y = point.y || 0;
        const z = point.z || 0;
        const w = point.w || 1;
        const values = this[VALUES];
        const nx = values[M11] * x + values[M21] * y + values[M31] * z + values[M41] * w;
        const ny = values[M12] * x + values[M22] * y + values[M32] * z + values[M42] * w;
        const nz = values[M13] * x + values[M23] * y + values[M33] * z + values[M43] * w;
        const nw = values[M14] * x + values[M24] * y + values[M34] * z + values[M44] * w;
        return new DOMPoint(nx, ny, nz, nw);
    }
    toFloat32Array() {
        return Float32Array.from(this[VALUES]);
    }
    toFloat64Array() {
        return this[VALUES].slice(0);
    }
    toJSON() {
        return {
            a: this.a,
            b: this.b,
            c: this.c,
            d: this.d,
            e: this.e,
            f: this.f,
            m11: this.m11,
            m12: this.m12,
            m13: this.m13,
            m14: this.m14,
            m21: this.m21,
            m22: this.m22,
            m23: this.m23,
            m24: this.m24,
            m31: this.m31,
            m32: this.m32,
            m33: this.m33,
            m34: this.m34,
            m41: this.m41,
            m42: this.m42,
            m43: this.m43,
            m44: this.m44,
            is2D: this.is2D,
            isIdentity: this.isIdentity
        };
    }
    toString() {
        if (this.is2D) {
            return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
        } else {
            return `matrix3d(${this[VALUES].join(', ')})`;
        }
    }
}
for (const propertyName of [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'm11',
    'm12',
    'm13',
    'm14',
    'm21',
    'm22',
    'm23',
    'm24',
    'm31',
    'm32',
    'm33',
    'm34',
    'm41',
    'm42',
    'm43',
    'm44',
    'is2D',
    'isIdentity'
]){
    const propertyDescriptor = Object.getOwnPropertyDescriptor(DOMMatrix.prototype, propertyName);
    propertyDescriptor.enumerable = true;
    Object.defineProperty(DOMMatrix.prototype, propertyName, propertyDescriptor);
}
module.exports = {
    DOMPoint,
    DOMMatrix,
    DOMRect
};
}),
"[project]/node_modules/@napi-rs/canvas/load-image.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const { Readable } = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
const { URL } = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const { Image } = __turbopack_context__.r("[project]/node_modules/@napi-rs/canvas/js-binding.js [app-route] (ecmascript)");
let http, https;
const MAX_REDIRECTS = 20;
const REDIRECT_STATUSES = new Set([
    301,
    302
]);
/**
 * Loads the given source into canvas Image
 * @param {string|URL|Image|Buffer} source The image source to be loaded
 * @param {object} options Options passed to the loader
 */ module.exports = async function loadImage(source, options = {}) {
    // use the same buffer without copying if the source is a buffer
    if (Buffer.isBuffer(source) || source instanceof Uint8Array) return createImage(source, options.alt);
    // load readable stream as image
    if (source instanceof Readable) return createImage(await consumeStream(source), options.alt);
    // construct a Uint8Array if the source is ArrayBuffer or SharedArrayBuffer
    if (source instanceof ArrayBuffer || source instanceof SharedArrayBuffer) return createImage(new Uint8Array(source), options.alt);
    // construct a buffer if the source is buffer-like
    if (isBufferLike(source)) return createImage(Buffer.from(source), options.alt);
    // if the source is Image instance, copy the image src to new image
    if (source instanceof Image) return createImage(source.src, options.alt);
    // if source is string and in data uri format, construct image using data uri
    if (typeof source === 'string' && source.trimStart().startsWith('data:')) {
        const commaIdx = source.indexOf(',');
        const encoding = source.lastIndexOf('base64', commaIdx) < 0 ? 'utf-8' : 'base64';
        const data = Buffer.from(source.slice(commaIdx + 1), encoding);
        return createImage(data, options.alt);
    }
    // if source is a string or URL instance
    if (typeof source === 'string') {
        // if the source exists as a file, construct image from that file
        if (!source.startsWith('http') && !source.startsWith('https') && await exists(source)) {
            return createImage(source, options.alt);
        } else {
            // the source is a remote url here
            source = new URL(source);
            // attempt to download the remote source and construct image
            const data = await new Promise((resolve, reject)=>makeRequest(source, resolve, reject, typeof options.maxRedirects === 'number' && options.maxRedirects >= 0 ? options.maxRedirects : MAX_REDIRECTS, options.requestOptions));
            return createImage(data, options.alt);
        }
    }
    if (source instanceof URL) {
        if (source.protocol === 'file:') {
            // remove the leading slash on windows
            return createImage(("TURBOPACK compile-time truthy", 1) ? source.pathname.substring(1) : "TURBOPACK unreachable", options.alt);
        } else {
            const data = await new Promise((resolve, reject)=>makeRequest(source, resolve, reject, typeof options.maxRedirects === 'number' && options.maxRedirects >= 0 ? options.maxRedirects : MAX_REDIRECTS, options.requestOptions));
            return createImage(data, options.alt);
        }
    }
    // throw error as don't support that source
    throw new TypeError('unsupported image source');
};
function makeRequest(url, resolve, reject, redirectCount, requestOptions) {
    const isHttps = url.protocol === 'https:';
    // lazy load the lib
    const lib = isHttps ? !https ? https = __turbopack_context__.r("[externals]/https [external] (https, cjs)") : https : !http ? http = __turbopack_context__.r("[externals]/http [external] (http, cjs)") : http;
    lib.get(url.toString(), requestOptions || {}, (res)=>{
        try {
            const shouldRedirect = REDIRECT_STATUSES.has(res.statusCode) && typeof res.headers.location === 'string';
            if (shouldRedirect && redirectCount > 0) return makeRequest(new URL(res.headers.location, url.origin), resolve, reject, redirectCount - 1, requestOptions);
            if (typeof res.statusCode === 'number' && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error(`remote source rejected with status code ${res.statusCode}`));
            }
            consumeStream(res).then(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }).on('error', reject);
}
// use stream/consumers in the future?
function consumeStream(res) {
    return new Promise((resolve, reject)=>{
        const chunks = [];
        res.on('data', (chunk)=>chunks.push(chunk));
        res.on('end', ()=>resolve(Buffer.concat(chunks)));
        res.on('error', reject);
    });
}
function createImage(src, alt) {
    return new Promise((resolve, reject)=>{
        const image = new Image();
        if (typeof alt === 'string') image.alt = alt;
        image.onload = ()=>resolve(image);
        image.onerror = (e)=>reject(e);
        image.src = src;
    });
}
function isBufferLike(src) {
    return src && src.type === 'Buffer' || Array.isArray(src);
}
async function exists(path) {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
        return true;
    } catch  {
        return false;
    }
}
}),
"[project]/node_modules/@napi-rs/canvas/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { platform, homedir } = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const { join } = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
const { clearAllCache, CanvasRenderingContext2D, CanvasElement, SVGCanvas, Path: Path2D, ImageData, Image, FontKey, GlobalFonts, PathOp, FillType, StrokeJoin, StrokeCap, convertSVGTextToPath } = __turbopack_context__.r("[project]/node_modules/@napi-rs/canvas/js-binding.js [app-route] (ecmascript)");
const { DOMPoint, DOMMatrix, DOMRect } = __turbopack_context__.r("[project]/node_modules/@napi-rs/canvas/geometry.js [app-route] (ecmascript)");
const loadImage = __turbopack_context__.r("[project]/node_modules/@napi-rs/canvas/load-image.js [app-route] (ecmascript)");
const SvgExportFlag = {
    ConvertTextToPaths: 0x01,
    NoPrettyXML: 0x02,
    RelativePathEncoding: 0x04
};
if (!('families' in GlobalFonts)) {
    Object.defineProperty(GlobalFonts, 'families', {
        get: function() {
            return JSON.parse(GlobalFonts.getFamilies().toString());
        }
    });
}
if (!('has' in GlobalFonts)) {
    Object.defineProperty(GlobalFonts, 'has', {
        value: function has(name) {
            return !!JSON.parse(GlobalFonts.getFamilies().toString()).find(({ family })=>family === name);
        },
        configurable: false,
        enumerable: false,
        writable: false
    });
}
const _toBlob = CanvasElement.prototype.toBlob;
const _convertToBlob = CanvasElement.prototype.convertToBlob;
if ('Blob' in globalThis) {
    CanvasElement.prototype.toBlob = function toBlob(callback, mimeType, quality) {
        _toBlob.call(this, function(/** @type {Uint8Array} */ imageBuffer) {
            const blob = new Blob([
                imageBuffer.buffer
            ], {
                type: mimeType
            });
            callback(blob);
        }, mimeType, quality);
    };
    CanvasElement.prototype.convertToBlob = function convertToBlob(options) {
        return _convertToBlob.call(this, options).then((/** @type {Uint8Array} */ imageBuffer)=>{
            const blob = new Blob([
                imageBuffer.buffer
            ], {
                type: options?.mime || 'image/png'
            });
            return blob;
        });
    };
} else {
    // oxlint-disable-next-line no-unused-vars
    CanvasElement.prototype.toBlob = function toBlob(callback, mimeType, quality) {
        callback(null);
    };
    // oxlint-disable-next-line no-unused-vars
    CanvasElement.prototype.convertToBlob = function convertToBlob(options) {
        return Promise.reject(new Error('Blob is not supported in this environment'));
    };
}
const _getTransform = CanvasRenderingContext2D.prototype.getTransform;
CanvasRenderingContext2D.prototype.getTransform = function getTransform() {
    const transform = _getTransform.apply(this, arguments);
    // monkey patched, skip
    if (transform instanceof DOMMatrix) {
        return transform;
    }
    const { a, b, c, d, e, f } = transform;
    return new DOMMatrix([
        a,
        b,
        c,
        d,
        e,
        f
    ]);
};
// Workaround for webpack bundling issue with drawImage
// Store the original drawImage method
const _drawImage = CanvasRenderingContext2D.prototype.drawImage;
// Override drawImage to ensure proper type recognition in bundled environments
CanvasRenderingContext2D.prototype.drawImage = function drawImage(image, ...args) {
    // If the image is a Canvas-like object but not recognized due to bundling,
    // we need to ensure it's properly identified
    if (image && typeof image === 'object') {
        // First check if it's a wrapped canvas object
        if (image.canvas instanceof CanvasElement || image.canvas instanceof SVGCanvas) {
            image = image.canvas;
        } else if (image._canvas instanceof CanvasElement || image._canvas instanceof SVGCanvas) {
            image = image._canvas;
        } else if (typeof image.getContext === 'function' && image.width && image.height) {
            // If it has canvas properties but isn't recognized as CanvasElement or SVGCanvas,
            // try to correct the prototype chain
            if (!(image instanceof CanvasElement) && !(image instanceof SVGCanvas)) {
                // Try to create a proper CanvasElement from the canvas-like object
                // This helps when webpack has transformed the prototype chain
                Object.setPrototypeOf(image, CanvasElement.prototype);
            }
        }
    }
    // Call the original drawImage with the potentially corrected image
    return _drawImage.apply(this, [
        image,
        ...args
    ]);
};
function createCanvas(width, height, flag) {
    const isSvgBackend = typeof flag !== 'undefined';
    return isSvgBackend ? new SVGCanvas(width, height, flag) : new CanvasElement(width, height);
}
class Canvas {
    constructor(width, height, flag){
        return createCanvas(width, height, flag);
    }
    static [Symbol.hasInstance](instance) {
        return instance instanceof CanvasElement || instance instanceof SVGCanvas;
    }
}
if (!process.env.DISABLE_SYSTEM_FONTS_LOAD) {
    GlobalFonts.loadSystemFonts();
    const platformName = platform();
    const homedirPath = homedir();
    switch(platformName){
        case 'win32':
            GlobalFonts.loadFontsFromDir(join(homedirPath, 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts'));
            break;
        case 'darwin':
            GlobalFonts.loadFontsFromDir(join(homedirPath, 'Library', 'Fonts'));
            break;
        case 'linux':
            GlobalFonts.loadFontsFromDir(join('usr', 'local', 'share', 'fonts'));
            GlobalFonts.loadFontsFromDir(join(homedirPath, '.fonts'));
            break;
    }
}
module.exports = {
    clearAllCache,
    Canvas,
    createCanvas,
    Path2D,
    ImageData,
    Image,
    PathOp,
    FillType,
    StrokeCap,
    StrokeJoin,
    SvgExportFlag,
    GlobalFonts: GlobalFonts,
    convertSVGTextToPath,
    DOMPoint,
    DOMMatrix,
    DOMRect,
    loadImage,
    FontKey,
    // Export these for better webpack compatibility
    CanvasElement,
    SVGCanvas
};
}),
"[externals]/pdf-parse [external] (pdf-parse, cjs, [project]/node_modules/pdf-parse)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdf-parse-08f4573089f02674", () => require("pdf-parse-08f4573089f02674"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_k~.bp._.js.map