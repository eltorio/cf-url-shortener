# 👷 `cf-url-shortener` Cloudflare URL Shortener

Cloudflare worker project for shortenning URLs

[`index.js`](https://github.com/cloudflare/worker-template/blob/master/index.js) is the content of the Workers script.

#### Wrangler

To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate cf-url-shortener https://github.com/cloudflare/worker-template
wrangler kv:namespace create "shorturl" --preview
# rember to declare the output in the wrangler.toml
```

Further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).
