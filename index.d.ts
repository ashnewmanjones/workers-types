interface FetchEvent {
  passThroughOnException: () => void
}

interface RequestInit {
  cf?: {
    cacheEverything?: boolean
    scrapeShield?: boolean
    apps?: boolean
    image?: {
      /**
       * Maximum width in image pixels. The value must be an integer.
       */
      width?: number
      /**
       * Maximum height in image pixels.
       */
      height?: number
      /**
       * Resizing mode as a string. It affects interpretation of width and height
       * options:
       *  - scale-down: Similar to contain, but the image is never enlarged. If
       *    the image is larger than given width or height, it will be resized.
       *    Otherwise its original size will be kept.
       *  - contain: Resizes to maximum size that fits within the given width and
       *    height. If only a single dimension is given (e.g. only width), the
       *    image will be shrunk or enlarged to exactly match that dimension.
       *    Aspect ratio is always preserved.
       *  - cover: Resizes (shrinks or enlarges) to fill the entire area of width
       *    and height. If the image has an aspect ratio different from the ratio
       *    of width and height, it will be cropped to fit.
       */
      fit?: 'scale-down' | 'contain' | 'cover'
      /**
       * When cropping with fit: "cover", this defines the side or point that should
       * be left uncropped. The value is either a string
       * "left", "right", "top", "bottom" or "center" (the default),
       * or an object {x, y} containing focal point coordinates in the original
       * image expressed as fractions ranging from 0.0 (top or left) to 1.0
       * (bottom or right), 0.5 being the center. {fit: "cover", gravity: "top"} will
       * crop bottom or left and right sides as necessary, but won’t crop anything
       * from the top. {fit: "cover", gravity: {x:0.5, y:0.2}} will crop each side to
       * preserve as much as possible around a point at 20% of the height of the
       * source image.
       */
      gravity?: 'left' | 'right' | 'top' | 'bottom' | 'center' | { x: number; y: number }
      /**
       * Quality setting from 1-100 (useful values are in 60-90 range). Lower values
       * make images look worse, but load faster. The default is 85. It applies only
       * to JPEG and WebP images. It doesn’t have any effect on PNG.
       */
      quality?: number
      /**
       * Output format to generate. It can be:
       *  - webp: generate images in Google WebP format. Set quality to 100 to get
       *    the WebP-lossles format.
       *  - json: instead of generating an image, outputs information about the
       *    image, in JSON format. The JSON object will contain image size
       *    (before and after resizing), source image’s MIME type, file size, etc.
       */
      format?: 'webp' | 'json'
    }
    minify?: {
      javascript?: boolean
      css?: boolean
      html?: boolean
    }
    mirage?: boolean
    /**
     * Redirects the request to an alternate origin server. You can use this,
     * for example, to implement load balancing across several origins.
     * (e.g.us-east.example.com)
     *
     * Note - For security reasons, the hostname set in resolveOverride must
     * be proxied on the same Cloudflare zone of the incoming request.
     * Otherwise, the setting is ignored. CNAME hosts are allowed, so to
     * resolve to a host under a different domain or a DNS only domain first
     * declare a CNAME record within your own zone’s DNS mapping to the
     * external hostname, set proxy on Cloudflare, then set resolveOverride
     * to point to that CNAME record.
     */
    resolveOverride?: string
  }
}

declare function addEventListener(
  type: 'fetch',
  handler: (event: FetchEvent) => void,
): undefined | null | Response | Promise<Response>

interface Request {
  /**
   * In addition to the properties on the standard Request object,
   * you can use a request.cf object to control how Cloudflare
   * features are applied as well as other custom information provided
   * by Cloudflare.
   *
   * Note: Currently, settings in the cf object cannot be tested in the
   * playground.
   */
  cf: {
    /**
     *  (e.g. 395747)
     */
    asn: string
    city: string
    clientTrustScore: number
    /**
     * The three-letter airport code of the data center that the request
     * hit. (e.g. "DFW")
     */
    colo: string
    continent: string
    /**
     * The two-letter country code in the request. This is the same value
     * as that provided in the CF-IPCountry header. (e.g. "US")
     */
    country: string
    httpProtocol: string
    latitude: number
    longitude: number
    postalCode: string
    /**
     * e.g. "Texas"
     */
    region: string
    /**
     * e.g. "TX"
     */
    regionCode: string
    /**
     * e.g. "weight=256;exclusive=1"
     */
    requestPriority: string
    /**
     * e.g. "America/Chicago"
     */
    timezone: string
    tlsVersion: string
    tlsCipher: string
    tlsClientAuth: {
      certIssuerDNLegacy: string
      certIssuerDN: string
      certPresented: '0' | '1'
      certSubjectDNLegacy: string
      certSubjectDN: string
      certNotBefore: string // In format "Dec 22 19:39:00 2018 GMT"
      certNotAfter: string // In format "Dec 22 19:39:00 2018 GMT"
      certSerial: string
      certFingerprintSHA1: string
      certVerified: string // “SUCCESS”, “FAILED:reason”, “NONE”
    }
  }
}

type KVValue<Value> = Promise<Value | null>

declare module '@cloudflare/workers-types' {
  export interface KVNamespace {
    get(key: string): KVValue<string>
    get(key: string, type: 'text'): KVValue<string>
    get<ExpectedValue = unknown>(key: string, type: 'json'): KVValue<ExpectedValue>
    get(key: string, type: 'arrayBuffer'): KVValue<ArrayBuffer>
    get(key: string, type: 'stream'): KVValue<ReadableStream>

    put(
      key: string,
      value: string | ReadableStream | ArrayBuffer | FormData,
      options?: {
        expiration?: string | number
        expirationTtl?: string | number
      },
    ): Promise<void>

    delete(key: string): Promise<void>

    list(options: {
      prefix?: string
      limit?: number
      cursor?: string
    }): Promise<{
      keys: { name: string; expiration?: number }[]
      list_complete: boolean
      cursor: string
    }>
  }
}
