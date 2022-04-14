# 👷 `cf-url-shortener` Cloudflare URL Shortener

Cloudflare worker project for shortenning URLs

[`index.js`](https://github.com/cloudflare/worker-template/blob/master/index.js) is the content of the Workers script.

#### Wrangler

To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate cf-url-shortener https://github.com/cloudflare/worker-template
wrangler kv:namespace create "CfUrlShortener" --preview
# rember to declare the output in the wrangler.toml
```

Further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).

#### Auth0
All these Cloudflare variable must be set according to your AuthO app
AUTH0_CALLBACKURL	
AUTH0_CLIENT_ID	
AUTH0_CLIENT_SECRET	
AUTH0_DOMAIN
SALT

### wrangler.toml
Something like:
```
name = "cf-name
type = "webpack"

account_id = "#id"
workers_dev = false
route = "real_url/*"
zone_id = "#zone_id"
compatibility_date = "2022-01-02"

kv_namespaces = [ 
	 { binding = "CfUrlShortener", id = "id", preview_id = "preview_id" },
     { binding = "AuthStore", id = "id", preview_id = "preview_id" }
]

[site]
bucket = "./worker-public"
entry-point = "worker-code"
```
